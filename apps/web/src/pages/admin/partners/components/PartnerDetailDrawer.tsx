import { useState } from 'react';
import { partnerTypeLabels } from '@/services/partners';
import type { PartnerDisplay } from '@/services/partners';

interface Props {
  partner: PartnerDisplay;
  onClose: () => void;
}

type Tab = 'perfil' | 'operacao' | 'vinculos' | 'historico' | 'observacoes';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'perfil',      label: 'Perfil',      icon: 'ri-information-line' },
  { id: 'operacao',    label: 'Operação',    icon: 'ri-settings-3-line' },
  { id: 'vinculos',    label: 'Vínculos',    icon: 'ri-links-line' },
  { id: 'historico',   label: 'Histórico',   icon: 'ri-history-line' },
  { id: 'observacoes', label: 'Observações', icon: 'ri-sticky-note-line' },
];

const TYPE_ICONS: Record<string, string> = {
  hotel:              'ri-hotel-line',
  pousada:            'ri-home-heart-line',
  agencia:            'ri-building-2-line',
  guia:               'ri-user-star-line',
  experiencia:        'ri-compass-discover-line',
  operador_turistico: 'ri-map-pin-2-line',
};

const MOCK_HISTORY = [
  { date: '2026-05-16', event: 'Reserva confirmada via parceiro', type: 'booking' },
  { date: '2026-05-10', event: 'Contato atualizado', type: 'update' },
  { date: '2026-04-28', event: 'Contrato renovado até Dez/2026', type: 'contract' },
  { date: '2026-03-15', event: 'Nova experiência vinculada', type: 'link' },
];

