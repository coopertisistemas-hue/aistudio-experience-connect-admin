import { useState } from 'react';
import type { CheckinStatus } from '@/mocks/admin-checkins';

interface NovoCheckinFormProps {
  onClose: () => void;
  onSave: (confirmed: boolean) => void;
}

const statusOptions: { value: CheckinStatus; label: string; desc: string }[] = [
  { value: 'pending',   label: 'Pendente',   desc: 'Aguardando confirmação do passageiro' },
  { value: 'confirmed', label: 'Confirmado', desc: 'Passageiro confirmou presença' },
  { value: 'boarded',   label: 'Embarcado',  desc: 'Passageiro já está a bordo' },
];

const mockBookingRefs = ['BK-0051', 'BK-0050', 'BK-0049', 'BK-0048', 'BK-0047', 'BK-0046'];
const mockDrivers = ['João Silva', 'Carlos Mendes', 'Ana Ferreira', 'Pedro Rocha', 'Marcus Vinicius', 'Roberta Vasconcelos'];
const mockVehicles = ['Mercedes Vito (ABC-1D23)', 'Toyota Hiace (DEF-2E34)', 'Sprinter Premium (GHI-3F45)', 'Van Executive (JKL-4G56)', 'Toyota Land Cruiser (STU-9L01)'];

type Section = 'reserva' | 'passageiro' | 'operacao' | 'embarque' | 'obs';

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'reserva',    label: 'Reserva',    icon: 'ri-calendar-check-line' },
  { id: 'passageiro', label: 'Passageiro', icon: 'ri-user-line' },
  { id: 'operacao',   label: 'Operação',   icon: 'ri-settings-3-line' },
  { id: 'embarque',   label: 'Embarque',   icon: 'ri-route-line' },
  { id: 'obs',        label: 'Obs.',       icon: 'ri-file-text-line' },
];

interface FormData {
  booking_ref: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  passenger_count: string;
  status: CheckinStatus;
  scheduled_date: string;
  scheduled_time: string;
  driver: string;
  vehicle: string;
  boarding_start: string;
  notes: string;
}

