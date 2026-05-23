"use client";

import { useState } from "react";
import { CVUpload } from "@/components/CVUpload";
import { JobCard } from "@/components/JobCard";
import type { JobMatch } from "@/lib/matcher";
import type { ParsedProfile } from "@/lib/cv-parser";

interface MatchResponse {
  profile: ParsedProfile;
  matches: JobMatch[];
  profileId: string;
}

export default function Home() {
  const [results, setResults] = useState<MatchResponse | null>(null);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Encontrá tu próximo trabajo remoto
          </h1>
          <p className="text-lg text-gray-600">
            Subí tu CV y la IA encuentra las mejores ofertas del mundo para vos
          </p>
        </div>

        <CVUpload onResults={setResults} />

        {results && (
          <div className="mt-12">
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">Tu perfil detectado</h2>
              <div className="flex flex-wrap gap-2">
                {results.profile.title && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {results.profile.title}
                  </span>
                )}
                {results.profile.yearsOfExperience && (
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                    {results.profile.yearsOfExperience} años de experiencia
                  </span>
                )}
                {results.profile.skills.slice(0, 8).map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {results.matches.length} ofertas que coinciden con tu perfil
            </h2>

            <div className="grid gap-4">
              {results.matches.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <button
              onClick={() => setResults(null)}
              className="mt-8 w-full py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Subir otro CV
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
