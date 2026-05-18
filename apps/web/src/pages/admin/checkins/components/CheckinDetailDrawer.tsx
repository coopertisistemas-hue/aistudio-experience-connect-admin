import { useState } from 'react';
import type { MockCheckin, CheckinStatus, MockCheckinPassenger } from '@/mocks/admin-checkins';

interface CheckinDetailDrawerProps {
  checkin: MockCheckin;
  onClose: () => void;
  onToast: (msg: string) => void;
}

type TabId = 'reserva' | 'passageiros' | 'transfer' | 'operacao' | 'timeline' | 'embarque';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'reserva',     label: 'Reserva',     icon: 'ri-calendar-check-line' },
  { id: 'passageiros', label: 'Passageiros', icon: 'ri-group-line' },
  { id: 'transfer',    label: 'Transfer',    icon: 'ri-car-line' },
  { id: 'operacao',    label: 'Operação',    icon: 'ri-settings-3-line' },
  { id: 'timeline',   label: 'Timeline',    icon: 'ri-git-commit-line' },
  { id: 'embarque',   label: 'Embarque',    icon: 'ri-route-line' },
];

const statusConfig: Record<CheckinStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending:    { label: 'Pendente',    bg: 'bg-amber-50',            text: 'text-amber-700',  dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmado',  bg: 'bg-teal-50',             text: 'text-teal-700',   dot: 'bg-teal-500' },
  boarded:    { label: 'Embarcado',   bg: 'bg-navy-950/[0.07]',     text: 'text-[#1e3a5f]',  dot: 'bg-[#1e3a5f]' },
  in_transit: { label: 'Em Trânsito', bg: 'bg-teal-50',             text: 'text-teal-800',   dot: 'bg-teal-600 animate-pulse' },
  completed:  { label: 'Finalizado',  bg: 'bg-stone-100',           text: 'text-stone-500',  dot: 'bg-stone-400' },
  absent:     { label: 'Ausente',     bg: 'bg-red-50',              text: 'text-red-600',    dot: 'bg-red-500' },
  cancelled:  { label: 'Cancelado',   bg: 'bg-stone-100',           text: 'text-stone-400',  dot: 'bg-stone-300' },
};

const paxStatusConfig: Record<CheckinStatus, { label: string; icon: string; color: string }> = {
  pending:    { label: 'Pendente',   icon: 'ri-time-line',           color: 'text-amber-500' },
  confirmed:  { label: 'Confirmado', icon: 'ri-checkbox-circle-line', color: 'text-teal-600' },
  boarded:    { label: 'Embarcado',  icon: 'ri-user-follow-line',    color: 'text-[#1e3a5f]' },
  in_transit: { label: 'Em Trânsito',icon: 'ri-navigation-line',     color: 'text-teal-700' },
  completed:  { label: 'Finalizado', icon: 'ri-flag-line',           color: 'text-stone-400' },
  absent:     { label: 'Ausente',    icon: 'ri-user-unfollow-line',  color: 'text-red-500' },
  cancelled:  { label: 'Cancelado',  icon: 'ri-close-circle-line',  color: 'text-stone-400' },
};

