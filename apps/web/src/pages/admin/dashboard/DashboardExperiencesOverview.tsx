import { Link } from 'react-router-dom';
import { mockExperiences, mockPartners, mockCategories } from '@/mocks/admin-experiences';

const topExperiences = [...mockExperiences]
  .filter((e) => e.status === 'active' || e.status === 'high_demand')
  .sort((a, b) => b.bookings_this_month - a.bookings_this_month)
  .slice(0, 5);

const activePartners = mockPartners.filter((p) => p.status === 'active');
const topCategories = [...mockCategories]
  .filter((c) => c.visibility === 'visible')
  .slice(0, 4);

const STATUS_COLORS: Record<string, string> = {
  active:      'text-teal-600 bg-teal-50',
  high_demand: 'text-red-500 bg-red-50',
  paused:      'text-amber-600 bg-amber-50',
  draft:       'text-indigo-500 bg-indigo-50',
  unavailable: 'text-stone-400 bg-stone-100',
};
const STATUS_LABELS: Record<string, string> = {
  active:      'Ativa',
  high_demand: 'Alta Demanda',
  paused:      'Pausada',
  draft:       'Rascunho',
  unavailable: 'Indisponível',
};

function fmt(n: number) {
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

export default function DashboardExperiencesOverview() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-compass-discover-line text-amber-600 text-base"></i>
          </div>
          <h2 className="text-navy-800 text-sm font-semibold">Experiências</h2>
          <span className="text-stone-400 text-xs font-light">Top experiências · Categorias · Parceiros</span>
        </div>
        <Link
          to="/admin/experiences"
          className="text-xs text-teal-600 hover:text-teal-700 transition-colors font-medium cursor-pointer"
        >
          Ver experiências
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Experiences */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider">Top Experiências do Mês</p>
            <span className="text-[10px] text-stone-300">{mockExperiences.filter((e) => e.status !== 'unavailable').length} ativas</span>
          </div>
          <div className="space-y-2">
            {topExperiences.map((exp, idx) => {
              const maxBookings = topExperiences[0]?.bookings_this_month ?? 1;
              const pct = Math.round((exp.bookings_this_month / maxBookings) * 100);
              return (
                <div key={exp.id} className="group">
                  <div className="flex items-center gap-3 py-2 px-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                    {/* Rank */}
                    <div className={`w-5 h-5 flex items-center justify-center rounded-lg flex-shrink-0 ${
                      idx === 0 ? 'bg-amber-50' : 'bg-stone-100'
                    }`}>
                      <span className={`text-[10px] font-semibold ${idx === 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                        {idx + 1}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-navy-800 text-xs font-medium truncate">{exp.name}</span>
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[exp.status] ?? 'text-stone-400 bg-stone-100'}`}>
                          {STATUS_LABELS[exp.status] ?? exp.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              exp.status === 'high_demand' ? 'bg-red-400' : 'bg-teal-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          {exp.bookings_this_month} reservas
                        </span>
                      </div>
                    </div>
                    {/* Price */}
                    <span className="text-navy-600 text-[11px] font-medium whitespace-nowrap flex-shrink-0">
                      {fmt(exp.base_price)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Parceiros + Categorias */}
        <div className="flex flex-col gap-4">
          {/* Active partners */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider">Parceiros Ativos</p>
              <Link to="/admin/partners" className="text-[10px] text-teal-600 hover:text-teal-700 cursor-pointer">
                Ver todos
              </Link>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-navy-900 text-3xl font-semibold">{activePartners.length}</span>
              <span className="text-stone-400 text-xs pb-1">de {mockPartners.length} total</span>
            </div>
            <div className="space-y-1.5">
              {activePartners.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-stone-50">
                  <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-stone-200 flex-shrink-0">
                    <i className="ri-hand-heart-line text-teal-600 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-700 text-[11px] font-medium truncate">{p.name}</p>
                    <p className="text-stone-400 text-[10px]">{p.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider">Categorias em Alta</p>
              <Link to="/admin/categories" className="text-[10px] text-teal-600 hover:text-teal-700 cursor-pointer">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {topCategories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 py-2 px-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <i className="ri-price-tag-3-line text-navy-400 text-xs"></i>
                  </div>
                  <span className="text-navy-600 text-[11px] truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}