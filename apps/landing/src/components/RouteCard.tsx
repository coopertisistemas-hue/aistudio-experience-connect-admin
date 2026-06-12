import type { RouteWithCategory } from '@/services/routes';

interface RouteCardProps {
  route: RouteWithCategory;
}

function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDuration(min: number | null): string | null {
  if (min === null || min === undefined) return null;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
}

export function RouteCard({ route }: RouteCardProps) {
  return (
    <div className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
      <div className="h-40 bg-gradient-to-br from-emerald-900/40 to-slate-800 flex items-center justify-center">
        {route.images && typeof route.images === 'object' && 'url' in route.images ? (
          <img
            src={(route.images as { url: string }).url}
            alt={route.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-12 h-12 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      <div className="p-5 space-y-3">
        {route.category_name && (
          <span
            className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400"
          >
            {route.category_name}
          </span>
        )}

        <h3 className="text-lg font-display font-semibold text-white group-hover:text-emerald-400 transition-colors">
          {route.name}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2">
          {route.short_description || 'Experiência exclusiva Dom Pietro.'}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <span className="text-xl font-bold text-emerald-400">
              {formatPrice(route.base_price)}
            </span>
            {route.duration_min !== null && (
              <p className="text-xs text-slate-500">
                {formatDuration(route.duration_min)}
              </p>
            )}
          </div>
          <span className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
            Ver detalhes &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}

export function RouteCardSkeleton() {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 bg-slate-800 rounded-full" />
        <div className="h-5 w-3/4 bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-800 rounded" />
        <div className="flex justify-between pt-2">
          <div className="h-6 w-24 bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function RouteCardEmpty() {
  return (
    <div className="col-span-full text-center py-12">
      <svg
        className="w-16 h-16 mx-auto text-slate-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <p className="text-slate-400 text-lg font-display">
        Nenhuma experiência encontrada
      </p>
      <p className="text-slate-500 text-sm mt-1">
        Tente ajustar os filtros ou volte mais tarde.
      </p>
    </div>
  );
}

export function RouteCardError() {
  return (
    <div className="col-span-full text-center py-12">
      <svg
        className="w-16 h-16 mx-auto text-red-400/60 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="text-slate-400 text-lg font-display">
        Erro ao carregar experiências
      </p>
      <p className="text-slate-500 text-sm mt-1">
        Não foi possível conectar ao servidor. Tente novamente mais tarde.
      </p>
    </div>
  );
}
