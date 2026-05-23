import { NextResponse } from "next/server";
// @ts-expect-error pdf-parse lacks proper ESM types
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { parseCVText, profileToEmbeddingText } from "@/lib/cv-parser";
import { generateEmbedding } from "@/lib/embeddings";
import { findMatchingJobs, saveSearchResult } from "@/lib/matcher";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("cv") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No CV file provided" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { text: rawText } = await pdfParse(buffer);

  if (!rawText.trim()) {
    return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 400 });
  }

  const parsedProfile = await parseCVText(rawText);
  const embeddingText = profileToEmbeddingText(parsedProfile);
  const embedding = await generateEmbedding(embeddingText);
  const vectorLiteral = `[${embedding.join(",")}]`;

  const userProfile = await prisma.$executeRaw`
    INSERT INTO "UserProfile" (id, "rawCvText", "parsedProfile", embedding, "createdAt")
    VALUES (gen_random_uuid(), ${rawText}, ${JSON.stringify(parsedProfile)}::jsonb, ${vectorLiteral}::vector, NOW())
    RETURNING id
  `;

  // Re-query to get the ID since executeRaw doesn't return rows cleanly
  const saved = await prisma.userProfile.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const matches = await findMatchingJobs(embedding, 20);

  if (saved) {
    await saveSearchResult(saved.id, matches);
  }

  return NextResponse.json({
    profile: parsedProfile,
    matches,
    profileId: saved?.id,
  });
}
