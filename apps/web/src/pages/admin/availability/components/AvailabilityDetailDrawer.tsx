import { useState, useEffect } from 'react';
import type { AvailabilityDriver, AvailabilityVehicle } from '@/mocks/admin-availability';
import { weekDays } from '@/mocks/admin-availability';

type DrawerTab = 'recurso' | 'agenda' | 'operacao' | 'bloqueios' | 'historico';

interface AvailabilityDetailDrawerProps {
  resource: AvailabilityDriver | AvailabilityVehicle | null;
  resourceType: 'driver' | 'vehicle' | null;
  onClose: () => void;
  onAddToast: (msg: string, type?: 'success' | 'info') => void;
}

const tabList: { id: DrawerTab; label: string; icon: string }[] = [
  { id: 'recurso', label: 'Recurso', icon: 'ri-user-line' },
  { id: 'agenda', label: 'Agenda', icon: 'ri-calendar-line' },
  { id: 'operacao', label: 'Operação', icon: 'ri-route-line' },
  { id: 'bloqueios', label: 'Bloqueios', icon: 'ri-forbid-2-line' },
  { id: 'historico', label: 'Histórico', icon: 'ri-history-line' },
];

const slotLabelMap: Record<string, { label: string; color: string; dot: string }> = {
  available:    { label: 'Disponível',   color: 'text-teal-700',   dot: 'bg-teal-500' },
  reserved:     { label: 'Reservado',    color: 'text-sky-700',    dot: 'bg-sky-500' },
  in_operation: { label: 'Em operação',  color: 'text-indigo-700', dot: 'bg-indigo-500' },
  blocked:      { label: 'Bloqueado',    color: 'text-red-700',    dot: 'bg-red-400' },
  maintenance:  { label: 'Manutenção',   color: 'text-amber-700',  dot: 'bg-amber-500' },
  off:          { label: 'Folga',        color: 'text-stone-500',  dot: 'bg-stone-400' },
  partial:      { label: 'Parcial',      color: 'text-amber-700',  dot: 'bg-amber-400' },
};

function isDriver(r: AvailabilityDriver | AvailabilityVehicle): r is AvailabilityDriver {
  return 'initials' in r;
}

