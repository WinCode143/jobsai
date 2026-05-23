"use client";

import { useState, useRef } from "react";
import Link from "next/link";

interface ParsedProfile {
  name: string | null;
  title: string | null;
  skills: string[];
  languages: string[];
  yearsOfExperience: number | null;
  industries: string[];
  preferredRoles: string[];
}

interface JobMatch {
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
  similarityScore: number;
}

interface MatchResponse {
  profile: ParsedProfile;
  matches: JobMatch[];
}

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK", wwr: "We Work Remotely", remotive: "Remotive", jobicy: "Jobicy",
};

function formatSalary(min: number | null, max: number | null, currency: string | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)}–${fmt(max)}`;
  if (min) return `+${fmt(min)}`;
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-green-100 text-green-700 border-green-200"
    : pct >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
      {pct}% match
    </span>
  );
}

export default function MatchPage() {
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") { setError("Solo se aceptan archivos PDF"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("El archivo no puede superar 5MB"); return; }
    setError(null);
    setFileName(file.name);
    setLoading(true);
    const formData = new FormData();
    formData.append("cv", file);
    const res = await fetch("/api/match", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Error procesando el CV"); setLoading(false); return; }
    setResult(data);
    setLoading(false);
  }

  if (result) {
    const { profile, matches } = result;
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.name ? `Hola, ${profile.name}` : "Tu perfil detectado"}
              </h1>
              {profile.title && <p className="text-indigo-600 font-medium mt-1">{profile.title}</p>}
            </div>
            <button
              onClick={() => { setResult(null); setFileName(null); }}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              Subir otro CV
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {profile.yearsOfExperience && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-700">{profile.yearsOfExperience}</div>
                <div className="text-purple-600 text-xs mt-1">Años de experiencia</div>
              </div>
            )}
            {profile.languages.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="font-semibold text-blue-700">{profile.languages.join(", ")}</div>
                <div className="text-blue-600 text-xs mt-1">Idiomas</div>
              </div>
            )}
            {profile.industries.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4">
                <div className="font-semibold text-green-700">{profile.industries.slice(0, 2).join(", ")}</div>
                <div className="text-green-600 text-xs mt-1">Industrias</div>
              </div>
            )}
          </div>

          {profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-medium mb-2">HABILIDADES DETECTADAS</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 12).map((s) => (
                  <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {matches.length} ofertas que coinciden con tu perfil
        </h2>

        <div className="space-y-3">
          {matches.map((job) => {
            const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
                    <p className="text-gray-600 text-sm mt-0.5">{job.company}</p>
                  </div>
                  <ScoreBadge score={job.similarityScore} />
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  {job.location && <span>📍 {job.location}</span>}
                  {salary && <span className="text-green-700 font-medium">💰 {salary}/año</span>}
                  <span>{SOURCE_LABELS[job.source] ?? job.source}</span>
                </div>
                {job.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.tags.slice(0, 5).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/jobs" className="text-sm text-indigo-600 hover:underline">
            Ver todas las ofertas disponibles →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl text-3xl mb-5">🤖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Match por CV con IA</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Cargá tu currículum y Gemini analiza tu perfil para encontrar las ofertas más compatibles de todo el mundo.
        </p>
      </div>

      <div
        className={`bg-white border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
          dragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {loading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <p className="font-semibold text-gray-800">Analizando tu CV...</p>
              <p className="text-sm text-gray-500 mt-1">Gemini está extrayendo tu perfil y buscando matches</p>
            </div>
            {fileName && <p className="text-xs text-gray-400">{fileName}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-5xl">📄</div>
            <div>
              <p className="text-xl font-semibold text-gray-800">Arrastrá tu CV aquí</p>
              <p className="text-gray-500 text-sm mt-1">o hacé click para seleccionar el archivo</p>
            </div>
            <p className="text-xs text-gray-400">Solo PDF · Máximo 5MB · Sin registro requerido</p>
          </div>
        )}

        {error && <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>}
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-500">
        {[
          { icon: "🔒", text: "Tu CV no se comparte con nadie" },
          { icon: "⚡", text: "Resultados en menos de 30 segundos" },
          { icon: "🌍", text: "Ofertas de todo el mundo" },
        ].map((item) => (
          <div key={item.text} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-xl mb-1">{item.icon}</div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
