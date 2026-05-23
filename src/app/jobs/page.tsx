"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  tags: string[];
  source: string;
  postedAt: string;
}

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  wwr: "We Work Remotely",
  remotive: "Remotive",
  jobicy: "Jobicy",
  himalayas: "Himalayas",
  workingnomads: "Working Nomads",
};

const CATEGORIES = [
  { label: "Tecnología", slug: "tech" },
  { label: "Marketing", slug: "marketing" },
  { label: "Diseño", slug: "design" },
  { label: "Finanzas", slug: "finance" },
  { label: "Ventas", slug: "sales" },
  { label: "Soporte", slug: "customer-support" },
  { label: "RRHH", slug: "hr" },
  { label: "Legal", slug: "legal" },
];

const JOB_TYPES = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contrato", value: "contract" },
  { label: "Freelance", value: "freelance" },
];

const POSTED_OPTIONS = [
  { label: "Hoy", value: "today" },
  { label: "Esta semana", value: "week" },
  { label: "Este mes", value: "month" },
];

const SALARY_OPTIONS = [
  { label: "+$30k/año", value: "30000" },
  { label: "+$50k/año", value: "50000" },
  { label: "+$80k/año", value: "80000" },
  { label: "+$100k/año", value: "100000" },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Spain", "Brazil",
  "Argentina", "Mexico", "India", "Singapore", "Israel",
];

const REMOTE_LOCATIONS = new Set(["remote", "worldwide", "anywhere", "distributed", "global", "work from home"]);

