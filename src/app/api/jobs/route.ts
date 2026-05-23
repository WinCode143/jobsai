import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CATEGORY_TAGS: Record<string, string[]> = {
  tech: ["software", "developer", "engineer", "programming", "devops", "data", "backend", "frontend", "fullstack", "mobile", "cloud", "security"],
  marketing: ["marketing", "seo", "content", "social media", "growth", "email", "paid", "ads", "brand"],
  design: ["design", "ui", "ux", "graphic", "product design", "figma", "illustrator", "creative"],
  finance: ["finance", "accounting", "bookkeeping", "controller", "cfo", "analyst", "fintech"],
  sales: ["sales", "account executive", "business development", "bdr", "sdr", "crm"],
  "customer-support": ["support", "customer success", "helpdesk", "customer service"],
  hr: ["hr", "human resources", "recruiting", "talent", "people ops"],
  legal: ["legal", "lawyer", "attorney", "compliance", "paralegal"],
};

const TYPE_TAGS: Record<string, string[]> = {
  "full-time": ["full-time", "fulltime", "full time"],
  "part-time": ["part-time", "parttime", "part time"],
  contract: ["contract", "contractor"],
  freelance: ["freelance", "freelancer"],
};

const REMOTE_KEYWORDS = ["remote", "worldwide", "anywhere", "work from home", "distributed", "global"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";
  const source = searchParams.get("source") ?? "";
  const salary = searchParams.get("salary") ?? "";
  const posted = searchParams.get("posted") ?? "";
  const remote = searchParams.get("remote") === "true";
  const country = searchParams.get("country") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  const andConditions: unknown[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (category && CATEGORY_TAGS[category]) {
    const tags = CATEGORY_TAGS[category];
    andConditions.push({
      OR: [
        { tags: { hasSome: tags } },
        ...tags.slice(0, 3).map((t) => ({ title: { contains: t, mode: "insensitive" } })),
      ],
    });
  }

  if (type && TYPE_TAGS[type]) {
    andConditions.push({ tags: { hasSome: TYPE_TAGS[type] } });
  }

  if (source) {
    where.source = source;
  }

  if (salary) {
    const min = parseInt(salary);
    if (!isNaN(min)) where.salaryMin = { gte: min };
  }

  if (posted) {
    const daysMap: Record<string, number> = { today: 1, week: 7, month: 30 };
    const days = daysMap[posted];
    if (days) where.postedAt = { gte: new Date(Date.now() - days * 86400000) };
  }

  if (remote) {
    andConditions.push({
      OR: [
        { location: null },
        ...REMOTE_KEYWORDS.map((kw) => ({ location: { contains: kw, mode: "insensitive" } })),
      ],
    });
  }

  if (country) {
    andConditions.push({ location: { contains: country, mode: "insensitive" } });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { postedAt: "desc" },
      skip: offset,
      take: limit,
      select: {
        id: true, title: true, company: true, url: true,
        location: true, salaryMin: true, salaryMax: true,
        currency: true, tags: true, source: true, postedAt: true,
      },
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
}
