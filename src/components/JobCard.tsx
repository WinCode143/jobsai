import type { JobMatch } from "@/lib/matcher";

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  wwr: "We Work Remotely",
  remotive: "Remotive",
  jobicy: "Jobicy",
};

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `desde ${fmt(min)}`;
  if (max) return `hasta ${fmt(max)}`;
}

export function JobCard({ job }: { job: JobMatch }) {
  const score = Math.round(job.similarityScore * 100);
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
          <p className="text-gray-600 text-sm mt-0.5">{job.company}</p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
              score >= 80
                ? "bg-green-100 text-green-700"
                : score >= 60
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {score}% match
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <span>📍</span> {job.location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1">
            <span>💰</span> {salary}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span>🔗</span> {SOURCE_LABELS[job.source] ?? job.source}
        </span>
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
