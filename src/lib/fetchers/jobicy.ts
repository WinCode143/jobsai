import type { RawJob } from "@/lib/types";

interface JobicyJob {
  id: number;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  url: string;
  jobGeo: string;
  annualSalaryMin: number;
  annualSalaryMax: number;
  salaryCurrency: string;
  jobIndustry: string[];
  jobType: string[];
  pubDate: string;
}

interface JobicyResponse {
  jobs: JobicyJob[];
}

export async function fetchJobicy(): Promise<RawJob[]> {
  const res = await fetch("https://jobicy.com/api/v2/remote-jobs?count=50");
  if (!res.ok) throw new Error(`Jobicy fetch failed: ${res.status}`);

  const { jobs } = (await res.json()) as JobicyResponse;
  return jobs.map((j) => ({
    title: j.jobTitle,
    company: j.companyName,
    description: j.jobDescription ?? "",
    url: j.url,
    location: j.jobGeo || null,
    salaryMin: j.annualSalaryMin || null,
    salaryMax: j.annualSalaryMax || null,
    currency: j.salaryCurrency || null,
    tags: [...(j.jobIndustry ?? []), ...(j.jobType ?? [])],
    source: "jobicy",
    postedAt: new Date(j.pubDate),
  }));
}
