import type { RawJob } from "@/lib/types";

interface WorkingNomadsJob {
  url: string;
  title: string;
  description: string;
  company_name: string;
  category_name: string;
  tags: string;
  location: string | null;
  pub_date: string;
}

export async function fetchWorkingNomads(): Promise<RawJob[]> {
  const res = await fetch("https://www.workingnomads.com/api/exposed_jobs/?limit=100");
  if (!res.ok) throw new Error(`WorkingNomads fetch failed: ${res.status}`);

  const jobs = (await res.json()) as WorkingNomadsJob[];
  return jobs.map((j) => ({
    title: j.title,
    company: j.company_name,
    description: j.description ?? "",
    url: j.url,
    location: j.location || null,
    salaryMin: null,
    salaryMax: null,
    currency: null,
    tags: [j.category_name, ...(j.tags ? j.tags.split(",").map((t) => t.trim()).filter(Boolean) : [])],
    source: "workingnomads",
    postedAt: j.pub_date ? new Date(j.pub_date) : new Date(),
  }));
}
