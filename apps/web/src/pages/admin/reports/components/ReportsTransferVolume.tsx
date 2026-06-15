import { useState } from 'react';
import type { DailyTransferStat, HourlyPeakStat, RouteAnalytic } from '@/services/reports';

interface Props {
  dailyStats: DailyTransferStat[];
  hourlyPeaks: HourlyPeakStat[];
  routeAnalytics: RouteAnalytic[];
}

type ChartView = 'volume' | 'revenue' | 'occupancy';

const categoryColors: Record<string, string> = {
  airport:   '#0f766e',
  tourism:   '#1e3a5f',
  corporate: '#d97706',
  hotel:     '#78716c',
};

const categoryLabels: Record<string, string> = {
  airport:   'Aeroporto',
  tourism:   'Turismo',
  corporate: 'Corporativo',
  hotel:     'Hotel',
};

function BarChart({ data, valueKey, color, formatValue }: {
  data: { label: string; [key: string]: number | string }[];
  valueKey: string;
  color: string;
  formatValue?: (v: number) => string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);
  const W = 28;
  const GAP = 2;
  const H = 120;
  const total = data.length;
  const svgW = total * (W + GAP);

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={H + 28} className="block">
        {data.map((d, i) => {
          const val = Number(d[valueKey]);
          const barH = Math.max(2, (val / max) * H);
          const x = i * (W + GAP);
          const y = H - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={W} height={barH} rx={3} fill={color} opacity={0.85} />
              <text x={x + W / 2} y={H + 14} textAnchor="middle" fontSize={8} fill="#78716c">{String(d.label)}</text>
              {barH > 18 && (
                <text x={x + W / 2} y={y - 3} textAnchor="middle" fontSize={8} fill="#1e3a5f" fontWeight="600">
                  {formatValue ? formatValue(val) : val}
                </text>
              )}
            </g>
          );
        })}
        {/* Baseline */}
        <line x1={0} y1={H} x2={svgW} y2={H} stroke="#e7e5e4" strokeWidth={1} />
      </svg>
    </div>
  );
}

function MiniLineChart({ data, color = '#0f766e' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const W = 300;
  const H = 60;
  const step = W / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${H - (v / max) * H}`).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 4}`} preserveAspectRatio="none" className="block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <circle key={i} cx={i * step} cy={H - (v / max) * H} r={2} fill={color} />
      ))}
    </svg>
  );
}

export default function ReportsTransferVolume({ dailyStats, hourlyPeaks, routeAnalytics }: Props) {
  const [view, setView] = useState<ChartView>('volume');

  const last14 = dailyStats.length >= 14 ? dailyStats.slice(-14) : dailyStats;
  const revData = last14.map((d) => ({ label: d.label.slice(0, 5), revenue: Math.round(d.revenue / 100) }));
  const occupancyLine = last14.map((d) => d.occupancy_pct);

  // By category
  const byCat = routeAnalytics.reduce<Record<string, { transfers: number; revenue: number }>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = { transfers: 0, revenue: 0 };
    acc[r.category].transfers += r.transfers;
    acc[r.category].revenue += r.revenue;
    return acc;
  }, {});

  const catData = Object.entries(byCat).map(([cat, vals]) => ({
    label: categoryLabels[cat] ?? cat,
    category: cat,
    ...vals,
  }));

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">Volume de Transfers</h3>
          <p className="text-stone-400 text-xs mt-0.5">Últimos 14 dias · dados operacionais</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-xl border border-stone-200">
          {([['volume','Transfers'],['revenue','Receita'],['occupancy','Ocupação']] as [ChartView, string][]).map(([v, lbl]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${view === v ? 'bg-navy-950 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Main bar/line chart */}
        <div>
          {view === 'volume' && (
            <BarChart
              data={last14.map((d) => ({ label: d.label.slice(0, 5), transfers: d.transfers }))}
              valueKey="transfers"
              color="#0f766e"
            />
          )}
          {view === 'revenue' && (
            <BarChart
              data={revData}
              valueKey="revenue"
              color="#1e3a5f"
              formatValue={(v) => `${v}k`}
            />
          )}
          {view === 'occupancy' && (
            <div>
              <div className="h-16 w-full">
                <MiniLineChart data={occupancyLine} color="#0f766e" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-stone-400">{last14[0]?.label}</span>
                <span className="text-xs text-teal-600 font-semibold">Média: {Math.round(occupancyLine.reduce((a, b) => a + b, 0) / occupancyLine.length)}%</span>
                <span className="text-xs text-stone-400">{last14[last14.length - 1]?.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* Two-col bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* By category */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Por Categoria</p>
            <div className="space-y-2.5">
              {catData.sort((a, b) => b.transfers - a.transfers).map((cat) => {
                const maxT = Math.max(...catData.map((c) => c.transfers), 1);
                const pct = Math.round((cat.transfers / maxT) * 100);
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-stone-700">{cat.label}</span>
                      <span className="text-stone-500">{cat.transfers} transfers</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: categoryColors[cat.category] ?? '#78716c' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Peak hours */}
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Horários de Pico</p>
            <div className="overflow-x-auto">
              <svg width={hourlyPeaks.length * 22} height={80} className="block">
                {(() => {
                  const maxV = Math.max(...hourlyPeaks.map((h) => h.transfers), 1);
                  return hourlyPeaks.map((h, i) => {
                    const barH = Math.max(3, (h.transfers / maxV) * 56);
                    const isPeak = h.transfers >= 15;
                    return (
                      <g key={h.hour}>
                        <rect
                          x={i * 22} y={60 - barH} width={16} height={barH} rx={2}
                          fill={isPeak ? '#0f766e' : '#d6d3d1'}
                        />
                        <text x={i * 22 + 8} y={76} textAnchor="middle" fontSize={7} fill="#a8a29e">
                          {h.hour.replace('h', '')}
                        </text>
                      </g>
                    );
                  });
                })()}
                <line x1={0} y1={60} x2={hourlyPeaks.length * 22} y2={60} stroke="#e7e5e4" strokeWidth={1} />
              </svg>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="w-2 h-2 rounded bg-teal-600 inline-block"></span>Pico
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="w-2 h-2 rounded bg-stone-300 inline-block"></span>Normal
              </span>
              <span className="ml-auto text-[11px] text-teal-600 font-semibold">Pico: 17h–18h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}