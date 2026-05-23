import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="font-bold text-xl text-white">JobsAI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Encontrá tu próximo trabajo remoto en todo el mundo. La IA analiza tu perfil y te conecta con las mejores oportunidades.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs" className="hover:text-white transition-colors">Todos los trabajos</Link></li>
              <li><Link href="/jobs?type=full-time" className="hover:text-white transition-colors">Full-time</Link></li>
              <li><Link href="/jobs?type=contract" className="hover:text-white transition-colors">Contratos</Link></li>
              <li><Link href="/jobs?mode=remote" className="hover:text-white transition-colors">100% Remoto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Categorías</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/jobs?category=tech" className="hover:text-white transition-colors">Tecnología</Link></li>
              <li><Link href="/jobs?category=marketing" className="hover:text-white transition-colors">Marketing</Link></li>
              <li><Link href="/jobs?category=design" className="hover:text-white transition-colors">Diseño</Link></li>
              <li><Link href="/jobs?category=finance" className="hover:text-white transition-colors">Finanzas</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} JobsAI. Todos los derechos reservados.</p>
          <p>Powered by Gemini AI</p>
        </div>
      </div>
    </footer>
  );
}
