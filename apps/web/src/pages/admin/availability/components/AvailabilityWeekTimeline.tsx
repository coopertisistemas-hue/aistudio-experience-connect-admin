import type { AvailabilityDriver, AvailabilityVehicle, SlotStatus, WeekSchedule } from '@/mocks/admin-availability';
import { weekDays, todayKey } from '@/mocks/admin-availability';
import type { AvailView } from './AvailabilityFilterBar';

interface AvailabilityWeekTimelineProps {
  drivers: AvailabilityDriver[];
  vehicles: AvailabilityVehicle[];
  view: AvailView;
  onSelectDriver: (d: AvailabilityDriver) => void;
  onSelectVehicle: (v: AvailabilityVehicle) => void;
}

const slotColors: Record<SlotStatus, { bg: string; border: string; label: string; dot: string }> = {
  available:    { bg: 'bg-teal-500/[0.12]',   border: 'border-teal-300/50',  label: 'Disponível',   dot: 'bg-teal-500' },
  reserved:     { bg: 'bg-sky-500/[0.12]',    border: 'border-sky-300/50',   label: 'Reservado',    dot: 'bg-sky-500' },
  in_operation: { bg: 'bg-indigo-500/[0.12]', border: 'border-indigo-300/50',label: 'Em operação',  dot: 'bg-indigo-500' },
  blocked:      { bg: 'bg-red-400/[0.12]',    border: 'border-red-300/50',   label: 'Bloqueado',    dot: 'bg-red-400' },
  maintenance:  { bg: 'bg-amber-400/[0.12]',  border: 'border-amber-300/50', label: 'Manutenção',   dot: 'bg-amber-500' },
  off:          { bg: 'bg-stone-200/60',       border: 'border-stone-200',    label: 'Folga',        dot: 'bg-stone-400' },
  partial:      { bg: 'bg-amber-400/[0.10]',  border: 'border-amber-200',    label: 'Parcial',      dot: 'bg-amber-400' },
};

const shiftIcons: Record<'morning' | 'afternoon' | 'evening', string> = {
  morning: 'ri-sun-line',
  afternoon: 'ri-cloud-line',
  evening: 'ri-moon-line',
};

function SlotChip({ status, shift }: { status: SlotStatus; shift: 'morning' | 'afternoon' | 'evening' }) {
  const cfg = slotColors[status];
  return (
    <div
      title={`${shift === 'morning' ? 'Manhã' : shift === 'afternoon' ? 'Tarde' : 'Noite'}: ${cfg.label}`}
      className={`flex items-center justify-center w-full h-5 rounded border text-[9px] transition-all ${cfg.bg} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}></span>
    </div>
  );
}

function DayCell({ day, weekly, onClick }: {
  day: typeof weekDays[number];
  weekly: WeekSchedule;
  onClick: () => void;
}) {
  const slot = weekly[day.key as keyof WeekSchedule];
  const isToday = day.key === todayKey;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-1 p-1.5 rounded-xl border transition-all cursor-pointer hover:bg-stone-100/60 group min-w-0 ${
        isToday ? 'border-teal-300/60 bg-teal-500/[0.04]' : 'border-transparent'
      }`}
    >
      <SlotChip status={slot.morning} shift="morning" />
      <SlotChip status={slot.afternoon} shift="afternoon" />
      <SlotChip status={slot.evening} shift="evening" />
    </button>
  );
}

