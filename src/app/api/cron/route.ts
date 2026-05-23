import { NextResponse } from "next/server";
import { jobSyncQueue } from "@/lib/queue";

// Protected with a secret so only our cron service (or manual trigger) can call it
export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await jobSyncQueue.add("sync", {}, { removeOnComplete: true, removeOnFail: 100 });

  return NextResponse.json({ ok: true, message: "Job sync queued" });
}
