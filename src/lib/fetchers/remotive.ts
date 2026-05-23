import type { RawJob } from "@/lib/types";

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  description: string;
  url: string;
  candidate_required_location: string;
  salary: string;
  tags: string[];
  publication_date: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

function parseSalary(salary: string): { min: number | null; max: number | null; currency: string | null } {
  if (!salary) return { min: null, max: null, currency: null };
  const match = salary.match(/(\$|€|£)?(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)/);
  if (!match) return { min: null, max: null, currency: null };
  const currency = match[1] === "$" ? "USD" : match[1] === "€" ? "EUR" : match[1] === "£" ? "GBP" : null;
  return {
    min: parseInt(match[2].replace(/,/g, "")),
    max: parseInt(match[3].replace(/,/g, "")),
    currency,
  };
}

export async function fetchRemotive(): Promise<RawJob[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?limit=100");
  if (!res.ok) throw new Error(`Remotive fetch failed: ${res.status}`);

  const { jobs } = (await res.json()) as RemotiveResponse;
  return jobs.map((j) => {
    const { min, max, currency } = parseSalary(j.salary);
    return {
      title: j.title,
      company: j.company_name,
      description: j.description,
      url: j.url,
      location: j.candidate_required_location || null,
      salaryMin: min,
      salaryMax: max,
      currency,
      tags: j.tags ?? [],
      source: "remotive",
      postedAt: new Date(j.publication_date),
    };
  });
}
