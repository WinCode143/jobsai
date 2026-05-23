import "dotenv/config";
import { Worker } from "bullmq";
import { prisma } from "@/lib/prisma";
import { fetchRemoteOK, fetchRemotive, fetchWWR, fetchJobicy } from "@/lib/fetchers";
import { generateEmbedding, jobToEmbeddingText } from "@/lib/embeddings";
import { connection } from "@/lib/queue";
import type { RawJob } from "@/lib/types";

async function upsertJob(job: RawJob): Promise<void> {
  const embeddingText = jobToEmbeddingText(job);
  const embedding = await generateEmbedding(embeddingText);
  const vectorLiteral = `[${embedding.join(",")}]`;

  await prisma.$executeRaw`
    INSERT INTO "Job" (
      id, title, company, description, url, location,
      "salaryMin", "salaryMax", currency, tags, source, "postedAt", embedding, "createdAt"
    )
    VALUES (
      gen_random_uuid(), ${job.title}, ${job.company}, ${job.description},
      ${job.url}, ${job.location}, ${job.salaryMin}, ${job.salaryMax},
      ${job.currency}, ${job.tags}, ${job.source}, ${job.postedAt},
      ${vectorLiteral}::vector, NOW()
    )
    ON CONFLICT (url) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      embedding = EXCLUDED.embedding
  `;
}

const worker = new Worker(
  "job-sync",
  async () => {
    console.log("Starting job sync...");

    const [remoteok, remotive, wwr, jobicy] = await Promise.allSettled([
      fetchRemoteOK(),
      fetchRemotive(),
      fetchWWR(),
      fetchJobicy(),
    ]);

    const allJobs: RawJob[] = [
      ...(remoteok.status === "fulfilled" ? remoteok.value : []),
      ...(remotive.status === "fulfilled" ? remotive.value : []),
      ...(wwr.status === "fulfilled" ? wwr.value : []),
      ...(jobicy.status === "fulfilled" ? jobicy.value : []),
    ];

    console.log(`Fetched ${allJobs.length} jobs total`);

    let saved = 0;
    let failed = 0;

    for (const job of allJobs) {
      try {
        await upsertJob(job);
        saved++;
      } catch {
        failed++;
      }
    }

    console.log(`Sync complete: ${saved} saved, ${failed} failed`);
  },
  { connection }
);

worker.on("completed", () => console.log("Job sync worker completed"));
worker.on("failed", (_, err) => console.error("Job sync worker failed:", err));
