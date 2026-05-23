import type { RawJob } from "@/lib/types";

interface HimalayasJob {
  title: string;
  companyName: string;
  description: string;
  applicationLink: string;
  locationRestrictions: string[] | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  categories: string[];
  employmentType: string | null;
  pubDate: string;
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
}

export async function fetchHimalayas(): Promise<RawJob[]> {
  const res = await fetch("https://himalayas.app/jobs/api?limit=100", {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Himalayas fetch failed: ${res.status}`);

  const data = (await res.json()) as HimalayasResponse;
  return (data.jobs ?? []).map((j) => ({
    title: j.title,
    company: j.companyName,
    description: j.description ?? "",
    url: j.applicationLink,
    location: j.locationRestrictions?.join(", ") || null,
    salaryMin: j.minSalary || null,
    salaryMax: j.maxSalary || null,
    currency: j.currency || null,
    tags: [...(j.categories ?? []), ...(j.employmentType ? [j.employmentType] : [])],
    source: "himalayas",
    postedAt: j.pubDate ? new Date(j.pubDate) : new Date(),
  }));
}
