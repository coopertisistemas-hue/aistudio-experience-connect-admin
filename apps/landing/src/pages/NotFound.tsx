import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Página não encontrada | Dom Pietro Experience</title>
        <meta name="description" content="Página não encontrada." />
        <meta property="og:title" content="404 — Página não encontrada" />
        <meta property="og:description" content="Página não encontrada." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dompietro.com/og-image.png" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-8xl font-bold font-display text-emerald-400">
            404
          </h1>
          <p className="text-xl text-slate-400">Página não encontrada</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </>
  );
}
