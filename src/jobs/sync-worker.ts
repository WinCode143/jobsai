import "dotenv/config";
import { prisma } from "../lib/prisma";
import { fetchRemoteOK, fetchRemotive, fetchWWR, fetchJobicy, fetchHimalayas, fetchWorkingNomads } from "../lib/fetchers";
import { generateEmbedding, jobToEmbeddingText } from "../lib/embeddings";
import type { RawJob } from "../lib/types";

async function upsertJob(job: RawJob): Promise<void> {
  const embeddingText = jobToEmbeddingText(job);
  const embedding = await generateEmbedding(embeddingText);
  const vectorLiteral = `[${embedding.join(",")}]`;

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Job" (
      id, title, company, description, url, location,
      "salaryMin", "salaryMax", currency, tags, source, "postedAt", embedding, "createdAt"
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9::text[], $10, $11,
      '${vectorLiteral}'::vector, NOW()
    )
    ON CONFLICT (url) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      embedding = EXCLUDED.embedding
  `,
    job.title, job.company, job.description, job.url, job.location,
    job.salaryMin, job.salaryMax, job.currency, job.tags, job.source, job.postedAt
  );
}

async function runSync() {
  console.log(`[${new Date().toISOString()}] Starting job sync...`);

  const [remoteok, remotive, wwr, jobicy, himalayas, workingnomads] = await Promise.allSettled([
    fetchRemoteOK(),
    fetchRemotive(),
    fetchWWR(),
    fetchJobicy(),
    fetchHimalayas(),
    fetchWorkingNomads(),
  ]);

  const allJobs: RawJob[] = [
    ...(remoteok.status === "fulfilled" ? remoteok.value : []),
    ...(remotive.status === "fulfilled" ? remotive.value : []),
    ...(wwr.status === "fulfilled" ? wwr.value : []),
    ...(jobicy.status === "fulfilled" ? jobicy.value : []),
    ...(himalayas.status === "fulfilled" ? himalayas.value : []),
    ...(workingnomads.status === "fulfilled" ? workingnomads.value : []),
  ];

  if (remoteok.status === "rejected") console.error("RemoteOK failed:", remoteok.reason);
  if (remotive.status === "rejected") console.error("Remotive failed:", remotive.reason);
  if (wwr.status === "rejected") console.error("WWR failed:", wwr.reason);
  if (jobicy.status === "rejected") console.error("Jobicy failed:", jobicy.reason);
  if (himalayas.status === "rejected") console.error("Himalayas failed:", himalayas.reason);
  if (workingnomads.status === "rejected") console.error("WorkingNomads failed:", workingnomads.reason);

  console.log(`Fetched ${allJobs.length} jobs total`);

  let saved = 0;
  let failed = 0;

  for (const job of allJobs) {
    try {
      await upsertJob(job);
      saved++;
      if (saved % 50 === 0) console.log(`Progress: ${saved}/${allJobs.length}`);
    } catch (err) {
      failed++;
      if (failed <= 3) console.error("Failed to save job:", job.url, err);
    }
  }

  console.log(`[${new Date().toISOString()}] Sync complete: ${saved} saved, ${failed} failed`);
  await prisma.$disconnect();
}

runSync().catch((err) => {
  console.error("Sync crashed:", err);
  process.exit(1);
});
