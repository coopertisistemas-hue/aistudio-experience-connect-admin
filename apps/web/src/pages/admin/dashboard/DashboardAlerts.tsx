import { mockAlerts, mockRecentActivity } from '@/mocks/admin-dashboard';

const alertStyles: Record<string, { border: string; iconBg: string; iconColor: string }> = {
  warning: { border: 'border-l-amber-400', iconBg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-600' },
  error: { border: 'border-l-red-400', iconBg: 'bg-red-50 border-red-100', iconColor: 'text-red-500' },
  info: { border: 'border-l-navy-300', iconBg: 'bg-navy-50 border-navy-100', iconColor: 'text-navy-500' },
};

const activityIcon: Record<string, string> = {
  booking: 'ri-calendar-check-line',
  transfer: 'ri-car-line',
  payment: 'ri-secure-payment-line',
};

export default function DashboardAlerts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Operational Alerts */}
      <div className="bg-white border border-sand-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
              <i className="ri-alert-line text-amber-600 text-sm"></i>
            </div>
            <h3 className="font-serif text-base font-semibold text-navy-900">Alertas Operacionais</h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-medium">
            {mockAlerts.length} alertas
          </span>
        </div>
        <div className="space-y-2.5">
          {mockAlerts.map((alert) => {
            const style = alertStyles[alert.type];
            return (
              <div key={alert.id} className={`flex items-start gap-3 p-3 bg-sand-50 border border-sand-100 border-l-4 ${style.border} rounded-xl`}>
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg border flex-shrink-0 mt-0.5 ${style.iconBg}`}>
                  <i className={`${alert.icon} ${style.iconColor} text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy-800 text-xs font-semibold leading-snug">{alert.title}</p>
                  <p className="text-navy-400 text-[11px] font-light mt-0.5 leading-snug">{alert.description}</p>
                  <p className="text-navy-300 text-[10px] mt-1">{alert.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity + Financial Summary */}
      <div className="flex flex-col gap-5">
        {/* Financial Summary */}
        <div className="bg-navy-950 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-semibold text-white">Resumo Financeiro</h3>
            <span className="text-white/40 text-[11px]">Esta semana</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Receita Total', value: 'R$ 18.450', color: 'text-teal-300' },
              { label: 'Confirmado', value: 'R$ 16.270', color: 'text-teal-400' },
              { label: 'Pendente', value: 'R$ 2.180', color: 'text-amber-400' },
              { label: 'Receita Hoje', value: 'R$ 4.320', color: 'text-white' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <p className={`font-serif text-lg font-semibold ${item.color}`}>{item.value}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-sand-200 rounded-2xl p-5 flex-1">
          <h3 className="font-serif text-base font-semibold text-navy-900 mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {mockRecentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-sand-100 border border-sand-200 flex-shrink-0">
                  <i className={`${activityIcon[item.type] ?? 'ri-notification-3-line'} text-navy-500 text-xs`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy-700 text-xs font-medium leading-snug">{item.text}</p>
                  <p className="text-navy-400 text-[11px] font-light mt-0.5 truncate">{item.detail}</p>
                </div>
                <span className="text-navy-300 text-[10px] flex-shrink-0 mt-0.5">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}