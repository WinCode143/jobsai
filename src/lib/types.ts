export type JobSource = "remoteok" | "wwr" | "remotive" | "jobicy";

export interface RawJob {
  title: string;
  company: string;
  description: string;
  url: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  tags: string[];
  source: JobSource;
  postedAt: Date;
}