function DriverRow({ driver, onSelect }: { driver: AvailabilityDriver; onSelect: () => void }) {
  const statusDot = driver.status === 'active' ? 'bg-teal-500' : driver.status === 'on_leave' ? 'bg-amber-500' : 'bg-stone-400';

  return (
    <div className="grid grid-cols-[160px_repeat(7,_1fr)] gap-1 items-center px-2 py-2 hover:bg-stone-50/60 transition-colors rounded-xl group">
      {/* Info cell */}
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-2 text-left min-w-0 cursor-pointer group/btn"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${driver.avatar_color}`}>
          {driver.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-stone-800 truncate group-btn:text-teal-700 transition-colors leading-tight">
              {driver.name.split(' ')[0]}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`}></span>
          </div>
          <span className="text-[10px] text-stone-500 truncate block">{driver.category}</span>
        </div>
      </button>
      {/* Day cells */}
      {weekDays.map((day) => (
        <DayCell key={day.key} day={day} weekly={driver.weekly} onClick={onSelect} />
      ))}
    </div>
  );
}

function VehicleRow({ vehicle, onSelect }: { vehicle: AvailabilityVehicle; onSelect: () => void }) {
  const statusDot = vehicle.status === 'active' ? 'bg-teal-500' : vehicle.status === 'maintenance' ? 'bg-amber-500' : 'bg-stone-400';

  return (
    <div className="grid grid-cols-[160px_repeat(7,_1fr)] gap-1 items-center px-2 py-2 hover:bg-stone-50/60 transition-colors rounded-xl">
      {/* Info cell */}
      <button
        type="button"
        onClick={onSelect}
        className="flex items-center gap-2 text-left min-w-0 cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
          <i className="ri-taxi-line text-stone-600 text-xs"></i>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-stone-800 truncate leading-tight">
              {vehicle.plate}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot}`}></span>
          </div>
          <span className="text-[10px] text-stone-500 truncate block">{vehicle.type}</span>
        </div>
      </button>
      {/* Day cells */}
      {weekDays.map((day) => (
        <DayCell key={day.key} day={day} weekly={vehicle.weekly} onClick={onSelect} />
      ))}
    </div>
  );
}

export default function AvailabilityWeekTimeline({
  drivers, vehicles, view, onSelectDriver, onSelectVehicle,
}: AvailabilityWeekTimelineProps) {
  const showDrivers = view === 'all' || view === 'drivers';
  const showVehicles = view === 'all' || view === 'vehicles';

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-[160px_repeat(7,_1fr)] gap-1 px-2 py-3 bg-stone-50 border-b border-stone-100">
        <div className="flex items-center gap-2 px-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Recurso</span>
        </div>
        {weekDays.map((day) => {
          const isToday = day.key === todayKey;
          return (
            <div
              key={day.key}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg ${isToday ? 'bg-teal-500/[0.08]' : ''}`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wide ${isToday ? 'text-teal-600' : 'text-stone-500'}`}>
                {day.short}
              </span>
              <span className={`text-sm font-bold ${isToday ? 'text-teal-700' : 'text-stone-700'}`}>
                {day.date}
              </span>
              {isToday && <span className="text-[9px] font-semibold text-teal-600">Hoje</span>}
            </div>
          );
        })}
      </div>

      {/* Shift legend bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-stone-100 bg-stone-50/60 overflow-x-auto">
        {Object.entries(slotColors).filter(([k]) => k !== 'partial').map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
            <span className="text-[10px] text-stone-500 whitespace-nowrap">{cfg.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {Object.entries(shiftIcons).map(([shift, icon]) => (
            <div key={shift} className="flex items-center gap-1">
              <i className={`${icon} text-stone-400 text-[11px]`}></i>
              <span className="text-[10px] text-stone-400">
                {shift === 'morning' ? '6–12h' : shift === 'afternoon' ? '12–18h' : '18–23h'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-stone-100/80 p-2">
        {/* Drivers group */}
        {showDrivers && drivers.length > 0 && (
          <div className="pb-2 mb-2">
            <div className="flex items-center gap-2 px-2 py-2 mb-1">
              <i className="ri-steering-2-line text-stone-400 text-xs"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Motoristas · {drivers.length}
              </span>
            </div>
            {drivers.map((d) => (
              <DriverRow key={d.id} driver={d} onSelect={() => onSelectDriver(d)} />
            ))}
          </div>
        )}

        {/* Vehicles group */}
        {showVehicles && vehicles.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center gap-2 px-2 py-2 mb-1">
              <i className="ri-taxi-line text-stone-400 text-xs"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Veículos · {vehicles.length}
              </span>
            </div>
            {vehicles.map((v) => (
              <VehicleRow key={v.id} vehicle={v} onSelect={() => onSelectVehicle(v)} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!showDrivers && !showVehicles && (
          <div className="py-12 text-center">
            <i className="ri-calendar-2-line text-stone-300 text-3xl"></i>
            <p className="text-sm text-stone-500 mt-2">Nenhum recurso encontrado</p>
          </div>
        )}
      </div>

      {/* Mobile horizontal scroll hint */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center gap-2 sm:hidden">
        <i className="ri-drag-move-line text-stone-400 text-sm"></i>
        <span className="text-[11px] text-stone-400">Deslize para ver toda a semana</span>
      </div>
    </div>
  );
}