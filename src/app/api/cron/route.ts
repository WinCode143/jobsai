import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerPath = path.join(process.cwd(), "src/jobs/sync-worker.ts");
  const tsxPath = path.join(process.cwd(), "node_modules/.bin/tsx");

  exec(`${tsxPath} ${workerPath}`, { env: process.env }, (err) => {
    if (err) console.error("Sync worker error:", err.message);
  });

  return NextResponse.json({ ok: true, message: "Job sync started" });
}
