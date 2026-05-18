import { mockDriverPerformance } from '@/mocks/admin-reports';

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= rounded ? (
          <i key={s} className="ri-star-fill text-[10px] text-amber-400"></i>
        ) : (
          <i key={s} className="ri-star-line text-[10px] text-stone-300"></i>
        )
      )}
    </div>
  );
}

function PerformanceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function getRankBadge(rank: number) {
  if (rank === 1) return { bg: 'bg-amber-400',    text: 'text-white', icon: 'ri-trophy-line' };
  if (rank === 2) return { bg: 'bg-stone-400',    text: 'text-white', icon: 'ri-medal-line' };
  if (rank === 3) return { bg: 'bg-amber-700/70', text: 'text-white', icon: 'ri-award-line' };
  return { bg: 'bg-stone-100', text: 'text-stone-500', icon: '' };
}

function getPunctualityColor(pct: number) {
  if (pct >= 95) return '#0f766e';
  if (pct >= 85) return '#1e3a5f';
  return '#d97706';
}

export default function ReportsDriverPerformance() {
  const sorted = [...mockDriverPerformance].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">Desempenho de Motoristas</h3>
          <p className="text-stone-400 text-xs mt-0.5">Ranking operacional · período atual</p>
        </div>
        <span className="text-xs text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full font-medium border border-teal-200">
          {mockDriverPerformance.length} motoristas
        </span>
      </div>

      <div className="divide-y divide-stone-100">
        {sorted.map((driver) => {
          const rankBadge = getRankBadge(driver.rank);
          const punctColor = getPunctualityColor(driver.punctuality_pct);

          return (
            <div key={driver.id} className="px-5 py-4 hover:bg-stone-50/60 transition-colors">
              <div className="flex items-start gap-3">
                {/* Rank */}
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${rankBadge.bg}`}>
                  {driver.rank <= 3 ? (
                    <i className={`${rankBadge.icon} text-xs ${rankBadge.text}`}></i>
                  ) : (
                    <span className={`text-xs font-bold ${rankBadge.text}`}>{driver.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1e3a5f] flex-shrink-0">
                  <span className="text-white font-bold text-xs">{driver.initials}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-sm text-stone-800">{driver.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={driver.avg_rating} />
                        <span className="text-[11px] text-stone-500">{driver.avg_rating.toFixed(1)}</span>
                        {driver.incidents > 0 && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-200 font-medium">
                            {driver.incidents} ocorrência{driver.incidents !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-serif text-lg font-semibold text-stone-800">{driver.transfers_completed}</p>
                      <p className="text-stone-400 text-[10px]">transfers</p>
                    </div>
                  </div>

                  {/* Performance bars */}
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 w-24 flex-shrink-0">Pontualidade</span>
                      <PerformanceBar value={driver.punctuality_pct} color={punctColor} />
                      <span className="text-[11px] font-semibold text-stone-700 w-8 text-right flex-shrink-0">{driver.punctuality_pct}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 w-24 flex-shrink-0">Conclusão</span>
                      <PerformanceBar value={driver.completion_pct} color="#1e3a5f" />
                      <span className="text-[11px] font-semibold text-stone-700 w-8 text-right flex-shrink-0">{driver.completion_pct}%</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[11px] text-stone-400">
                      <span className="font-semibold text-stone-600">{driver.km_total.toLocaleString('pt-BR')}</span> km rodados
                    </span>
                    <span className={`text-[11px] font-semibold ${driver.incidents === 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                      {driver.incidents === 0 ? 'Sem ocorrências' : `${driver.incidents} ocorrências`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}