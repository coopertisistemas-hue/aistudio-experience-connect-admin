import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen p-6">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-display">
            Dom Pietro
            <span className="block text-emerald-400">Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            Transfers exclusivos, experiências únicas e concierge digital
            para hóspedes de alto padrão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="https://app.dompietro.com"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              Acessar App
            </a>
            <a
              href="#contato"
              className="inline-flex items-center justify-center rounded-lg bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Dom Pietro Experience. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-slate-400">Página não encontrada</p>
      </div>
    </div>
  );
}

export default App;
