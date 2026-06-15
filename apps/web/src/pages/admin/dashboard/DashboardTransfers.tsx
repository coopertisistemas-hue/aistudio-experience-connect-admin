import { useNavigate } from 'react-router-dom';
import { useTransfers } from '@/hooks/useTransfers';
import StatusBadge from '@/pages/admin/components/ui/StatusBadge';

export default function DashboardTransfers() {
  const navigate = useNavigate();
  const { data } = useTransfers();
  const allTransfers = data?.data ?? [];
  const upcoming = allTransfers.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').slice(0, 5);

  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-5 mb-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-navy-50 border border-navy-100">
            <i className="ri-car-line text-navy-600 text-sm"></i>
          </div>
          <h2 className="font-serif text-lg font-semibold text-navy-900">Próximos Transfers</h2>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/transfers')}
          className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors cursor-pointer"
        >
          Ver todos
          <i className="ri-arrow-right-line text-sm"></i>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand-100">
              {['Referência', 'Rota', 'Motorista', 'Veículo', 'Agendamento', 'Pax', 'Status'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-navy-300 uppercase tracking-wider pb-3 pr-4 last:pr-0 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {upcoming.map((t) => {
              const dt = new Date(t.scheduled_at);
              const time = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const date = dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const origin = t.pickup_location || t.routes?.origin || '—';
              const destination = t.dropoff_location || t.routes?.destination || '—';
              const driverName = t.drivers?.name ?? null;
              const vehicleName = t.vehicles?.name ?? '—';
              const vehiclePlate = t.vehicles?.plate ?? '';
              return (
                <tr key={t.id} className="group hover:bg-sand-50 transition-colors duration-100">
                  <td className="py-3 pr-4">
                    <span className="text-xs font-semibold text-navy-700 font-mono">#{t.id.slice(0, 8)}</span>
                  </td>
                  <td className="py-3 pr-4 min-w-[160px]">
                    <p className="text-xs font-medium text-navy-800 leading-snug">{origin}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <i className="ri-arrow-right-line text-navy-300 text-[10px]"></i>
                      <p className="text-[11px] text-navy-400 leading-snug">{destination}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    {driverName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center rounded-lg bg-navy-100 flex-shrink-0">
                          <i className="ri-user-line text-navy-500 text-[10px]"></i>
                        </div>
                        <span className="text-xs text-navy-700 whitespace-nowrap">{driverName.split(' ')[0]}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-navy-300 italic">Não alocado</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-navy-600 whitespace-nowrap">{vehicleName}</span>
                    {vehiclePlate && <p className="text-[10px] text-navy-300 font-mono">{vehiclePlate}</p>}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="text-xs font-semibold text-navy-800">{time}</p>
                    <p className="text-[10px] text-navy-400">{date}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1">
                      <i className="ri-user-3-line text-navy-300 text-[11px]"></i>
                      <span className="text-xs text-navy-600">{t.passenger_count}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}