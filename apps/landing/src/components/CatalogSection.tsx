import { useState } from 'react';

import { usePublicRoutes } from '@/hooks/usePublicRoutes';
import type { RouteFilters } from '@/services/routes';
import { FilterBar } from './FilterBar';
import { RouteCard, RouteCardEmpty, RouteCardError, RouteCardSkeleton } from './RouteCard';

export function CatalogSection() {
  const [filters, setFilters] = useState<RouteFilters>({});
  const { data: routes, isLoading, isError } = usePublicRoutes(filters);

  return (
    <section id="experiencias" className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
            Nossas Experiências
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Descubra transfers e experiências exclusivas preparadas para você.
          </p>
        </div>

        <div className="flex justify-center">
          <FilterBar filters={filters} onChange={setFilters} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <RouteCardSkeleton key={i} />)}

          {isError && <RouteCardError />}

          {!isLoading && !isError && routes && routes.length === 0 && (
            <RouteCardEmpty />
          )}

          {!isLoading &&
            !isError &&
            routes?.map((route) => <RouteCard key={route.id} route={route} />)}
        </div>
      </div>
    </section>
  );
}
