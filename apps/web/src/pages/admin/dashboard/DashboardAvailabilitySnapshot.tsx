import { Link } from 'react-router-dom';
import { mockDrivers } from '@/mocks/admin-drivers';
import { mockVehicles } from '@/mocks/admin-vehicles';

const availableDrivers = mockDrivers.filter((d) => d.status === 'available');
const onTripDrivers = mockDrivers.filter((d) => d.status === 'on_trip');
const pausedDrivers = mockDrivers.filter((d) => d.status === 'paused' || d.status === 'unavailable');

const availableVehicles = mockVehicles.filter((v) => v.status === 'available');
const inOperationVehicles = mockVehicles.filter((v) => v.status === 'in_operation');
const maintenanceVehicles = mockVehicles.filter((v) => v.status === 'maintenance' || v.status === 'inactive');

const operationalConflicts = [
  ...mockVehicles.filter((v) => v.maintenance_status === 'overdue' || v.maintenance_status === 'in_maintenance'),
  ...mockVehicles.filter((v) => v.status === 'attention'),
].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);

const driverConflicts = mockDrivers.filter((d) => d.status === 'pending');

type ConflictItem = {
  id: string;
  label: string;
  detail: string;
  severity: 'warning' | 'error';
};

const conflicts: ConflictItem[] = [
  ...operationalConflicts.map((v) => ({
    id: v.id,
    label: `${v.make} ${v.model}`,
    detail: v.maintenance_notes?.slice(0, 48) ?? 'Atenção operacional',
    severity: 'error' as const,
  })),
  ...driverConflicts.map((d) => ({
    id: d.id,
    label: d.full_name,
    detail: 'Cadastro pendente — sem acesso ao app',
    severity: 'warning' as const,
  })),
];

export default function DashboardAvailabilitySnapshot() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-calendar-todo-line text-indigo-600 text-base"></i>
          </div>
          <h2 className="text-navy-800 text-sm font-semibold">Disponibilidade Operacional</h2>
          <span className="text-stone-400 text-xs font-light">Motoristas · Veículos · Alertas</span>
        </div>
        <Link
          to="/admin/availability"
          className="text-xs text-teal-600 hover:text-teal-700 transition-colors font-medium cursor-pointer"
        >
          Ver disponibilidade
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Drivers */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Motoristas</p>
              <p className="text-navy-900 text-2xl font-semibold">{mockDrivers.length}</p>
              <p className="text-stone-400 text-xs mt-1">Total cadastrados</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
              <i className="ri-steering-2-line text-teal-600 text-base"></i>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-teal-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                <span className="text-xs text-teal-700 font-medium">Disponível</span>
              </div>
              <span className="text-xs font-semibold text-teal-700">{availableDrivers.length}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-indigo-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                <span className="text-xs text-indigo-700 font-medium">Em viagem</span>
              </div>
              <span className="text-xs font-semibold text-indigo-700">{onTripDrivers.length}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-stone-100 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0"></span>
                <span className="text-xs text-stone-600 font-medium">Pausado/Inativo</span>
              </div>
              <span className="text-xs font-semibold text-stone-600">{pausedDrivers.length}</span>
            </div>

            {/* Utilization bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-stone-400">Utilização hoje</span>
                <span className="text-[10px] font-medium text-navy-600">
                  {Math.round((onTripDrivers.length / mockDrivers.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${(onTripDrivers.length / mockDrivers.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Veículos</p>
              <p className="text-navy-900 text-2xl font-semibold">{mockVehicles.length}</p>
              <p className="text-stone-400 text-xs mt-1">Total na frota</p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-sky-50 border border-sky-100">
              <i className="ri-taxi-line text-sky-600 text-base"></i>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-teal-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></span>
                <span className="text-xs text-teal-700 font-medium">Disponível</span>
              </div>
              <span className="text-xs font-semibold text-teal-700">{availableVehicles.length}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-indigo-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></span>
                <span className="text-xs text-indigo-700 font-medium">Em operação</span>
              </div>
              <span className="text-xs font-semibold text-indigo-700">{inOperationVehicles.length}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 px-2.5 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span className="text-xs text-amber-700 font-medium">Manutenção</span>
              </div>
              <span className="text-xs font-semibold text-amber-700">{maintenanceVehicles.length}</span>
            </div>

            {/* Utilization bar */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-stone-400">Utilização hoje</span>
                <span className="text-[10px] font-medium text-navy-600">
                  {Math.round((inOperationVehicles.length / mockVehicles.length) * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${(inOperationVehicles.length / mockVehicles.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational conflicts */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-stone-400 text-[11px] font-medium uppercase tracking-wider mb-1">Alertas Operacionais</p>
              <p className={`text-2xl font-semibold ${conflicts.length > 0 ? 'text-red-500' : 'text-teal-600'}`}>
                {conflicts.length}
              </p>
              <p className="text-stone-400 text-xs mt-1">{conflicts.length === 0 ? 'Tudo em ordem' : 'Itens requerem atenção'}</p>
            </div>
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${
              conflicts.length > 0 ? 'bg-red-50 border border-red-100' : 'bg-teal-50 border border-teal-100'
            }`}>
              <i className={`ri-alarm-warning-line text-base ${conflicts.length > 0 ? 'text-red-500' : 'text-teal-600'}`}></i>
            </div>
          </div>

          {conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-50 mb-2">
                <i className="ri-checkbox-circle-line text-teal-600 text-base"></i>
              </div>
              <p className="text-teal-700 text-xs font-medium">Operação normal</p>
              <p className="text-stone-400 text-[10px] mt-1">Sem conflitos detectados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conflicts.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className={`flex items-start gap-2.5 py-2 px-2.5 rounded-xl ${
                    c.severity === 'error' ? 'bg-red-50' : 'bg-amber-50'
                  }`}
                >
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`text-xs ${c.severity === 'error' ? 'ri-error-warning-line text-red-500' : 'ri-alert-line text-amber-600'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${c.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                      {c.label}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{c.detail}</p>
                  </div>
                </div>
              ))}
              {conflicts.length > 4 && (
                <p className="text-[10px] text-stone-400 text-center pt-1">
                  +{conflicts.length - 4} mais alertas
                </p>
              )}
            </div>
          )}

          {conflicts.length > 0 && (
            <Link
              to="/admin/availability"
              className="flex items-center justify-center gap-2 w-full mt-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-navy-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <i className="ri-calendar-todo-line text-sm"></i>
              Ver disponibilidade
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}