function isRemoteLocation(loc: string | null) {
  if (!loc) return true;
  return REMOTE_LOCATIONS.has(loc.toLowerCase()) || loc.toLowerCase().includes("remote") || loc.toLowerCase().includes("worldwide");
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
  return `Hace ${Math.floor(days / 30)} meses`;
}

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return null;
  const sym = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
  const fmt = (n: number) => `${sym}${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `desde ${fmt(min)}`;
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";
  const source = searchParams.get("source") ?? "";
  const salary = searchParams.get("salary") ?? "";
  const posted = searchParams.get("posted") ?? "";
  const remote = searchParams.get("remote") === "true";
  const country = searchParams.get("country") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (source) params.set("source", source);
    if (salary) params.set("salary", salary);
    if (posted) params.set("posted", posted);
    if (remote) params.set("remote", "true");
    if (country) params.set("country", country);
    params.set("page", String(page));

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [q, category, type, source, salary, posted, remote, country, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/jobs?${params}`);
  }

  function toggleParam(key: string, value: string) {
    setParam(key, searchParams.get(key) === value ? "" : value);
  }

  function toggleRemote() {
    const params = new URLSearchParams(searchParams.toString());
    if (remote) {
      params.delete("remote");
      params.delete("country");
    } else {
      params.set("remote", "true");
      params.delete("country");
    }
    params.delete("page");
    router.push(`/jobs?${params}`);
  }

  const activeFilterCount = [category, type, source, salary, posted, remote ? "remote" : "", country].filter(Boolean).length;

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      {children}
    </div>
  );

  const FilterChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  const sidebar = (
    <div className="space-y-1">
      {/* Remote toggle */}
      <div className="mb-5">
        <button
          onClick={toggleRemote}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            remote
              ? "bg-green-50 border-green-300 text-green-700"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${remote ? "bg-green-500" : "bg-gray-300"}`} />
            Solo remotos
          </span>
          {remote && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">ON</span>}
        </button>
      </div>

      <div className="border-t border-gray-100 my-3" />

      <FilterSection title="Categoría">
        {CATEGORIES.map((c) => (
          <FilterChip key={c.slug} label={c.label} active={category === c.slug} onClick={() => toggleParam("category", c.slug)} />
        ))}
      </FilterSection>

      <div className="border-t border-gray-100 my-3" />

      {!remote && (
        <>
          <FilterSection title="País">
            <div className="max-h-44 overflow-y-auto pr-1 space-y-0.5">
              {COUNTRIES.map((c) => (
                <FilterChip key={c} label={c} active={country === c} onClick={() => toggleParam("country", c)} />
              ))}
            </div>
          </FilterSection>
          <div className="border-t border-gray-100 my-3" />
        </>
      )}

      <FilterSection title="Tipo de empleo">
        {JOB_TYPES.map((t) => (
          <FilterChip key={t.value} label={t.label} active={type === t.value} onClick={() => toggleParam("type", t.value)} />
        ))}
      </FilterSection>

      <div className="border-t border-gray-100 my-3" />

      <FilterSection title="Salario anual (USD)">
        {SALARY_OPTIONS.map((s) => (
          <FilterChip key={s.value} label={s.label} active={salary === s.value} onClick={() => toggleParam("salary", s.value)} />
        ))}
      </FilterSection>

      <div className="border-t border-gray-100 my-3" />

      <FilterSection title="Publicado">
        {POSTED_OPTIONS.map((p) => (
          <FilterChip key={p.value} label={p.label} active={posted === p.value} onClick={() => toggleParam("posted", p.value)} />
        ))}
      </FilterSection>

      <div className="border-t border-gray-100 my-3" />

      <FilterSection title="Fuente">
        {Object.entries(SOURCE_LABELS).map(([value, label]) => (
          <FilterChip key={value} label={label} active={source === value} onClick={() => toggleParam("source", value)} />
        ))}
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <div className="mb-5">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setParam("q", fd.get("q") as string); }}>
          <div className="flex gap-3">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por cargo, empresa o habilidad..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors text-sm">
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden px-4 py-3 border rounded-xl text-sm font-medium transition-colors relative ${
                activeFilterCount > 0 ? "border-indigo-400 text-indigo-600 bg-indigo-50" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Filtros {activeFilterCount > 0 && <span className="ml-1 bg-indigo-600 text-white text-xs rounded-full px-1.5">{activeFilterCount}</span>}
            </button>
          </div>
        </form>
      </div>

      {/* Active filters chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {remote && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Solo remotos
              <button onClick={toggleRemote} className="ml-1 hover:text-green-900">×</button>
            </span>
          )}
          {country && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {country}
              <button onClick={() => setParam("country", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {category && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {CATEGORIES.find((c) => c.slug === category)?.label ?? category}
              <button onClick={() => setParam("category", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {type && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {JOB_TYPES.find((t) => t.value === type)?.label ?? type}
              <button onClick={() => setParam("type", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {SALARY_OPTIONS.find((s) => s.value === salary)?.label ?? salary}
              <button onClick={() => setParam("salary", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {posted && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {POSTED_OPTIONS.find((p) => p.value === posted)?.label ?? posted}
              <button onClick={() => setParam("posted", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          {source && (
            <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {SOURCE_LABELS[source] ?? source}
              <button onClick={() => setParam("source", "")} className="ml-1 hover:text-indigo-900">×</button>
            </span>
          )}
          <button onClick={() => router.push("/jobs")} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 underline">
            Limpiar todo
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filtros</h2>
              {activeFilterCount > 0 && (
                <button onClick={() => router.push("/jobs")} className="text-xs text-indigo-600 hover:underline">
                  Limpiar ({activeFilterCount})
                </button>
              )}
            </div>
            {sidebar}
          </div>
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-72 bg-white p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filtros</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 text-xl">×</button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        {/* Job list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {loading ? "Cargando..." : `${total.toLocaleString()} ofertas encontradas`}
            </p>
            <Link href="/match" className="text-sm text-indigo-600 font-medium hover:underline">
              Match por CV →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-100 rounded-full w-16" />
                    <div className="h-5 bg-gray-100 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="font-medium text-gray-700">No encontramos ofertas con esos filtros</p>
              <p className="text-sm mt-2">Probá con otros términos o limpiá los filtros</p>
              <button onClick={() => router.push("/jobs")} className="mt-4 px-4 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50">
                Ver todas las ofertas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const sal = formatSalary(job.salaryMin, job.salaryMax, job.currency);
                const isRemote = isRemoteLocation(job.location);
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                            {job.title}
                          </h3>
                          {isRemote && (
                            <span className="flex-shrink-0 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                              Remote
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">{job.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1">
                        {timeAgo(job.postedAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {job.location && !isRemote && <span>📍 {job.location}</span>}
                      {sal && <span className="text-green-700 font-medium">💰 {sal}</span>}
                      <span className="text-gray-300">·</span>
                      <span>{SOURCE_LABELS[job.source] ?? job.source}</span>
                    </div>
                    {job.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{tag}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <button onClick={() => setParam("page", String(page - 1))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-indigo-300 bg-white">
                  ← Anterior
                </button>
              )}
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page + i - 3;
                if (p < 1 || p > pages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setParam("page", String(p))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              {page < pages && (
                <button onClick={() => setParam("page", String(page + 1))} className="px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-indigo-300 bg-white">
                  Siguiente →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>}>
      <JobsContent />
    </Suspense>
  );
}
