import type { RevenueByCategoryItem, MonthlyRevenueItem, ExecutiveSummary } from '@/services/reports';

interface Props {
  revenueByCategory: RevenueByCategoryItem[];
  monthlyRevenue: MonthlyRevenueItem[];
  summary: ExecutiveSummary;
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

function MonthlyBarChart({ data }: { data: MonthlyRevenueItem[] }) {
  const maxRev = Math.max(...data.map((m) => m.revenue), 1);
  const W = 40;
  const GAP = 8;
  const H = 80;
  const total = data.length;
  const svgW = total * (W + GAP) - GAP;
  const lastIdx = total - 1;

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={H + 36} className="block mx-auto">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1={0} y1={H - pct * H} x2={svgW} y2={H - pct * H} stroke="#f5f5f4" strokeWidth={1} />
        ))}

        {data.map((m, i) => {
          const barH = Math.max(4, (m.revenue / maxRev) * H);
          const x = i * (W + GAP);
          const y = H - barH;
          const isLast = i === lastIdx;

          return (
            <g key={m.month}>
              <rect x={x} y={y} width={W} height={barH} rx={4}
                fill={isLast ? '#0f766e' : '#1e3a5f'}
                opacity={isLast ? 1 : 0.55}
              />
              {/* Month label */}
              <text x={x + W / 2} y={H + 14} textAnchor="middle" fontSize={10} fill={isLast ? '#0f766e' : '#78716c'} fontWeight={isLast ? '700' : '400'}>
                {m.month}
              </text>
              {/* Revenue label */}
              <text x={x + W / 2} y={y - 4} textAnchor="middle" fontSize={8} fill={isLast ? '#0f766e' : '#a8a29e'} fontWeight="600">
                {m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(0)}k` : m.revenue}
              </text>
              {/* Transfer count */}
              <text x={x + W / 2} y={H + 28} textAnchor="middle" fontSize={8} fill="#a8a29e">
                {m.transfers}t
              </text>
            </g>
          );
        })}
        <line x1={0} y1={H} x2={svgW} y2={H} stroke="#e7e5e4" strokeWidth={1} />
      </svg>
    </div>
  );
}

function DonutChart({ data }: { data: RevenueByCategoryItem[] }) {
  const total = data.reduce((a, c) => a + c.revenue, 0);
  const size = 120;
  const cx = size / 2;
  const cy = size / 2;
  const r = 44;
  const strokeW = 18;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const segments = data.map((cat) => {
    const pct = cat.revenue / total;
    const dash = pct * circumference;
    const offset = cumulative * circumference;
    cumulative += pct;
    return { ...cat, dash, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f5f5f4" strokeWidth={strokeW} />
      {segments.map((s) => (
        <circle
          key={s.category}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={-s.offset + circumference / 4}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      ))}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fill="#1e3a5f" fontWeight="700">
        {formatCurrency(total).replace('R$ ', '')}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill="#a8a29e">
        total
      </text>
    </svg>
  );
}

export default function ReportsRevenueSummary({ revenueByCategory, monthlyRevenue, summary }: Props) {
  const s = summary;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
        <div>
          <h3 className="font-serif font-semibold text-stone-800 text-base">Resumo de Receita</h3>
          <p className="text-stone-400 text-xs mt-0.5">Operacional · sem visão contábil</p>
        </div>
        <div className="flex items-center gap-1.5 text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-teal-200">
          <i className="ri-arrow-up-line text-xs"></i>
          +{s.crescimento_receita_pct}% vs mês ant.
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Este mês', value: formatCurrency(s.receita_mes), accent: 'text-teal-600' },
            { label: 'Ticket médio', value: `R$ ${s.ticket_medio}`, accent: 'text-[#1e3a5f]' },
            { label: 'Pendentes', value: formatCurrency(s.pagamentos_pendentes), accent: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 text-center">
              <p className={`font-serif text-lg font-semibold ${item.accent}`}>{item.value}</p>
              <p className="text-stone-400 text-[10px] mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Monthly chart */}
        <div>
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Receita Mensal (7 meses)</p>
          <MonthlyBarChart data={monthlyRevenue} />
        </div>

        {/* By category */}
        <div>
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-3">Receita por Categoria</p>
          <div className="flex items-center gap-6">
            <DonutChart data={revenueByCategory} />
            <div className="flex-1 space-y-2.5">
              {revenueByCategory.map((cat) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-medium text-stone-700">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">{cat.transfers}t</span>
                      <span className="font-semibold text-stone-700">{formatCurrency(cat.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment status note */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-start gap-3">
          <i className="ri-time-line text-amber-500 flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="text-sm font-semibold text-amber-800">Pagamentos pendentes</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              {formatCurrency(s.pagamentos_pendentes)} aguardando confirmação de pagamento. Verifique o módulo de Pagamentos para detalhes e cobranças em aberto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}