function InfoRow({ label, value, accent }: { label: string; value: string | null; accent?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 text-xs flex-shrink-0">{label}</span>
      <span className={`text-xs font-medium text-right ${accent ?? 'text-stone-700'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function PassengerRow({ pax }: { pax: MockCheckinPassenger }) {
  const sc = paxStatusConfig[pax.checkin_status];
  const initials = pax.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const ageIcon = pax.age_group === 'child' ? '🧒' : pax.age_group === 'senior' ? '👴' : '';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-950/[0.06] flex-shrink-0">
        <span className="text-[11px] font-bold text-[#1e3a5f]">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 flex items-center gap-1.5">
          {pax.full_name} {ageIcon}
          {pax.seat && <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium">{pax.seat}</span>}
        </p>
        {pax.document && <p className="text-[11px] text-stone-400">{pax.document}</p>}
        {pax.special_needs && (
          <p className="text-[10px] text-amber-600 mt-0.5">
            <i className="ri-information-line mr-0.5"></i>{pax.special_needs}
          </p>
        )}
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${sc.color}`}>
        <i className={`${sc.icon} text-sm`}></i>
        <span className="text-[11px]">{sc.label}</span>
      </div>
      {pax.checked_in_at && (
        <span className="text-[10px] text-stone-400 flex-shrink-0">
          {new Date(pax.checked_in_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

function BoardingVisualization({ checkin }: { checkin: MockCheckin }) {
  const cap = checkin.vehicle_capacity ?? checkin.passenger_count;
  const seats = Array.from({ length: cap }, (_, i) => {
    const pax = checkin.passengers[i];
    return { index: i, pax: pax ?? null };
  });

  const boardedPct = cap > 0 ? Math.round((checkin.boarded_count / cap) * 100) : 0;
  const confirmedPct = cap > 0 ? Math.round((checkin.confirmed_count / cap) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Seat grid */}
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Visualização de Assentos</p>
        <div className="flex flex-wrap gap-2">
          {seats.map((seat) => (
            <div
              key={seat.index}
              title={seat.pax?.full_name ?? `Assento ${seat.index + 1}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-[10px] font-bold transition-colors ${
                seat.pax?.checkin_status === 'boarded' || seat.pax?.checkin_status === 'in_transit' || seat.pax?.checkin_status === 'completed'
                  ? 'bg-navy-950 border-navy-950 text-white'
                  : seat.pax?.checkin_status === 'confirmed'
                  ? 'bg-teal-100 border-teal-300 text-teal-700'
                  : seat.pax?.checkin_status === 'absent'
                  ? 'bg-red-50 border-red-200 text-red-400'
                  : seat.pax
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-stone-50 border-stone-200 text-stone-300'
              }`}
            >
              {seat.pax
                ? seat.pax.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')
                : seat.pax === null && seat.index < cap
                ? <i className="ri-user-line text-sm"></i>
                : '—'}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[11px] text-stone-400 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-navy-950 inline-block"></span>Embarcado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-100 border border-teal-300 inline-block"></span>Confirmado</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block"></span>Pendente</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-stone-50 border border-stone-200 inline-block"></span>Vago</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Capacidade', value: cap, color: 'text-stone-700' },
          { label: 'Confirmados', value: checkin.confirmed_count, color: 'text-teal-600' },
          { label: 'Embarcados', value: checkin.boarded_count, color: 'text-[#1e3a5f]' },
        ].map((s) => (
          <div key={s.label} className="bg-stone-50 rounded-xl p-3 text-center border border-stone-100">
            <p className={`text-xl font-serif font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-stone-400 text-[10px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-500">Taxa de confirmação</span>
            <span className="font-semibold text-teal-600">{confirmedPct}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full transition-all duration-700" style={{ width: `${confirmedPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-500">Taxa de embarque</span>
            <span className="font-semibold text-[#1e3a5f]">{boardedPct}%</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1e3a5f] rounded-full transition-all duration-700" style={{ width: `${boardedPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QRPlaceholder({ qrRef }: { qrRef?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-40 h-40 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center bg-stone-50 gap-2">
        <i className="ri-qr-code-line text-4xl text-stone-300"></i>
        <span className="text-[10px] text-stone-400 font-medium">QR Check-in</span>
      </div>
      {qrRef && (
        <p className="text-[11px] text-stone-400 font-mono">{qrRef}</p>
      )}
      <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200 w-full text-center space-y-2">
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-950/[0.06] mx-auto">
          <i className="ri-smartphone-line text-sm text-[#1e3a5f]"></i>
        </div>
        <p className="text-sm font-medium text-stone-700">Check-in pelo App do Motorista</p>
        <p className="text-xs text-stone-500 leading-relaxed">
          O motorista valida o embarque de cada passageiro diretamente pelo App, escaneando o código QR da reserva.
        </p>
        <span className="inline-block text-[10px] bg-teal-50 text-teal-600 px-3 py-1 rounded-full font-medium border border-teal-200">
          Funcionalidade disponível no App
        </span>
      </div>
    </div>
  );
}

export default function CheckinDetailDrawer({ checkin, onClose, onToast }: CheckinDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('reserva');
  const sc = statusConfig[checkin.status];

  const timelineColorMap: Record<string, string> = {
    teal: 'bg-teal-500',
    navy: 'bg-[#1e3a5f]',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    stone: 'bg-stone-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-navy-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl h-full flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif text-lg font-semibold text-stone-900 truncate">{checkin.passenger_lead}</h2>
                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                  {sc.label}
                </span>
              </div>
              <p className="text-stone-500 text-xs mt-0.5">{checkin.booking_reference} · {checkin.route_name}</p>
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 transition-colors cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-lg"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-navy-950 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                <i className={`${tab.icon} text-xs`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* RESERVA */}
          {activeTab === 'reserva' && (
            <div className="space-y-4">
              <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-calendar-check-line text-[#1e3a5f] text-sm"></i>
                  <span className="text-sm font-semibold text-stone-700">Dados da Reserva</span>
                </div>
                <InfoRow label="Referência" value={checkin.booking_reference} />
                <InfoRow label="Data" value={checkin.scheduled_date} />
                <InfoRow label="Horário" value={checkin.scheduled_time} />
                <InfoRow label="Rota" value={checkin.route_name} />
                <InfoRow label="Passageiros" value={`${checkin.passenger_count} pessoa${checkin.passenger_count !== 1 ? 's' : ''}`} />
              </div>

              <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-map-pin-line text-[#1e3a5f] text-sm"></i>
                  <span className="text-sm font-semibold text-stone-700">Origem & Destino</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 mt-1 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-teal-200"></span>
                    <div className="w-px h-8 border-l-2 border-dashed border-stone-300"></div>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a5f] border-2 border-[#1e3a5f]/30"></span>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">Origem</p>
                      <p className="text-sm text-stone-700 font-medium">{checkin.origin}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#1e3a5f] font-semibold uppercase tracking-wider">Destino</p>
                      <p className="text-sm text-stone-700 font-medium">{checkin.destination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {checkin.notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{checkin.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* PASSAGEIROS */}
          {activeTab === 'passageiros' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-700">{checkin.passenger_count} passageiro{checkin.passenger_count !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-medium">{checkin.confirmed_count} confirmados</span>
                  <span className="text-[11px] text-[#1e3a5f] bg-navy-950/[0.06] px-2 py-0.5 rounded-full font-medium">{checkin.boarded_count} embarcados</span>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
                {checkin.passengers.map((pax) => (
                  <div key={pax.id} className="px-4">
                    <PassengerRow pax={pax} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRANSFER */}
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              {/* Driver */}
              {checkin.driver_name ? (
                <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-steering-2-line text-[#1e3a5f] text-sm"></i>
                    <span className="text-sm font-semibold text-stone-700">Motorista</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e3a5f] flex-shrink-0">
                      <span className="text-white font-bold text-sm">{checkin.driver_initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm">{checkin.driver_name}</p>
                      <p className="text-stone-500 text-xs">{checkin.driver_phone}</p>
                    </div>
                    <a href={`tel:${checkin.driver_phone}`} className="w-8 h-8 flex items-center justify-center rounded-lg bg-teal-50 border border-teal-200 text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer">
                      <i className="ri-phone-line text-sm"></i>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-3">
                  <i className="ri-alert-line text-amber-500"></i>
                  <p className="text-sm text-amber-700">Nenhum motorista atribuído a este transfer.</p>
                </div>
              )}

              {/* Vehicle */}
              {checkin.vehicle_name ? (
                <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-taxi-line text-[#1e3a5f] text-sm"></i>
                    <span className="text-sm font-semibold text-stone-700">Veículo</span>
                  </div>
                  <InfoRow label="Veículo" value={checkin.vehicle_name} />
                  <InfoRow label="Tipo" value={checkin.vehicle_type} />
                  <InfoRow label="Placa" value={checkin.vehicle_plate} />
                  <InfoRow label="Capacidade" value={checkin.vehicle_capacity ? `${checkin.vehicle_capacity} lugares` : null} />
                  <InfoRow label="Passageiros" value={`${checkin.passenger_count} de ${checkin.vehicle_capacity}`} />
                </div>
              ) : (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 flex items-center gap-3">
                  <i className="ri-alert-line text-amber-500"></i>
                  <p className="text-sm text-amber-700">Nenhum veículo atribuído a este transfer.</p>
                </div>
              )}
            </div>
          )}

          {/* OPERAÇÃO */}
          {activeTab === 'operacao' && (
            <div className="space-y-4">
              <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-settings-3-line text-[#1e3a5f] text-sm"></i>
                  <span className="text-sm font-semibold text-stone-700">Status Operacional</span>
                </div>
                <InfoRow label="Status Check-in" value={sc.label} />
                <InfoRow label="Embarque" value={
                  checkin.boarding_status === 'completed' ? 'Concluído' :
                  checkin.boarding_status === 'in_progress' ? 'Em andamento' :
                  checkin.boarding_status === 'delayed' ? 'Atrasado' :
                  'Não iniciado'
                } />
                <InfoRow
                  label="Início check-in"
                  value={checkin.checkin_started_at
                    ? new Date(checkin.checkin_started_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null}
                />
                <InfoRow
                  label="Início embarque"
                  value={checkin.boarding_started_at
                    ? new Date(checkin.boarding_started_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null}
                />
                <InfoRow
                  label="Finalizado em"
                  value={checkin.completed_at
                    ? new Date(checkin.completed_at).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
                    : null}
                />
                {(checkin.delay_minutes ?? 0) > 0 && (
                  <div className="mt-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700">
                      <i className="ri-alarm-warning-line mr-1.5"></i>
                      Atraso de <strong>{checkin.delay_minutes} minutos</strong> registrado
                    </p>
                  </div>
                )}
              </div>

              {/* QR */}
              <QRPlaceholder qrRef={checkin.qr_code_ref} />
            </div>
          )}

          {/* TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-1">
              {checkin.timeline.map((ev, idx) => (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${timelineColorMap[ev.color]}`}>
                      <i className={`${ev.icon} text-white text-[10px]`}></i>
                    </div>
                    {idx < checkin.timeline.length - 1 && (
                      <div className="w-px h-6 bg-stone-200 mt-1"></div>
                    )}
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800">{ev.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{ev.description}</p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {new Date(ev.at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EMBARQUE */}
          {activeTab === 'embarque' && (
            <BoardingVisualization checkin={checkin} />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-200 bg-stone-50/50 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { onToast('Check-in confirmado com sucesso.'); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line"></i>
              Confirmar Check-in
            </button>
            <button
              type="button"
              onClick={() => { onToast('Embarque confirmado com sucesso.'); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 text-white text-sm font-semibold hover:bg-[#162d4a] transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-route-line"></i>
              Confirmar Embarque
            </button>
            <button
              type="button"
              onClick={() => { onToast('Transfer reagendado. Notificação enviada.'); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-line"></i>
              Reagendar
            </button>
            <button
              type="button"
              onClick={() => { onToast('Redirecionando para o transfer...'); }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-car-line"></i>
              Ver Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}