export default function NovoCheckinForm({ onClose, onSave }: NovoCheckinFormProps) {
  const [activeSection, setActiveSection] = useState<Section>('reserva');
  const [notesLen, setNotesLen] = useState(0);
  const [form, setForm] = useState<FormData>({
    booking_ref: '',
    passenger_name: '',
    passenger_phone: '',
    passenger_email: '',
    passenger_count: '1',
    status: 'pending',
    scheduled_date: '2026-05-17',
    scheduled_time: '10:00',
    driver: '',
    vehicle: '',
    boarding_start: '',
    notes: '',
  });

  const set = (key: keyof FormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const inputCls = 'w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400';
  const labelCls = 'block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-navy-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Novo Check-in</h2>
            <p className="text-stone-500 text-xs mt-0.5">Registre uma operação de embarque</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 transition-colors cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Section nav */}
        <div className="px-5 pt-3 pb-0 border-b border-stone-200 flex-shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-3">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  activeSection === s.id
                    ? 'bg-navy-950 text-white'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                <i className={`${s.icon} text-xs`}></i>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {activeSection === 'reserva' && (
            <>
              <div>
                <label className={labelCls}>Reserva</label>
                <select value={form.booking_ref} onChange={(e) => set('booking_ref', e.target.value)} className={inputCls}>
                  <option value="">Selecione uma reserva...</option>
                  {mockBookingRefs.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-stone-400 text-xs mt-1">Vincule a reserva existente ou preencha manualmente abaixo.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Data</label>
                  <input type="date" value={form.scheduled_date} onChange={(e) => set('scheduled_date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Horário</label>
                  <input type="time" value={form.scheduled_time} onChange={(e) => set('scheduled_time', e.target.value)} className={inputCls} />
                </div>
              </div>
            </>
          )}

          {activeSection === 'passageiro' && (
            <>
              <div>
                <label className={labelCls}>Nome do Passageiro Principal</label>
                <input
                  type="text"
                  value={form.passenger_name}
                  onChange={(e) => set('passenger_name', e.target.value)}
                  placeholder="Nome completo"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input type="tel" value={form.passenger_phone} onChange={(e) => set('passenger_phone', e.target.value)} placeholder="+55 21 99999-9999" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-mail</label>
                  <input type="email" value={form.passenger_email} onChange={(e) => set('passenger_email', e.target.value)} placeholder="email@exemplo.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Quantidade de Passageiros</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => set('passenger_count', String(Math.max(1, Number(form.passenger_count) - 1)))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer">
                    <i className="ri-subtract-line text-sm"></i>
                  </button>
                  <span className="text-lg font-semibold text-stone-800 w-6 text-center">{form.passenger_count}</span>
                  <button type="button" onClick={() => set('passenger_count', String(Math.min(20, Number(form.passenger_count) + 1)))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer">
                    <i className="ri-add-line text-sm"></i>
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Status Inicial</label>
                <div className="space-y-2">
                  {statusOptions.map((opt) => (
                    <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.status === opt.value ? 'border-teal-400 bg-teal-50' : 'border-stone-200 hover:bg-stone-50'
                    }`}>
                      <input type="radio" name="status" value={opt.value} checked={form.status === opt.value} onChange={() => set('status', opt.value)} className="mt-0.5 accent-teal-500" />
                      <div>
                        <p className="text-sm font-semibold text-stone-700">{opt.label}</p>
                        <p className="text-xs text-stone-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'operacao' && (
            <>
              <div>
                <label className={labelCls}>Motorista</label>
                <select value={form.driver} onChange={(e) => set('driver', e.target.value)} className={inputCls}>
                  <option value="">Selecione o motorista...</option>
                  {mockDrivers.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Veículo</label>
                <select value={form.vehicle} onChange={(e) => set('vehicle', e.target.value)} className={inputCls}>
                  <option value="">Selecione o veículo...</option>
                  {mockVehicles.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ri-smartphone-line text-[#1e3a5f] text-sm"></i>
                  <span className="text-sm font-semibold text-stone-700">App do Motorista</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  O motorista será notificado pelo App sobre este check-in assim que for salvo. A confirmação de embarque é realizada pelo App em tempo real.
                </p>
              </div>
            </>
          )}

          {activeSection === 'embarque' && (
            <>
              <div>
                <label className={labelCls}>Horário previsto de embarque</label>
                <input type="time" value={form.boarding_start} onChange={(e) => set('boarding_start', e.target.value)} className={inputCls} />
                <p className="text-stone-400 text-xs mt-1">Horário estimado para início do embarque dos passageiros.</p>
              </div>
              <div className="bg-navy-950/[0.04] rounded-xl p-4 border border-stone-200 space-y-3">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Fluxo de Embarque</p>
                {[
                  { step: '1', label: 'Passageiro recebe confirmação por SMS/E-mail', icon: 'ri-mail-send-line' },
                  { step: '2', label: 'Passageiro faz check-in pelo QR Code ou App', icon: 'ri-qr-code-line' },
                  { step: '3', label: 'Motorista confirma embarque pelo App', icon: 'ri-smartphone-line' },
                  { step: '4', label: 'Transfer iniciado e passageiros em trânsito', icon: 'ri-navigation-line' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-navy-950 flex-shrink-0">
                      <span className="text-white text-[10px] font-bold">{item.step}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <i className={`${item.icon} text-stone-400 text-sm`}></i>
                      <p className="text-xs text-stone-600">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === 'obs' && (
            <div>
              <label className={labelCls}>Observações</label>
              <textarea
                value={form.notes}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    set('notes', e.target.value);
                    setNotesLen(e.target.value.length);
                  }
                }}
                placeholder="Instruções especiais, necessidades dos passageiros, pontos de atenção..."
                rows={6}
                maxLength={500}
                className={`${inputCls} resize-none`}
              />
              <p className={`text-xs mt-1 text-right ${notesLen > 450 ? 'text-amber-500' : 'text-stone-400'}`}>
                {notesLen}/500
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-200 bg-stone-50/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-100 transition-colors cursor-pointer whitespace-nowrap">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onSave(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-save-line"></i>
              Salvar
            </button>
            <button
              type="button"
              onClick={() => onSave(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-checkbox-circle-line"></i>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}