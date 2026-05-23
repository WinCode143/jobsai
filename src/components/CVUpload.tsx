"use client";

import { useState, useRef } from "react";
import type { JobMatch } from "@/lib/matcher";
import type { ParsedProfile } from "@/lib/cv-parser";

interface MatchResponse {
  profile: ParsedProfile;
  matches: JobMatch[];
  profileId: string;
}

interface CVUploadProps {
  onResults: (data: MatchResponse) => void;
}

export function CVUpload({ onResults }: CVUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF");
      return;
    }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("cv", file);

    const res = await fetch("/api/match", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error procesando el CV");
      setLoading(false);
      return;
    }

    setLoading(false);
    onResults(data as MatchResponse);
  }

  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
        dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {loading ? (
        <div className="space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Analizando tu CV con IA...</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-5xl">📄</div>
          <p className="text-xl font-semibold text-gray-800">Subí tu CV</p>
          <p className="text-gray-500">Arrastrá un PDF o hacé click para seleccionar</p>
          <p className="text-sm text-gray-400">Máximo 5MB</p>
        </div>
      )}

      {error && (
        <p className="mt-4 text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
