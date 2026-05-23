import { prisma } from "@/lib/prisma";

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  url: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  tags: string[];
  source: string;
  postedAt: Date;
  similarityScore: number;
}

export async function findMatchingJobs(
  embedding: number[],
  limit = 20
): Promise<JobMatch[]> {
  const vectorLiteral = `[${embedding.join(",")}]`;

  const results = await prisma.$queryRaw<(JobMatch & { similarity: number })[]>`
    SELECT
      id, title, company, url, location,
      "salaryMin", "salaryMax", currency, tags, source, "postedAt",
      1 - (embedding <=> ${vectorLiteral}::vector) AS "similarityScore"
    FROM "Job"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorLiteral}::vector
    LIMIT ${limit}
  `;

  return results;
}

export async function saveSearchResult(
  userProfileId: string,
  matches: JobMatch[]
): Promise<void> {
  await prisma.searchResult.createMany({
    data: matches.map((m) => ({
      userProfileId,
      jobId: m.id,
      similarityScore: m.similarityScore,
    })),
    skipDuplicates: true,
  });
}
