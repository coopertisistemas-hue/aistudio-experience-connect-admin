import type { MockCustomer, CustomerPreference } from '@/mocks/admin-customers';
import { preferenceLabels, preferenceIcons } from '@/mocks/admin-customers';

interface CustomersListProps {
  customers: MockCustomer[];
  onSelect: (c: MockCustomer) => void;
  loading?: boolean;
}

const statusConfig = {
  vip: { label: 'VIP', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', icon: 'ri-vip-crown-line' },
  active: { label: 'Ativo', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500', icon: 'ri-checkbox-circle-line' },
  inactive: { label: 'Inativo', bg: 'bg-stone-50', text: 'text-stone-500', border: 'border-stone-200', dot: 'bg-stone-400', icon: 'ri-pause-circle-line' },
};

const prefColors: Record<CustomerPreference, string> = {
  aeroporto: 'bg-sky-50 text-sky-700 border-sky-200',
  hotel: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  executivo: 'bg-slate-100 text-slate-700 border-slate-200',
  turismo: 'bg-teal-50 text-teal-700 border-teal-200',
  familia: 'bg-rose-50 text-rose-700 border-rose-200',
  acessibilidade: 'bg-purple-50 text-purple-700 border-purple-200',
  ingles: 'bg-green-50 text-green-700 border-green-200',
  espanhol: 'bg-orange-50 text-orange-700 border-orange-200',
  bagagem_extra: 'bg-stone-50 text-stone-600 border-stone-200',
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function fmtMoney(v: number) {
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function initials(name: string) {
  const p = name.trim().split(' ');
  return p.length >= 2 ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

const avatarColors = [
  'bg-teal-600 text-white',
  'bg-slate-600 text-white',
  'bg-amber-500 text-white',
  'bg-rose-600 text-white',
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
];

function avatarColor(id: string) {
  const n = id.charCodeAt(id.length - 1);
  return avatarColors[n % avatarColors.length];
}

function LoadingCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-stone-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-36"></div>
          <div className="h-3 bg-stone-100 rounded w-52"></div>
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-stone-100 rounded-full w-16"></div>
            <div className="h-5 bg-stone-100 rounded-full w-14"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-stone-100 rounded-full"></div>
      </div>
    </div>
  );
}

export default function CustomersList({ customers, onSelect, loading }: CustomersListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl py-20 flex flex-col items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center bg-stone-100 rounded-full">
          <i className="ri-user-search-line text-stone-400 text-xl"></i>
        </div>
        <p className="text-stone-600 font-medium text-sm">Nenhum cliente encontrado</p>
        <p className="text-stone-400 text-xs max-w-xs text-center">Tente ajustar os filtros ou cadastre um novo cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {customers.map((c) => {
        const st = statusConfig[c.status];
        const visiblePrefs = c.preferences.slice(0, 3);
        const extraPrefs = c.preferences.length - visiblePrefs.length;

        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            className="w-full text-left bg-white border border-stone-200 rounded-xl p-4 hover:border-teal-300 hover:bg-teal-50/20 transition-all duration-150 group cursor-pointer"
          >
            {/* Overdue/pending stripe */}
            {c.pending_amount > 0 && (
              <div className="h-0.5 w-full rounded-t-xl bg-amber-400/60 -mt-4 mb-3 -mx-4 px-0" style={{ width: 'calc(100% + 2rem)', marginLeft: '-1rem', marginRight: '-1rem', marginTop: '-1rem', marginBottom: '0.75rem', borderRadius: '0.75rem 0.75rem 0 0' }}></div>
            )}

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(c.id)}`}>
                {initials(c.name)}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{c.name}</span>
                  {c.status === 'vip' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <i className="ri-vip-crown-line text-[10px]"></i> VIP
                    </span>
                  )}
                  {c.pending_amount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <i className="ri-time-line text-[10px]"></i> Saldo pendente
                    </span>
                  )}
                </div>

                {/* Contact row */}
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="text-xs text-stone-500">{c.email}</span>
                  <span className="text-stone-300 text-xs hidden sm:block">·</span>
                  <span className="text-xs text-stone-500 hidden sm:block">{c.phone}</span>
                </div>

                {/* Preferences */}
                {visiblePrefs.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {visiblePrefs.map((pref) => (
                      <span
                        key={pref}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${prefColors[pref]}`}
                      >
                        <i className={`${preferenceIcons[pref]} text-[10px]`}></i>
                        {preferenceLabels[pref]}
                      </span>
                    ))}
                    {extraPrefs > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
                        +{extraPrefs}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Right side stats */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                {/* Status badge */}
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                  {st.label}
                </span>

                {/* Stats grid */}
                <div className="flex items-center gap-3 text-right">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-stone-700">{c.total_bookings}</p>
                    <p className="text-[10px] text-stone-400">reservas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-700">{c.total_spent > 0 ? `R$ ${c.total_spent.toLocaleString('pt-BR')}` : '—'}</p>
                    <p className="text-[10px] text-stone-400">valor total</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row — last / next booking */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-4 flex-wrap text-[11px] text-stone-500">
              {c.last_booking && (
                <span className="flex items-center gap-1">
                  <i className="ri-history-line text-stone-400"></i>
                  Última: <span className="font-medium text-stone-600 ml-0.5">{c.last_booking.route_name}</span>
                  <span className="text-stone-400 ml-1">{fmtDate(c.last_booking.scheduled_at)}</span>
                </span>
              )}
              {c.next_booking && (
                <span className="flex items-center gap-1">
                  <i className="ri-calendar-check-line text-teal-500"></i>
                  Próxima: <span className="font-medium text-teal-700 ml-0.5">{c.next_booking.route_name}</span>
                  <span className="text-teal-500 ml-1">{fmtDate(c.next_booking.scheduled_at)}</span>
                </span>
              )}
              {c.is_recurring && (
                <span className="flex items-center gap-1 text-navy-600 text-[#2d4a63]">
                  <i className="ri-repeat-line text-slate-500"></i>
                  Recorrente · {c.recurrence_count}x
                </span>
              )}
              {c.pending_amount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 ml-auto">
                  <i className="ri-alert-line"></i>
                  {fmtMoney(c.pending_amount)} pendente
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}