import { useState } from 'react';
import { useUpdateSettings } from '@/hooks/useSettings';
import type { TenantProfile } from '@/services/settings';

interface SettingsOperacaoProps {
  tenant: TenantProfile;
  onSave: (msg: string) => void;
}

const timezones = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Cuiaba',
  'America/Porto_Velho',
  'America/Rio_Branco',
];

const daysMap: Record<string, string> = {
  seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom',
};

export default function SettingsOperacao({ tenant, onSave }: SettingsOperacaoProps) {
  const [form, setForm] = useState({
    timezone: tenant.timezone,
    hours_start: tenant.operational_hours_start,
    hours_end: tenant.operational_hours_end,
    transfer_duration: tenant.default_transfer_duration,
    vehicle_capacity: tenant.default_vehicle_capacity,
    delay_threshold: tenant.delay_threshold_minutes,
    auto_confirm: tenant.auto_confirm_bookings,
    require_checkin: tenant.require_checkin_confirmation,
    operating_days: [...tenant.operating_days],
  });
  const [dirty, setDirty] = useState(false);

  const updateSettings = useUpdateSettings();

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  const toggleDay = (day: string) => {
    setForm((f) => {
      const days = f.operating_days.includes(day)
        ? f.operating_days.filter((d) => d !== day)
        : [...f.operating_days, day];
      return { ...f, operating_days: days };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        tenantId: tenant.id,
        settings: {
          timezone: form.timezone,
          hours_start: form.hours_start,
          hours_end: form.hours_end,
          transfer_duration: form.transfer_duration,
          vehicle_capacity: form.vehicle_capacity,
          delay_threshold: form.delay_threshold,
          auto_confirm: form.auto_confirm,
          require_checkin: form.require_checkin,
          operating_days: form.operating_days,
        },
      });
      setDirty(false);
      onSave('Preferências operacionais salvas com sucesso.');
    } catch {
      onSave('Erro ao salvar preferências operacionais.');
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${value ? 'bg-teal-500' : 'bg-stone-300'}`}
      style={{ minWidth: 40, height: 22 }}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 ${value ? 'translate-x-[18px]' : 'translate-x-0'}`}
        style={{ width: 18, height: 18 }}
      ></span>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">

      {/* Timezone & hours */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Horário e Fuso</h3>
        <p className="text-xs text-stone-500 mb-4">Define o fuso horário base para todas as operações da plataforma.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Fuso horário</label>
            <select
              value={form.timezone}
              onChange={(e) => set('timezone', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors cursor-pointer"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Início das operações</label>
            <input
              type="time"
              value={form.hours_start}
              onChange={(e) => set('hours_start', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Fim das operações</label>
            <input
              type="time"
              value={form.hours_end}
              onChange={(e) => set('hours_end', e.target.value)}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Operating days */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Dias Operacionais</h3>
        <p className="text-xs text-stone-500 mb-4">Selecione os dias em que a operação está ativa.</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(daysMap).map(([key, label]) => {
            const active = form.operating_days.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-teal-500/[0.10] border-teal-300/60 text-teal-700'
                    : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Defaults */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Padrões de Serviço</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Duração padrão (min)</label>
            <input
              type="number"
              min={15}
              max={480}
              value={form.transfer_duration}
              onChange={(e) => set('transfer_duration', Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
            <p className="text-[11px] text-stone-400">Duração estimada de cada transfer</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Capacidade padrão (pax)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={form.vehicle_capacity}
              onChange={(e) => set('vehicle_capacity', Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
            <p className="text-[11px] text-stone-400">Passageiros por veículo padrão</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-600">Limite de atraso (min)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={form.delay_threshold}
              onChange={(e) => set('delay_threshold', Number(e.target.value))}
              className="px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-colors"
            />
            <p className="text-[11px] text-stone-400">Acima disto o atraso é sinalizado</p>
          </div>
        </div>
      </div>

      {/* Automation toggles */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-stone-800 mb-4">Automações</h3>
        <div className="flex flex-col gap-4">
          {[
            {
              key: 'auto_confirm',
              label: 'Confirmação automática de reservas',
              desc: 'Quando ativo, reservas são confirmadas sem aprovação manual',
              value: form.auto_confirm,
              onChange: (v: boolean) => set('auto_confirm', v),
            },
            {
              key: 'require_checkin',
              label: 'Exigir confirmação de check-in',
              desc: 'O passageiro deve confirmar presença antes do embarque',
              value: form.require_checkin,
              onChange: (v: boolean) => set('require_checkin', v),
            },
          ].map(({ key, label, desc, value, onChange }) => (
            <div key={key} className="flex items-center gap-4 justify-between">
              <div>
                <p className="text-sm font-medium text-stone-800">{label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Save bar */}
      <div className={`flex items-center justify-between gap-4 px-5 py-4 bg-white border rounded-2xl transition-all duration-300 ${dirty ? 'border-teal-300 bg-teal-50/30' : 'border-stone-200'}`}>
        <div className="flex items-center gap-2">
          {dirty ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span><span className="text-xs text-amber-700 font-medium">Alterações não salvas</span></>
          ) : (
            <><span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span><span className="text-xs text-teal-700 font-medium">Tudo salvo</span></>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || updateSettings.isPending}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            dirty && !updateSettings.isPending ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-default'
          }`}
        >
          {updateSettings.isPending ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-save-line text-sm"></i>}
          {updateSettings.isPending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  );
}