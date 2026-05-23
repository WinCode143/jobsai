import type { RawJob } from "@/lib/types";

interface RemoteOKJob {
  id: string;
  position: string;
  company: string;
  description: string;
  url: string;
  location: string;
  salary_min: number;
  salary_max: number;
  tags: string[];
  date: string;
}

export async function fetchRemoteOK(): Promise<RawJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    headers: { "User-Agent": "jobsai/1.0" },
  });
  if (!res.ok) throw new Error(`RemoteOK fetch failed: ${res.status}`);

  const data = (await res.json()) as RemoteOKJob[];
  // First item is a legal notice object, not a job
  return data
    .slice(1)
    .filter((j) => j.position && j.url)
    .map((j) => ({
      title: j.position,
      company: j.company ?? "Unknown",
      description: j.description ?? "",
      url: j.url,
      location: j.location || null,
      salaryMin: j.salary_min || null,
      salaryMax: j.salary_max || null,
      currency: j.salary_min ? "USD" : null,
      tags: j.tags ?? [],
      source: "remoteok",
      postedAt: new Date(j.date),
    }));
}
