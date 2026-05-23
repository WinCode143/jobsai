import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  { label: "Tecnología", icon: "💻", slug: "tech", count: "2.4k+" },
  { label: "Marketing", icon: "📣", slug: "marketing", count: "800+" },
  { label: "Diseño", icon: "🎨", slug: "design", count: "600+" },
  { label: "Finanzas", icon: "💰", slug: "finance", count: "400+" },
  { label: "Ventas", icon: "🤝", slug: "sales", count: "900+" },
  { label: "Atención al cliente", icon: "💬", slug: "customer-support", count: "700+" },
  { label: "Recursos Humanos", icon: "👥", slug: "hr", count: "300+" },
  { label: "Legal", icon: "⚖️", slug: "legal", count: "150+" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Subí tu CV", desc: "Cargá tu currículum en PDF. No hace falta crear una cuenta.", icon: "📄" },
  { step: "02", title: "La IA analiza tu perfil", desc: "Gemini extrae tus skills, experiencia e industrias automáticamente.", icon: "🤖" },
  { step: "03", title: "Recibís tus matches", desc: "Las ofertas más compatibles rankeadas por score de compatibilidad.", icon: "✨" },
];

export default async function Home() {
  const totalJobs = await prisma.job.count().catch(() => 0);
  const STATS = [
    { value: totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : "—", label: "Ofertas activas" },
    { value: "50+", label: "Países" },
    { value: "6", label: "Fuentes de empleo" },
    { value: "100%", label: "Gratis" },
  ];
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-700/50 rounded-full text-indigo-200 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Powered by Gemini AI
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Encontrá tu próximo<br />
              <span className="text-indigo-300">trabajo remoto</span><br />
              con inteligencia artificial
            </h1>
            <p className="text-lg text-indigo-200 mb-10 max-w-xl">
              Subí tu CV y la IA lo analiza para encontrar las ofertas más compatibles con tu perfil en todo el mundo. Sin registro, sin spam.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/match"
                className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-center"
              >
                Subir mi CV y encontrar trabajo
              </Link>
              <Link
                href="/jobs"
                className="px-8 py-4 border border-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-800 transition-colors text-center"
              >
                Explorar ofertas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Buscá por posición o empresa</h2>
          <form action="/jobs" method="GET" className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="q"
              placeholder="React developer, Marketing Manager, Data Analyst..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              name="category"
              className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorá por categoría</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/jobs?category=${cat.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {cat.label}
              </div>
              <div className="text-sm text-gray-500 mt-1">{cat.count} ofertas</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Cómo funciona</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              En menos de 2 minutos tenés tus mejores oportunidades laborales rankeadas por compatibilidad.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-indigo-500 tracking-widest mb-2">PASO {step.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/match"
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Empezar ahora — es gratis
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para encontrar tu trabajo ideal?</h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
            Miles de ofertas remotas de todo el mundo esperan tu perfil. La IA hace el trabajo duro por vos.
          </p>
          <Link
            href="/match"
            className="inline-block px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Subir mi CV ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