export default function AvailabilityDetailDrawer({
  resource, resourceType, onClose, onAddToast,
}: AvailabilityDetailDrawerProps) {
  const [tab, setTab] = useState<DrawerTab>('recurso');
  const [blockNotes, setBlockNotes] = useState('');
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (!resource) return;
    setTab('recurso');
    setBlockNotes('');
  }, [resource]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!resource || !resourceType) return null;

  const driver = isDriver(resource) ? resource : null;
  const vehicle = !isDriver(resource) ? resource : null;

  const handleBlock = async () => {
    setBlocking(true);
    await new Promise((r) => setTimeout(r, 800));
    setBlocking(false);
    setBlockNotes('');
    onAddToast('Horário bloqueado com sucesso.', 'success');
  };

  const renderContent = () => {
    switch (tab) {
      case 'recurso':
        return (
          <div className="flex flex-col gap-4">
            {/* Header card */}
            <div className="flex items-center gap-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
              {driver ? (
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${driver.avatar_color}`}>
                  {driver.initials}
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center flex-shrink-0">
                  <i className="ri-taxi-line text-stone-600 text-lg"></i>
                </div>
              )}
              <div>
                <p className="text-base font-bold text-stone-900">
                  {driver ? driver.name : vehicle?.plate}
                </p>
                <p className="text-xs text-stone-500">
                  {driver ? `${driver.category} · ⭐ ${driver.rating}` : vehicle?.model}
                </p>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {driver && (
                <>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Habilitação</span>
                    <span className="text-sm font-semibold text-stone-800">{driver.license}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Escalas semana</span>
                    <span className="text-sm font-semibold text-stone-800">{driver.total_this_week}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Bloqueios</span>
                    <span className={`text-sm font-semibold ${driver.blocked_days > 0 ? 'text-amber-600' : 'text-stone-800'}`}>
                      {driver.blocked_days} dia{driver.blocked_days !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Hoje</span>
                    <span className="text-sm font-semibold text-stone-800">{driver.shifts_today} escala{driver.shifts_today !== 1 ? 's' : ''}</span>
                  </div>
                </>
              )}
              {vehicle && (
                <>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Capacidade</span>
                    <span className="text-sm font-semibold text-stone-800">{vehicle.capacity} pax</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Motorista</span>
                    <span className="text-xs font-semibold text-stone-800 truncate">{vehicle.assigned_driver_name ?? '—'}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Km hoje</span>
                    <span className="text-sm font-semibold text-stone-800">{vehicle.km_today} km</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-3 bg-white border border-stone-200 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wide font-bold">Ops. hoje</span>
                    <span className="text-sm font-semibold text-stone-800">{vehicle.operations_today}</span>
                  </div>
                </>
              )}
            </div>

            {vehicle?.maintenance_due && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <i className="ri-tools-line text-amber-600 text-sm flex-shrink-0"></i>
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Manutenção prevista:</span>{' '}
                  {new Date(vehicle.maintenance_due).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </p>
              </div>
            )}
          </div>
        );

      case 'agenda':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-stone-500">Agenda desta semana — 3 turnos por dia (Manhã / Tarde / Noite)</p>
            {weekDays.map((day) => {
              const schedule = resource.weekly[day.key as keyof typeof resource.weekly];
              return (
                <div key={day.key} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-b border-stone-100">
                    <span className="text-xs font-bold text-stone-700">{day.full}</span>
                    {day.key === 'sat' && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-full">Hoje</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-stone-100">
                    {(['morning', 'afternoon', 'evening'] as const).map((shift) => {
                      const status = schedule[shift];
                      const cfg = slotLabelMap[status] ?? slotLabelMap.available;
                      return (
                        <div key={shift} className="flex flex-col items-center gap-1 px-2 py-2.5">
                          <i className={`${shift === 'morning' ? 'ri-sun-line' : shift === 'afternoon' ? 'ri-cloud-line' : 'ri-moon-line'} text-stone-400 text-xs`}></i>
                          <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}></span>
                            <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          {schedule.booking_ref && status !== 'off' && status !== 'available' && (
                            <span className="text-[10px] font-mono text-stone-400">{schedule.booking_ref}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {schedule.notes && (
                    <div className="px-3 py-1.5 bg-amber-50/60 border-t border-amber-100">
                      <p className="text-[11px] text-amber-700">{schedule.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'operacao':
        return (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl">
              <i className="ri-information-line text-stone-500 text-sm"></i>
              <p className="text-xs text-stone-600">Dados operacionais da semana corrente.</p>
            </div>
            {[
              { label: 'Escalas confirmadas', value: driver ? `${driver.total_this_week}` : `${vehicle?.operations_today}` },
              { label: 'Categoria', value: driver ? driver.category : vehicle?.type ?? '—' },
              { label: driver ? 'Avaliação' : 'Capacidade', value: driver ? `⭐ ${driver.rating}` : `${vehicle?.capacity} passageiros` },
              { label: driver ? 'Contato' : 'Motorista vinculado', value: driver ? driver.phone : vehicle?.assigned_driver_name ?? 'Sem motorista' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white border border-stone-200 rounded-xl">
                <span className="text-xs text-stone-500">{label}</span>
                <span className="text-xs font-semibold text-stone-800 text-right">{value}</span>
              </div>
            ))}
          </div>
        );

      case 'bloqueios':
        return (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-stone-500 mb-1">Registre um bloqueio de horário para este recurso.</p>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-stone-600">Observação</label>
              <textarea
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="Ex: Manutenção preventiva, consulta médica, folga pessoal…"
                className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors resize-none"
              />
              <p className="text-[11px] text-stone-400 text-right">{blockNotes.length}/300</p>
            </div>
            <button
              type="button"
              onClick={handleBlock}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {blocking ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-forbid-2-line text-sm"></i>}
              {blocking ? 'Registrando…' : 'Registrar Bloqueio'}
            </button>
          </div>
        );

      case 'historico':
        return (
          <div className="flex flex-col gap-2">
            {[
              { icon: 'ri-check-line', color: 'text-teal-600 bg-teal-50', label: 'Transfer concluído', sub: 'BK-0041 · Seg 12 Maio', time: '09:45' },
              { icon: 'ri-car-line', color: 'text-sky-600 bg-sky-50', label: 'Transfer em operação', sub: 'BK-0043 · Ter 13 Maio', time: '14:20' },
              { icon: 'ri-forbid-2-line', color: 'text-amber-600 bg-amber-50', label: 'Bloqueio registrado', sub: 'Treinamento · Qua 14 Maio', time: '08:00' },
              { icon: 'ri-check-double-line', color: 'text-teal-600 bg-teal-50', label: 'Escala confirmada', sub: 'BK-0049 · Qui 15 Maio', time: '13:00' },
            ].map(({ icon, color, label, sub, time }, idx) => (
              <div key={idx} className="flex items-start gap-3 px-3 py-3 bg-white border border-stone-200 rounded-xl">
                <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${color}`}>
                  <i className={`${icon} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-stone-800">{label}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">{sub}</p>
                </div>
                <span className="text-[11px] text-stone-400 flex-shrink-0">{time}</span>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col border-l border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 flex items-center justify-center">
              <i className={`${resourceType === 'driver' ? 'ri-steering-2-line' : 'ri-taxi-line'} text-teal-600 text-base`}></i>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">
                {driver ? driver.name : vehicle?.plate}
              </p>
              <p className="text-xs text-stone-500">{resourceType === 'driver' ? 'Motorista' : 'Veículo'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-stone-500 text-base"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-stone-100 bg-stone-50 overflow-x-auto flex-shrink-0">
          {tabList.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? 'bg-white text-teal-700 border border-stone-200'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <i className={`${t.icon} text-xs`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {renderContent()}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-4 py-4 border-t border-stone-200 bg-stone-50 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => { setTab('bloqueios'); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-forbid-2-line text-xs"></i>
            Bloquear
          </button>
          <button
            type="button"
            onClick={() => onAddToast('Escala ajustada.', 'success')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-edit-line text-xs"></i>
            Ajustar Escala
          </button>
          <button
            type="button"
            onClick={() => onAddToast('Redirecionando para transfers…', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-route-line text-xs"></i>
            Ver Transfers
          </button>
          <button
            type="button"
            onClick={() => onAddToast('Editor de disponibilidade em breve.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap ml-auto"
          >
            <i className="ri-calendar-line text-xs"></i>
            Editar
          </button>
        </div>
      </div>
    </>
  );
}