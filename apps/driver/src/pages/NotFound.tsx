import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <p className="text-6xl font-bold text-slate-700">404</p>
      <p className="mt-2 text-slate-400">Pagina nao encontrada</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        Voltar ao inicio
      </Link>
    </div>
  );
}
