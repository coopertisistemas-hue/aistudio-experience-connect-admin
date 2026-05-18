import { useState } from 'react';
import type { MockExperience, ExperienceStatus } from '@/mocks/admin-experiences';
import { statusLabels } from '@/mocks/admin-experiences';

interface Props {
  experience: MockExperience;
  onClose: () => void;
  onNewBooking?: () => void;
}

type Tab = 'perfil' | 'operacao' | 'vinculos' | 'historico' | 'observacoes';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'perfil',      label: 'Perfil',      icon: 'ri-information-line' },
  { id: 'operacao',    label: 'Operação',    icon: 'ri-settings-3-line' },
  { id: 'vinculos',    label: 'Vínculos',    icon: 'ri-links-line' },
  { id: 'historico',   label: 'Histórico',   icon: 'ri-history-line' },
  { id: 'observacoes', label: 'Observações', icon: 'ri-sticky-note-line' },
];

const STATUS_STYLES: Record<ExperienceStatus, { bg: string; text: string; dot: string }> = {
  active:      { bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700',   dot: 'bg-teal-500' },
  high_demand: { bg: 'bg-red-50 border-red-200',     text: 'text-red-600',    dot: 'bg-red-500 animate-pulse' },
  paused:      { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700',  dot: 'bg-amber-500' },
  unavailable: { bg: 'bg-stone-100 border-stone-200',text: 'text-stone-500',  dot: 'bg-stone-400' },
  draft:       { bg: 'bg-indigo-50 border-indigo-200',text:'text-indigo-600', dot: 'bg-indigo-400' },
};

const MOCK_HISTORY = [
  { date: '2026-05-16', event: 'Reserva EXP-0089 confirmada', type: 'booking' },
  { date: '2026-05-14', event: 'Avaliação 5★ recebida', type: 'rating' },
  { date: '2026-05-10', event: 'Capacidade atualizada para 4 pax', type: 'update' },
  { date: '2026-04-28', event: 'Reserva EXP-0076 concluída', type: 'booking' },
  { date: '2026-04-15', event: 'Status alterado para Ativa', type: 'status' },
];

function PerfilTab({ exp }: { exp: MockExperience }) {
  const s = STATUS_STYLES[exp.status];
  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-teal-500/10 to-navy-50/60 border border-teal-200/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
            {statusLabels[exp.status]}
          </span>
          {exp.rating > 0 && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
              <i className="ri-star-fill text-sm"></i>
              {exp.rating}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-stone-800 font-serif mb-1">{exp.name}</h3>
        <p className="text-sm text-stone-600 leading-relaxed">{exp.description}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Preço base', value: `R$ ${exp.base_price.toLocaleString('pt-BR')}`, icon: 'ri-money-dollar-circle-line', color: 'text-teal-600' },
          { label: 'Duração', value: `${exp.duration_hours}h`, icon: 'ri-time-line', color: 'text-navy-600' },
          { label: 'Capacidade', value: `${exp.capacity} pax`, icon: 'ri-group-line', color: 'text-indigo-600' },
          { label: 'Reservas totais', value: exp.bookings_count, icon: 'ri-calendar-check-line', color: 'text-emerald-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-sm ${item.color}`}></i>
              </div>
              <p className="text-[11px] text-stone-500 uppercase tracking-wide font-medium">{item.label}</p>
            </div>
            <p className="text-lg font-bold text-stone-800 font-serif">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Included */}
      {exp.included.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Incluído</p>
          <div className="space-y-2">
            {exp.included.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-checkbox-circle-line text-teal-500 text-sm"></i>
                </div>
                <span className="text-sm text-stone-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OperacaoTab({ exp }: { exp: MockExperience }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Categoria', value: exp.category_name, icon: 'ri-price-tag-3-line' },
          { label: 'Parceiro', value: exp.partner_name, icon: 'ri-hand-heart-line' },
          { label: 'Rota vinculada', value: exp.route_name ?? 'Sem rota específica', icon: 'ri-route-line' },
          { label: 'Capacidade', value: `${exp.capacity} passageiros`, icon: 'ri-group-line' },
          { label: 'Duração estimada', value: `${exp.duration_hours} horas`, icon: 'ri-time-line' },
          { label: 'Demanda atual', value: exp.demand === 'high' ? 'Alta' : exp.demand === 'medium' ? 'Média' : 'Baixa', icon: 'ri-bar-chart-grouped-line' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-28 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800 flex-1 truncate">{row.value}</p>
          </div>
        ))}
      </div>

      {exp.next_available && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <i className="ri-calendar-event-line text-teal-600 text-sm"></i>
          </div>
          <div>
            <p className="text-xs font-semibold text-teal-700">Próxima disponibilidade</p>
            <p className="text-xs text-teal-600">
              {new Date(exp.next_available).toLocaleDateString('pt-BR', { dateStyle: 'full' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function VinculosTab({ exp }: { exp: MockExperience }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Parceiro</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-950/5 border border-stone-200 flex-shrink-0">
            <i className="ri-hand-heart-line text-[#2d4a63] text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">{exp.partner_name}</p>
            <p className="text-xs text-stone-500">Parceiro principal</p>
          </div>
        </div>
      </div>

      {exp.route_name && (
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Rota vinculada</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-200 flex-shrink-0">
              <i className="ri-route-line text-teal-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-800">{exp.route_name}</p>
              <p className="text-xs text-stone-500">Rota operacional</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Tags</p>
        <div className="flex flex-wrap gap-2">
          {exp.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Reservas vinculadas</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 rounded-lg px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-stone-800 font-serif">{exp.bookings_count}</p>
            <p className="text-[11px] text-stone-500">Total</p>
          </div>
          <div className="bg-teal-50 rounded-lg px-3 py-2.5 text-center">
            <p className="text-xl font-bold text-teal-700 font-serif">{exp.bookings_this_month}</p>
            <p className="text-[11px] text-teal-600">Este mês</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoricoTab() {
  const DOT_COLORS: Record<string, string> = {
    booking: 'bg-teal-500',
    rating:  'bg-amber-500',
    update:  'bg-indigo-500',
    status:  'bg-navy-500',
  };
  const ICONS: Record<string, string> = {
    booking: 'ri-calendar-check-line',
    rating:  'ri-star-line',
    update:  'ri-edit-line',
    status:  'ri-toggle-line',
  };
  return (
    <div className="space-y-1">
      {MOCK_HISTORY.map((item, idx) => (
        <div key={idx} className="flex gap-3 pb-4">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 ${DOT_COLORS[item.type]}/10 border border-stone-200`}>
              <i className={`${ICONS[item.type]} text-xs text-stone-500`}></i>
            </div>
            {idx < MOCK_HISTORY.length - 1 && <div className="w-px flex-1 mt-1 bg-stone-200" />}
          </div>
          <div className="pt-1 pb-2">
            <p className="text-sm text-stone-700">{item.event}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {new Date(item.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObservacoesTab() {
  const [note, setNote] = useState('');
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">Nota operacional</p>
        <p className="text-sm text-amber-800">Verificar disponibilidade de veículo premium para alta temporada. Parceiro solicita confirmação até 48h antes.</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Nova observação</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="Adicionar observação operacional..."
          className="w-full px-3.5 py-3 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400">{note.length}/500</span>
          <button
            type="button"
            className="h-8 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceDetailDrawer({ experience: exp, onClose, onNewBooking }: Props) {
  const [tab, setTab] = useState<Tab>('perfil');

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-500/10 border border-teal-200 flex-shrink-0">
              <i className="ri-compass-discover-line text-teal-600 text-base"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{exp.name}</p>
              <p className="text-[11px] text-stone-500 truncate">{exp.category_name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer flex-shrink-0"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-stone-200 overflow-x-auto flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap
                ${tab === t.id
                  ? 'text-teal-700 border-teal-500'
                  : 'text-stone-500 border-transparent hover:text-stone-700'}`}
            >
              <i className={`${t.icon} text-xs`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'perfil'      && <PerfilTab exp={exp} />}
          {tab === 'operacao'    && <OperacaoTab exp={exp} />}
          {tab === 'vinculos'    && <VinculosTab exp={exp} />}
          {tab === 'historico'   && <HistoricoTab />}
          {tab === 'observacoes' && <ObservacoesTab />}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button
            type="button"
            onClick={onNewBooking}
            className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <i className="ri-calendar-2-line text-sm"></i>
            Nova Reserva
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-eye-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs font-medium rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-share-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-navy-950 hover:bg-navy-900 text-white text-xs font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-edit-line text-sm"></i>
          </button>
        </div>
      </aside>
    </>
  );
}