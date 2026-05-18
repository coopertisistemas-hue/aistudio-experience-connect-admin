import { useState } from 'react';
import type { MockDriver, DriverStatus, DayAvailability } from '@/mocks/admin-drivers';

interface DriverDetailDrawerProps {
  driver: MockDriver;
  onClose: () => void;
}

type DrawerTab = 'perfil' | 'operacao' | 'veiculo' | 'disponibilidade' | 'historico' | 'app';

const tabs: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'perfil',        label: 'Perfil',         icon: 'ri-user-line' },
  { id: 'operacao',      label: 'Hoje',           icon: 'ri-car-line' },
  { id: 'veiculo',       label: 'Veículo',        icon: 'ri-taxi-line' },
  { id: 'disponibilidade', label: 'Agenda',       icon: 'ri-calendar-2-line' },
  { id: 'historico',     label: 'Desempenho',     icon: 'ri-bar-chart-line' },
  { id: 'app',           label: 'App',            icon: 'ri-smartphone-line' },
];

const statusConfig: Record<DriverStatus, { label: string; badge: string; dot: string }> = {
  available:   { label: 'Disponível',   badge: 'bg-teal-50 text-teal-700 border-teal-200',    dot: 'bg-teal-500' },
  on_trip:     { label: 'Em Transfer',  badge: 'bg-navy-50 text-navy-700 border-navy-200',     dot: 'bg-navy-500' },
  off_duty:    { label: 'Offline',      badge: 'bg-stone-100 text-stone-600 border-stone-200', dot: 'bg-stone-400' },
  paused:      { label: 'Pausado',      badge: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  unavailable: { label: 'Indisponível', badge: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400' },
  pending:     { label: 'Pendente',     badge: 'bg-sand-100 text-navy-500 border-sand-300',    dot: 'bg-sand-400' },
};

const tripStatusConfig: Record<string, { label: string; dot: string }> = {
  completed:      { label: 'Concluído',         dot: 'bg-sand-400' },
  in_progress:    { label: 'Em Andamento',      dot: 'bg-teal-500' },
  driver_assigned:{ label: 'Motorista Atribuído', dot: 'bg-navy-500' },
  scheduled:      { label: 'Agendado',          dot: 'bg-stone-400' },
};

const availabilityConfig: Record<DayAvailability, { label: string; bg: string; text: string }> = {
  available: { label: 'Disponível', bg: 'bg-teal-50 border-teal-200',   text: 'text-teal-700' },
  partial:   { label: 'Parcial',    bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  off:       { label: 'Folga',      bg: 'bg-stone-100 border-stone-200', text: 'text-stone-500' },
  blocked:   { label: 'Bloqueado',  bg: 'bg-red-50 border-red-200',     text: 'text-red-500' },
};

const shiftLabel: Record<string, string> = {
  morning: 'Manhã', afternoon: 'Tarde', evening: 'Noite',
};

function PerformanceRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-navy-600">{label}</span>
        <span className={`text-xs font-bold ${value >= 95 ? 'text-teal-600' : value >= 85 ? 'text-navy-700' : 'text-amber-600'}`}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

export default function DriverDetailDrawer({ driver, onClose }: DriverDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('perfil');
  const s = statusConfig[driver.status];
  const joinedDate = new Date(driver.joined_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const scrollTo = (id: DrawerTab) => {
    setActiveTab(id);
    const el = document.getElementById(`ddr-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="fixed inset-0 bg-navy-950/40 z-40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-sand-200 flex-shrink-0">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-navy-950 text-white text-base font-bold">
                {driver.initials}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${s.dot}`}></span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-900 truncate">{driver.full_name}</p>
              <p className="text-[11px] text-navy-500 mt-0.5 truncate">{driver.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-lg border ${s.badge}`}>{s.label}</span>
                <span className="text-[9px] text-navy-400 font-mono">CNH {driver.license_type}</span>
                {driver.performance.incidents > 0 && (
                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
                    {driver.performance.incidents} ocorr.
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-sand-100 text-navy-400 hover:text-navy-700 transition-colors cursor-pointer flex-shrink-0 ml-2"
          >
            <i className="ri-close-line text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-none flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollTo(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-navy-950 text-white'
                  : 'text-navy-500 hover:bg-sand-100 hover:text-navy-700'
              }`}
            >
              <i className={`${tab.icon} text-xs`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* ── Perfil ── */}
          <div id="ddr-perfil">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-user-line"></i> Perfil do Motorista
            </h3>
            <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Nome</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{driver.full_name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Função</p>
                  <p className="text-xs font-medium text-navy-800 mt-0.5">Motorista</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">E-mail</p>
                  <p className="text-xs text-navy-700 mt-0.5 truncate">{driver.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Telefone</p>
                  <p className="text-xs text-navy-700 mt-0.5">{driver.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">CNH Tipo</p>
                  <p className="text-xs font-semibold text-navy-800 mt-0.5">{driver.license_type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider">Desde</p>
                  <p className="text-xs text-navy-700 mt-0.5">{joinedDate}</p>
                </div>
              </div>
              {driver.notes && (
                <div className="pt-3 border-t border-sand-200">
                  <p className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-xs text-navy-700 leading-relaxed">{driver.notes}</p>
                </div>
              )}
            </div>

            {/* Quick rating */}
            <div className="mt-3 bg-navy-950 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wider">Avaliação Média</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-serif text-2xl font-semibold text-white">
                    {driver.performance.avg_rating > 0 ? driver.performance.avg_rating.toFixed(1) : '—'}
                  </span>
                  {driver.performance.avg_rating > 0 && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        star <= Math.round(driver.performance.avg_rating)
                          ? <i key={star} className="ri-star-fill text-amber-400 text-sm"></i>
                          : <i key={star} className="ri-star-line text-amber-300 text-sm"></i>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-[10px] uppercase tracking-wider">Transfers</p>
                <p className="text-white text-xl font-bold mt-0.5">{driver.transfers_total}</p>
              </div>
            </div>
          </div>

          {/* ── Operação de Hoje ── */}
          <div id="ddr-operacao">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-car-line"></i> Operação de Hoje ({driver.transfers_today})
            </h3>
            {driver.today_transfers.length === 0 ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-5 text-center">
                <i className="ri-calendar-check-line text-navy-300 text-xl block mb-2"></i>
                <p className="text-xs text-navy-500 font-medium">Sem transfers para hoje</p>
              </div>
            ) : (
              <div className="space-y-2">
                {driver.today_transfers.map((t) => {
                  const ts = tripStatusConfig[t.status] ?? tripStatusConfig.scheduled;
                  const dt = new Date(t.scheduled_at);
                  return (
                    <div key={t.id} className="flex items-center gap-3 bg-sand-50 border border-sand-200 rounded-xl px-4 py-3">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ts.dot} ${t.status === 'in_progress' ? 'animate-pulse' : ''}`}></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-mono font-bold text-navy-700">{t.reference}</p>
                          <p className="text-[10px] text-navy-400">
                            {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-[11px] text-navy-500 truncate mt-0.5">{t.route_name}</p>
                      </div>
                      <span className="text-[9px] text-navy-500 font-medium flex-shrink-0">{ts.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Veículo ── */}
          <div id="ddr-veiculo">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-taxi-line"></i> Veículo Vinculado
            </h3>
            {driver.assigned_vehicle ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-100 flex-shrink-0">
                    <i className="ri-car-line text-navy-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-800">{driver.assigned_vehicle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-navy-500 bg-white border border-sand-200 px-1.5 py-0.5 rounded">
                        {driver.assigned_vehicle_plate}
                      </span>
                      {driver.assigned_vehicle_type && (
                        <span className="text-[10px] text-navy-400">{driver.assigned_vehicle_type}</span>
                      )}
                    </div>
                  </div>
                </div>
                {driver.vehicle_capacity && (
                  <div className="pt-3 border-t border-sand-200">
                    <div className="flex items-center justify-between text-[10px] text-navy-400 mb-1">
                      <span>Capacidade</span>
                      <span className="font-semibold text-navy-600">{driver.vehicle_capacity} lugares</span>
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t border-sand-200 flex gap-2">
                  <button type="button" className="flex-1 h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer">
                    <i className="ri-link text-xs"></i>
                    Alterar Veículo
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                    <i className="ri-car-line text-amber-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Sem veículo vinculado</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Motorista não pode operar sem veículo</p>
                  </div>
                </div>
                <button type="button" className="w-full h-8 flex items-center justify-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                  <i className="ri-link text-xs"></i>
                  Vincular Veículo
                </button>
              </div>
            )}
          </div>

          {/* ── Disponibilidade ── */}
          <div id="ddr-disponibilidade">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-calendar-2-line"></i> Disponibilidade — Próximos 7 dias
            </h3>
            <div className="space-y-2">
              {driver.availability.map((day) => {
                const dc = availabilityConfig[day.status];
                return (
                  <div key={day.date} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dc.bg}`}>
                    <div className="w-12 flex-shrink-0">
                      <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">{day.label}</p>
                      <p className="text-[10px] text-navy-400">
                        {new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${dc.text}`}>{dc.label}</p>
                      {day.shifts.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {day.shifts.map((shift) => (
                            <span key={shift} className="text-[9px] font-medium text-navy-500 bg-white/70 border border-sand-200 px-1.5 py-0.5 rounded">
                              {shiftLabel[shift]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      day.status === 'available' ? 'bg-teal-500' :
                      day.status === 'partial' ? 'bg-amber-500' :
                      day.status === 'blocked' ? 'bg-red-400' :
                      'bg-stone-300'
                    }`}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Histórico / Desempenho ── */}
          <div id="ddr-historico">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-bar-chart-line"></i> Desempenho
            </h3>
            <div className="space-y-3">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Este mês', value: driver.performance.transfers_this_month, icon: 'ri-calendar-check-line' },
                  { label: 'Esta semana', value: driver.performance.transfers_this_week, icon: 'ri-calendar-event-line' },
                  { label: 'Ocorrências', value: driver.performance.incidents, icon: 'ri-alert-line', warn: driver.performance.incidents > 0 },
                ].map((s) => (
                  <div key={s.label} className={`rounded-xl border p-3 text-center ${s.warn ? 'bg-amber-50 border-amber-200' : 'bg-sand-50 border-sand-200'}`}>
                    <i className={`${s.icon} text-sm mb-1 block ${s.warn ? 'text-amber-500' : 'text-navy-400'}`}></i>
                    <p className={`font-serif text-xl font-semibold ${s.warn && s.value > 0 ? 'text-amber-700' : 'text-navy-800'}`}>{s.value}</p>
                    <p className="text-[9px] text-navy-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Performance bars */}
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
                <PerformanceRow label="Taxa de Pontualidade" value={driver.performance.on_time_rate} color="bg-teal-500" />
                <PerformanceRow label="Taxa de Conclusão" value={driver.performance.completion_rate} color="bg-navy-500" />
                <PerformanceRow label="Taxa de Aceitação" value={driver.performance.acceptance_rate} color="bg-navy-400" />
              </div>
            </div>
          </div>

          {/* ── App Mobile ── */}
          <div id="ddr-app">
            <h3 className="text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i className="ri-smartphone-line"></i> App do Motorista
            </h3>

            {/* Explanation banner */}
            <div className="bg-navy-50 border border-navy-100 rounded-xl px-4 py-3.5 mb-3 flex items-start gap-3">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0 mt-0.5">
                <i className="ri-information-line text-navy-600 text-sm"></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-navy-800 mb-0.5">Acesso exclusivo pelo App</p>
                <p className="text-[11px] text-navy-500 leading-relaxed">
                  Motoristas não acessam o painel web. Toda a operação diária — receber transfers, confirmar chegadas e registrar conclusões — acontece pelo App do Motorista.
                </p>
              </div>
            </div>

            {driver.app_installed ? (
              <div className="bg-sand-50 border border-sand-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-100 flex-shrink-0">
                    <i className="ri-smartphone-line text-teal-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-teal-800">App instalado</p>
                    <p className="text-[10px] text-navy-500 mt-0.5">{driver.app_device}</p>
                  </div>
                </div>
                {driver.app_last_login && (
                  <div className="pt-3 border-t border-sand-200">
                    <p className="text-[10px] text-navy-400 uppercase tracking-wider">Último acesso</p>
                    <p className="text-xs font-medium text-navy-700 mt-0.5">
                      {new Date(driver.app_last_login).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-sand-200">
                  <button type="button" className="w-full h-8 flex items-center justify-center gap-1.5 bg-white border border-sand-200 text-navy-600 text-xs font-medium rounded-lg hover:bg-sand-100 transition-colors cursor-pointer">
                    <i className="ri-send-plane-line text-xs"></i>
                    Reenviar Convite
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-100 border border-amber-200 flex-shrink-0">
                    <i className="ri-smartphone-line text-amber-600 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">App não instalado</p>
                    <p className="text-[10px] text-amber-600 mt-0.5">Motorista ainda não recebeu ou aceitou o convite</p>
                  </div>
                </div>
                <button type="button" className="w-full h-9 flex items-center justify-center gap-1.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                  <i className="ri-send-plane-line text-xs"></i>
                  Enviar Convite de Acesso
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sand-200 flex-shrink-0 bg-sand-50/60">
          <div className="flex gap-2 mb-2">
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              Atribuir Transfer
            </button>
            <button type="button" className="flex-1 py-2.5 bg-white hover:bg-sand-100 text-navy-700 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-sand-200 whitespace-nowrap">
              {driver.assigned_vehicle ? 'Alterar Veículo' : 'Vincular Veículo'}
            </button>
          </div>
          <div className="flex gap-2">
            {!driver.app_installed && (
              <button type="button" className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-send-plane-line mr-1.5"></i>
                Enviar Convite App
              </button>
            )}
            <button type="button" className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-xl transition-colors cursor-pointer border border-red-200 whitespace-nowrap">
              Desativar Motorista
            </button>
          </div>
        </div>
      </div>
    </>
  );
}