function PerfilTab({ partner: p }: { partner: PartnerDisplay }) {
  const statusLabel = p.status === 'active' ? 'Ativo' : p.status === 'paused' ? 'Pausado' : 'Inativo';
  const statusStyles =
    p.status === 'active'   ? 'bg-teal-50 border-teal-200 text-teal-700' :
    p.status === 'paused'   ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              'bg-stone-100 border-stone-200 text-stone-500';

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-950/5 to-stone-50 border border-stone-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyles}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {statusLabel}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded-full">
            <div className="w-3 h-3 flex items-center justify-center">
              <i className={`${TYPE_ICONS[p.type] || 'ri-building-line'} text-[10px] text-stone-400`}></i>
            </div>
            {partnerTypeLabels[p.type] || p.type}
          </span>
        </div>
        <h3 className="text-base font-bold text-stone-800 font-serif mb-1">{p.name}</h3>
        <p className="text-xs text-stone-500">{p.city}, {p.state} · Parceiro desde {new Date(p.since).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })}</p>
      </div>

      {/* Contact */}
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Responsável', value: p.contact_name, icon: 'ri-user-line' },
          { label: 'E-mail', value: p.contact_email, icon: 'ri-mail-line' },
          { label: 'Telefone', value: p.contact_phone, icon: 'ri-phone-line' },
          { label: 'Localização', value: `${p.city}, ${p.state} — ${p.country}`, icon: 'ri-map-pin-line' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-24 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800 flex-1 truncate">{row.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Experiências', value: p.experiences_count, color: 'text-teal-600' },
          { label: 'Reservas', value: p.bookings_generated, color: 'text-navy-700' },
          { label: 'Receita gerada', value: p.revenue_generated > 0 ? `R$ ${(p.revenue_generated / 1000).toFixed(0)}k` : '—', color: 'text-emerald-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold font-serif ${item.color}`}>{item.value}</p>
            <p className="text-[11px] text-stone-500 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperacaoTab({ partner: p }: { partner: PartnerDisplay }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {[
          { label: 'Tipo de parceiro', value: partnerTypeLabels[p.type] || p.type, icon: TYPE_ICONS[p.type] || 'ri-building-line' },
          { label: 'Parceiro desde', value: new Date(p.since).toLocaleDateString('pt-BR'), icon: 'ri-calendar-line' },
          { label: 'Última reserva', value: p.last_booking ? new Date(p.last_booking).toLocaleDateString('pt-BR') : 'Sem reservas', icon: 'ri-calendar-check-line' },
          { label: 'Experiências', value: `${p.experiences_count} vinculada${p.experiences_count !== 1 ? 's' : ''}`, icon: 'ri-compass-discover-line' },
          { label: 'Status', value: p.status === 'active' ? 'Ativo' : p.status === 'paused' ? 'Pausado' : 'Inativo', icon: 'ri-toggle-line' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-50 flex-shrink-0">
              <i className={`${row.icon} text-stone-400 text-sm`}></i>
            </div>
            <p className="text-xs text-stone-500 w-28 flex-shrink-0">{row.label}</p>
            <p className="text-sm font-medium text-stone-800">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VinculosTab({ partner: p }: { partner: PartnerDisplay }) {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
          Experiências vinculadas
          <span className="ml-2 bg-teal-100 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{p.experiences_count}</span>
        </p>
        {p.experiences_count === 0 ? (
          <p className="text-sm text-stone-400">Nenhuma experiência vinculada ainda.</p>
        ) : (
          <p className="text-sm text-stone-500">{p.experiences_count} experiência{p.experiences_count !== 1 ? 's' : ''} vinculada{p.experiences_count !== 1 ? 's' : ''} a este parceiro.</p>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Tags</p>
        <div className="flex flex-wrap gap-2">
          {p.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoricoTab() {
  const ICONS: Record<string, string> = {
    booking: 'ri-calendar-check-line',
    update: 'ri-edit-line',
    contract: 'ri-file-text-line',
    link: 'ri-links-line',
  };
  return (
    <div className="space-y-1">
      {MOCK_HISTORY.map((item, idx) => (
        <div key={idx} className="flex gap-3 pb-4">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 border border-stone-200 flex-shrink-0">
              <i className={`${ICONS[item.type]} text-xs text-stone-500`}></i>
            </div>
            {idx < MOCK_HISTORY.length - 1 && <div className="w-px flex-1 mt-1 bg-stone-200" />}
          </div>
          <div className="pt-1 pb-2">
            <p className="text-sm text-stone-700">{item.event}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ObservacoesTab({ partner: p }: { partner: PartnerDisplay }) {
  const [note, setNote] = useState('');
  return (
    <div className="space-y-4">
      {p.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-1">Nota operacional</p>
          <p className="text-sm text-amber-800 leading-relaxed">{p.notes}</p>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Nova observação</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          rows={4}
          placeholder="Adicionar nota sobre o parceiro..."
          className="w-full px-3.5 py-3 text-sm bg-white border border-stone-200 rounded-xl text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400">{note.length}/500</span>
          <button type="button" className="h-8 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailDrawer({ partner, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('perfil');

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-950/8 border border-stone-200 flex-shrink-0">
              <i className={`${TYPE_ICONS[partner.type] || 'ri-building-line'} text-[#2d4a63] text-base`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{partner.name}</p>
              <p className="text-[11px] text-stone-500">{partnerTypeLabels[partner.type] || partner.type} · {partner.city}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-stone-200 overflow-x-auto flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap
                ${tab === t.id ? 'text-teal-700 border-teal-500' : 'text-stone-500 border-transparent hover:text-stone-700'}`}>
              <i className={`${t.icon} text-xs`}></i>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'perfil'      && <PerfilTab partner={partner} />}
          {tab === 'operacao'    && <OperacaoTab partner={partner} />}
          {tab === 'vinculos'    && <VinculosTab partner={partner} />}
          {tab === 'historico'   && <HistoricoTab />}
          {tab === 'observacoes' && <ObservacoesTab partner={partner} />}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
          <button type="button" className="flex-1 h-9 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5">
            <i className="ri-compass-discover-line text-sm"></i>
            Nova Experiência
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-phone-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-white hover:bg-stone-100 text-stone-600 text-xs rounded-xl border border-stone-200 transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-mail-send-line text-sm"></i>
          </button>
          <button type="button" className="h-9 px-3 bg-navy-950 hover:bg-navy-900 text-white text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-edit-line text-sm"></i>
          </button>
        </div>
      </aside>
    </>
  );
}
