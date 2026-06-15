import { useState } from 'react';
interface ChannelConfig { id: string; label: string; icon: string; color: string; enabled: boolean }
interface MockNotificationSetting { id?: string; category: string; channels: ChannelConfig[]; label?: string; description?: string; email?: boolean; push?: boolean; whatsapp?: boolean }

interface SettingsNotificacoesProps {
  settings: MockNotificationSetting[];
  onSave: (msg: string) => void;
}

type Channel = 'email' | 'push' | 'whatsapp';

const channelMeta: Record<Channel, { icon: string; label: string; color: string }> = {
  email: { icon: 'ri-mail-line', label: 'E-mail', color: 'text-sky-600' },
  push: { icon: 'ri-notification-3-line', label: 'Push', color: 'text-teal-600' },
  whatsapp: { icon: 'ri-whatsapp-line', label: 'WhatsApp', color: 'text-green-600' },
};

const channels: Channel[] = ['email', 'push', 'whatsapp'];

const categoryOrder = ['Operação', 'Financeiro', 'Motoristas', 'Check-in'];

// TODO(future): persist preferences in notifications table (not yet created)
export default function SettingsNotificacoes({ settings, onSave }: SettingsNotificacoesProps) {
  const [state, setState] = useState<Record<string, Record<Channel, boolean>>>(() => {
    const map: Record<string, Record<Channel, boolean>> = {};
    settings.forEach((s) => {
      map[s.id] = { email: s.email, push: s.push, whatsapp: s.whatsapp };
    });
    return map;
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string, channel: Channel) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [channel]: !prev[id][channel] },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setDirty(false);
    onSave('Preferências de notificação salvas.');
  };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer ${on ? 'bg-teal-500' : 'bg-stone-300'}`}
      style={{ width: 36, height: 20 }}
    >
      <span
        className="absolute top-0.5 bg-white rounded-full transition-transform duration-200"
        style={{ width: 16, height: 16, left: 2, transform: on ? 'translateX(16px)' : 'translateX(0)' }}
      ></span>
    </button>
  );

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    items: settings.filter((s) => s.category === cat),
  }));

  return (
    <div className="flex flex-col gap-5">

      {/* Channel header explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {channels.map((ch) => {
          const meta = channelMeta[ch];
          const activeCount = settings.filter((s) => state[s.id]?.[ch]).length;
          return (
            <div key={ch} className="flex items-center gap-3 px-4 py-3 bg-white border border-stone-200 rounded-xl">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-stone-100">
                <i className={`${meta.icon} ${meta.color} text-base`}></i>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-800">{meta.label}</p>
                <p className="text-[11px] text-stone-400">{activeCount} ativo{activeCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel column header */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {/* Header row */}
        <div className="hidden sm:grid px-5 py-2.5 bg-stone-50 border-b border-stone-100" style={{ gridTemplateColumns: '1fr repeat(3, 80px)' }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Alerta</span>
          {channels.map((ch) => (
            <div key={ch} className="flex flex-col items-center gap-0.5">
              <i className={`${channelMeta[ch].icon} ${channelMeta[ch].color} text-sm`}></i>
              <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{channelMeta[ch].label}</span>
            </div>
          ))}
        </div>

        {grouped.map(({ category, items }) => (
          <div key={category}>
            <div className="px-5 py-2.5 bg-stone-50/50 border-y border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{category}</p>
            </div>
            {items.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3.5 hover:bg-stone-50/60 transition-colors border-b border-stone-100 last:border-b-0"
              >
                {/* Mobile layout */}
                <div className="sm:hidden">
                  <p className="text-sm font-medium text-stone-800 mb-0.5">{item.label}</p>
                  <p className="text-xs text-stone-500 mb-3">{item.description}</p>
                  <div className="flex gap-4">
                    {channels.map((ch) => (
                      <div key={ch} className="flex flex-col items-center gap-1">
                        <i className={`${channelMeta[ch].icon} ${channelMeta[ch].color} text-sm`}></i>
                        <Toggle on={state[item.id]?.[ch]} onClick={() => toggle(item.id, ch)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Desktop grid */}
                <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: '1fr repeat(3, 80px)' }}>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{item.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                  </div>
                  {channels.map((ch) => (
                    <div key={ch} className="flex justify-center">
                      <Toggle on={state[item.id]?.[ch]} onClick={() => toggle(item.id, ch)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
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
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
            dirty && !saving ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-stone-200 text-stone-400 cursor-default'
          }`}
        >
          {saving ? <i className="ri-loader-4-line animate-spin text-sm"></i> : <i className="ri-save-line text-sm"></i>}
          {saving ? 'Salvando…' : 'Salvar preferências'}
        </button>
      </div>
    </div>
  );
}