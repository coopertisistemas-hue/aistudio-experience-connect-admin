import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRecordManualPayment } from '@/hooks/usePayments';

interface NovoPageamentoFormProps {
  onClose: () => void;
  onSave: (confirmed: boolean) => void;
  tenantId: string;
}

type Section = 'reserva' | 'passageiro' | 'pagamento' | 'metodo' | 'obs';

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'reserva',    label: 'Reserva',    icon: 'ri-calendar-check-line' },
  { id: 'passageiro', label: 'Passageiro', icon: 'ri-user-line' },
  { id: 'pagamento',  label: 'Pagamento',  icon: 'ri-money-dollar-circle-line' },
  { id: 'metodo',     label: 'Método',     icon: 'ri-bank-card-line' },
  { id: 'obs',        label: 'Obs.',       icon: 'ri-file-text-line' },
];

const methodOptions: { value: string; label: string; icon: string; desc: string }[] = [
  { value: 'pix',          label: 'PIX',                icon: 'ri-flashlight-line',          desc: 'Transferência instantânea via chave PIX' },
  { value: 'credit_card',  label: 'Cartão de Crédito',  icon: 'ri-bank-card-line',            desc: 'Crédito à vista ou parcelado' },
  { value: 'debit_card',   label: 'Cartão de Débito',   icon: 'ri-bank-card-2-line',          desc: 'Débito direto na conta' },
  { value: 'bank_transfer',label: 'Transferência',      icon: 'ri-exchange-dollar-line',      desc: 'TED ou DOC bancário' },
  { value: 'cash',         label: 'Dinheiro',           icon: 'ri-money-dollar-circle-line',  desc: 'Pagamento em espécie' },
  { value: 'payment_link', label: 'Link de Pagamento',  icon: 'ri-links-line',               desc: 'Link enviado por e-mail ou WhatsApp' },
];

const bookingRefs = ['BK-0051', 'BK-0050', 'BK-0049', 'BK-0048', 'BK-0047', 'BK-0046', 'BK-0045'];

export default function NovoPageamentoForm({ onClose, onSave, tenantId }: NovoPageamentoFormProps) {
  const { user } = useAuth();
  const adminId = user?.id || '';
  const [activeSection, setActiveSection] = useState<Section>('reserva');
  const [method, setMethod] = useState('');
  const [notesLen, setNotesLen] = useState(0);
  const [amount, setAmount] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const recordManual = useRecordManualPayment();

  const inputCls = 'w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400';
  const labelCls = 'block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-navy-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg h-full flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Novo Pagamento</h2>
            <p className="text-stone-500 text-xs mt-0.5">Registre ou vincule um pagamento a uma reserva</p>
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
                  activeSection === s.id ? 'bg-navy-950 text-white' : 'text-stone-500 hover:bg-stone-100'
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
                <label className={labelCls}>Referência da Reserva</label>
                <select className={inputCls} value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
                  <option value="">Selecione uma reserva...</option>
                  {bookingRefs.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-stone-400 text-xs mt-1">Vincule à reserva existente ou preencha manualmente.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Data do Serviço</label>
                  <input type="date" className={inputCls} defaultValue="2026-05-17" />
                </div>
                <div>
                  <label className={labelCls}>Vencimento</label>
                  <input type="date" className={inputCls} defaultValue="2026-05-20" />
                </div>
              </div>
            </>
          )}

          {activeSection === 'passageiro' && (
            <>
              <div>
                <label className={labelCls}>Nome do Passageiro</label>
                <input type="text" placeholder="Nome completo" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>E-mail</label>
                  <input type="email" placeholder="email@exemplo.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <input type="tel" placeholder="+55 21 99999-9999" className={inputCls} />
                </div>
              </div>
            </>
          )}

          {activeSection === 'pagamento' && (
            <>
              <div>
                <label className={labelCls}>Valor Total (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">R$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls}>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="partial">Parcial</option>
                    <option value="overdue">Atrasado</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Parcelas</label>
                  <select className={inputCls}>
                    <option value="1">1x (à vista)</option>
                    <option value="2">2x</option>
                    <option value="3">3x</option>
                    <option value="6">6x</option>
                    <option value="12">12x</option>
                  </select>
                </div>
              </div>
              {amount && (
                <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
                  <p className="text-xs text-teal-700">
                    Valor: <span className="font-semibold">R$ {Number(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
              )}
            </>
          )}

          {activeSection === 'metodo' && (
            <>
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Selecione o método</p>
              <div className="space-y-2">
                {methodOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      method === opt.value
                        ? 'border-teal-400 bg-teal-50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={opt.value}
                      checked={method === opt.value}
                      onChange={() => setMethod(opt.value)}
                      className="accent-teal-500 mt-0.5"
                    />
                    <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${method === opt.value ? 'bg-teal-100' : 'bg-stone-100'}`}>
                      <i className={`${opt.icon} text-base ${method === opt.value ? 'text-teal-600' : 'text-stone-500'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-700">{opt.label}</p>
                      <p className="text-xs text-stone-400">{opt.desc}</p>
                    </div>
                    {method === opt.value && <i className="ri-checkbox-circle-line text-teal-500 flex-shrink-0"></i>}
                  </label>
                ))}
              </div>
            </>
          )}

          {activeSection === 'obs' && (
            <div>
              <label className={labelCls}>Observações</label>
              <textarea
                value={notes}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setNotes(e.target.value);
                    setNotesLen(e.target.value.length);
                  }
                }}
                placeholder="Instruções de pagamento, dados bancários, condições especiais..."
                rows={7}
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
              onClick={() => {
                if (!amount || !bookingId) return;
                setSaving(true);
                recordManual.mutateAsync({
                  tenant_id: tenantId,
                  booking_id: bookingId,
                  amount: Number(amount),
                  reason: notes || 'Pagamento manual',
                  admin_id: adminId,
                }).then(() => {
                  setSaving(false);
                  onSave(false);
                }).catch(() => {
                  setSaving(false);
                });
              }}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                if (!amount || !bookingId) return;
                setSaving(true);
                recordManual.mutateAsync({
                  tenant_id: tenantId,
                  booking_id: bookingId,
                  amount: Number(amount),
                  reason: notes || 'Pagamento manual confirmado',
                  admin_id: adminId,
                }).then(() => {
                  setSaving(false);
                  onSave(true);
                }).catch(() => {
                  setSaving(false);
                });
              }}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-checkbox-circle-line"></i>}
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}