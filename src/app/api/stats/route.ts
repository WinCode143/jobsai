import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export async function GET() {
  const [total, sources] = await Promise.all([
    prisma.job.count(),
    prisma.job.groupBy({ by: ["source"], _count: true }),
  ]);

  return NextResponse.json({ total, sources: sources.length });
}
