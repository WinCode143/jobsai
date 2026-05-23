import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK", wwr: "We Work Remotely", remotive: "Remotive", jobicy: "Jobicy",
};

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: currency ?? "USD", maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)} / año`;
  if (min) return `desde ${fmt(min)} / año`;
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Publicado hoy";
  if (days === 1) return "Publicado ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  return `Hace ${Math.floor(days / 30)} meses`;
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true, title: true, company: true, description: true,
      url: true, location: true, salaryMin: true, salaryMax: true,
      currency: true, tags: true, source: true, postedAt: true,
    },
  });

  if (!job) notFound();

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/jobs" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
          ← Volver a ofertas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                <p className="text-lg text-gray-600">{job.company}</p>
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors text-sm"
              >
                Aplicar →
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{job.location}</span>
                </div>
              )}
              {salary && (
                <div className="flex items-center gap-1.5 text-green-700 font-medium">
                  <span>💰</span>
                  <span>{salary}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span>🔗</span>
                <span>{SOURCE_LABELS[job.source] ?? job.source}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span>🕐</span>
                <span>{timeAgo(new Date(job.postedAt))}</span>
              </div>
            </div>

            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div
              className="prose prose-gray max-w-none text-gray-700 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, "<br/>") }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Aplicar a esta posición</h2>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-5 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors mb-3"
            >
              Ver oferta original →
            </a>
            <p className="text-xs text-gray-500 text-center">
              Serás redirigido a {SOURCE_LABELS[job.source] ?? job.source}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="font-semibold text-indigo-900 mb-2">¿Esta oferta es para vos?</h3>
            <p className="text-sm text-indigo-700 mb-4">
              Subí tu CV y la IA calcula qué tan compatible sos con esta y miles de ofertas más.
            </p>
            <Link
              href="/match"
              className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Hacer match con mi CV
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
