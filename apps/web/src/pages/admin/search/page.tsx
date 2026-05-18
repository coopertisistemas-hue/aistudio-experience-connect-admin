import { useState } from 'react';
import { mockBookings } from '@/mocks/admin-bookings';
import { mockTransfers } from '@/mocks/admin-transfers';
import { mockDrivers } from '@/mocks/admin-drivers';
import { mockVehicles } from '@/mocks/admin-vehicles';
import StatusBadge from '@/pages/admin/components/ui/StatusBadge';
import PageHeader from '@/pages/admin/components/ui/PageHeader';

type SearchCategory = 'all' | 'bookings' | 'transfers' | 'drivers' | 'vehicles';

const categoryFilters: { label: string; value: SearchCategory; icon: string }[] = [
  { label: 'Todos', value: 'all', icon: 'ri-search-line' },
  { label: 'Reservas', value: 'bookings', icon: 'ri-calendar-check-line' },
  { label: 'Transfers', value: 'transfers', icon: 'ri-car-line' },
  { label: 'Motoristas', value: 'drivers', icon: 'ri-steering-2-line' },
  { label: 'Veículos', value: 'vehicles', icon: 'ri-taxi-line' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');

  const q = query.toLowerCase().trim();

  const bookingResults = (category === 'all' || category === 'bookings') && q
    ? mockBookings.filter((b) =>
        b.reference.toLowerCase().includes(q) ||
        b.passenger_name.toLowerCase().includes(q) ||
        b.pickup_location.toLowerCase().includes(q) ||
        b.dropoff_location.toLowerCase().includes(q)
      )
    : [];

  const transferResults = (category === 'all' || category === 'transfers') && q
    ? mockTransfers.filter((t) =>
        t.reference.toLowerCase().includes(q) ||
        t.route_name.toLowerCase().includes(q) ||
        (t.driver_name ?? '').toLowerCase().includes(q)
      )
    : [];

  const driverResults = (category === 'all' || category === 'drivers') && q
    ? mockDrivers.filter((d) =>
        d.full_name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.includes(q)
      )
    : [];

  const vehicleResults = (category === 'all' || category === 'vehicles') && q
    ? mockVehicles.filter((v) =>
        v.name.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
      )
    : [];

  const totalResults = bookingResults.length + transferResults.length + driverResults.length + vehicleResults.length;
  const hasResults = q && totalResults > 0;
  const noResults = q && totalResults === 0;

  return (
    <div className="p-6">
      <PageHeader
        icon="ri-search-eye-line"
        title="Pesquisa & Consultas"
        subtitle="Busca global por reservas, transfers, motoristas, veículos e pagamentos."
      />

      {/* Search input */}
      <div className="relative mb-5 max-w-2xl">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
          <i className="ri-search-line text-navy-400 text-base"></i>
        </div>
        <input
          type="text"
          placeholder="Buscar por referência, nome, placa, rota..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full h-12 pl-11 pr-5 text-sm bg-white border-2 border-sand-200 rounded-2xl text-navy-700 placeholder-navy-300 focus:outline-none focus:border-teal-300 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-sand-100 text-navy-400 cursor-pointer"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {categoryFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setCategory(f.value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              category === f.value ? 'bg-navy-950 text-white' : 'bg-white border border-sand-200 text-navy-500 hover:border-sand-300'
            }`}
          >
            <i className={`${f.icon} text-xs`}></i>
            {f.label}
          </button>
        ))}
      </div>

      {/* Initial state */}
      {!q && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-sand-100 border border-sand-200 mb-5">
            <i className="ri-search-eye-line text-navy-300 text-2xl"></i>
          </div>
          <h3 className="font-serif text-lg font-semibold text-navy-700 mb-2">Pesquise na operação</h3>
          <p className="text-navy-400 text-sm font-light max-w-sm text-center leading-relaxed">
            Busque por referência de reserva, nome do passageiro, placa do veículo, nome do motorista ou número de transfer.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['BK-0051', 'João Silva', 'ABC-1234', 'Galeão', 'Mercedes'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="px-3 py-1.5 bg-white border border-sand-200 rounded-xl text-navy-600 text-xs hover:border-teal-200 hover:text-teal-700 transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-sand-100 border border-sand-200 mb-4">
            <i className="ri-search-2-line text-navy-300 text-xl"></i>
          </div>
          <h3 className="font-serif text-base font-semibold text-navy-700 mb-1">Nenhum resultado para &quot;{query}&quot;</h3>
          <p className="text-navy-400 text-sm font-light">Tente termos diferentes ou verifique a ortografia.</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-6">
          <p className="text-navy-400 text-sm">
            <span className="font-semibold text-navy-700">{totalResults}</span> resultado(s) para &quot;<span className="font-medium text-teal-700">{query}</span>&quot;
          </p>

          {/* Bookings */}
          {bookingResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-calendar-check-line text-navy-400 text-sm"></i>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Reservas</span>
                <span className="text-[11px] text-navy-300">({bookingResults.length})</span>
              </div>
              <div className="space-y-2">
                {bookingResults.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 bg-white border border-sand-200 rounded-xl p-4 hover:border-sand-300 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-50 border border-teal-100 flex-shrink-0">
                      <i className="ri-calendar-check-line text-teal-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-navy-700 font-mono">{b.reference}</span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-navy-600 mt-0.5 truncate">{b.passenger_name} — {b.pickup_location} → {b.dropoff_location}</p>
                    </div>
                    <span className="text-xs font-semibold text-navy-800 flex-shrink-0">R$ {b.total_amount}</span>
                    <i className="ri-arrow-right-s-line text-navy-300 group-hover:text-navy-600 transition-colors"></i>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transfers */}
          {transferResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-car-line text-navy-400 text-sm"></i>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Transfers</span>
                <span className="text-[11px] text-navy-300">({transferResults.length})</span>
              </div>
              <div className="space-y-2">
                {transferResults.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 bg-white border border-sand-200 rounded-xl p-4 hover:border-sand-300 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-50 border border-navy-100 flex-shrink-0">
                      <i className="ri-car-line text-navy-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-navy-700 font-mono">{t.reference}</span>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-xs text-navy-600 mt-0.5 truncate">{t.route_name} — {t.driver_name ?? 'Sem motorista'} · {t.vehicle_name}</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-navy-300 group-hover:text-navy-600 transition-colors"></i>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drivers */}
          {driverResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-steering-2-line text-navy-400 text-sm"></i>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Motoristas</span>
                <span className="text-[11px] text-navy-300">({driverResults.length})</span>
              </div>
              <div className="space-y-2">
                {driverResults.map((d) => {
                  const initials = d.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                  return (
                    <div key={d.id} className="flex items-center gap-4 bg-white border border-sand-200 rounded-xl p-4 hover:border-sand-300 transition-colors cursor-pointer group">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-900 flex-shrink-0">
                        <span className="text-white text-[11px] font-semibold">{initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-navy-800">{d.full_name}</span>
                          <StatusBadge status={d.status} />
                        </div>
                        <p className="text-xs text-navy-400 mt-0.5">{d.email} · {d.phone}</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-navy-300 group-hover:text-navy-600 transition-colors"></i>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vehicles */}
          {vehicleResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-taxi-line text-navy-400 text-sm"></i>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Veículos</span>
                <span className="text-[11px] text-navy-300">({vehicleResults.length})</span>
              </div>
              <div className="space-y-2">
                {vehicleResults.map((v) => (
                  <div key={v.id} className="flex items-center gap-4 bg-white border border-sand-200 rounded-xl p-4 hover:border-sand-300 transition-colors cursor-pointer group">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sand-100 border border-sand-200 flex-shrink-0">
                      <i className="ri-taxi-line text-navy-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-navy-800">{v.name}</span>
                        <span className="text-[10px] font-mono text-navy-400 bg-sand-100 px-1.5 py-0.5 rounded">{v.plate}</span>
                        <StatusBadge status={v.status} />
                      </div>
                      <p className="text-xs text-navy-400 mt-0.5">Capacidade {v.capacity} pax · {v.color}</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-navy-300 group-hover:text-navy-600 transition-colors"></i>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}