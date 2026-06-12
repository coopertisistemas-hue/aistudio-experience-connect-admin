import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { submitContact } from '@/services/contact';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

type FieldErrors = Partial<Record<keyof ContactForm, string>>;
type PageState = 'form' | 'loading' | 'success' | 'error';

export function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pageState, setPageState] = useState<PageState>('form');
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof ContactForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.email.trim()) {
      e.email = 'E-mail obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'E-mail inválido';
    }
    if (!form.subject.trim()) e.subject = 'Assunto obrigatório';
    if (!form.message.trim()) e.message = 'Mensagem obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setPageState('loading');
    setServerError(null);

    const ok = await submitContact(form);

    if (ok) {
      setPageState('success');
      setForm(initialForm);
    } else {
      setServerError('Erro ao enviar mensagem. Tente novamente.');
      setPageState('error');
    }
  };

  const inputClass = (field: keyof ContactForm) =>
    `w-full rounded-lg bg-slate-800 border px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
      errors[field] ? 'border-red-500' : 'border-white/10'
    }`;

  return (
    <>
      <Helmet>
        <title>Fale Conosco — Dom Pietro Experience</title>
        <meta
          name="description"
          content="Entre em contato com a Dom Pietro Experience. Tire suas dúvidas, solicite um orçamento ou envie sua mensagem."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Breadcrumbs */}
        <nav className="max-w-3xl mx-auto px-6 pt-24 pb-2">
          <ol className="flex items-center gap-2 text-sm text-slate-400">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors">
                Início
              </Link>
            </li>
            <li className="text-slate-600">/</li>
            <li className="text-white truncate">Fale Conosco</li>
          </ol>
        </nav>

        <div className="max-w-3xl mx-auto px-6 py-8 pb-24">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
              Fale Conosco
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Tem alguma dúvida ou quer saber mais sobre nossas experiências?
              Preencha o formulário abaixo e entraremos em contato.
            </p>
          </div>

          {pageState === 'success' ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">Mensagem enviada!</h2>
                <p className="text-slate-400 mt-2">
                  Recebemos sua mensagem e responderemos em breve.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setPageState('form')}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  Enviar nova mensagem
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-lg bg-white/5 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
                >
                  Voltar ao Início
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-slate-400">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Seu nome"
                    className={inputClass('name')}
                  />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm text-slate-400">
                    E-mail <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-slate-400">Telefone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+55 21 99999-0000"
                    className={inputClass('phone')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm text-slate-400">
                    Assunto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                    placeholder="Ex: Orçamento, Dúvida..."
                    className={inputClass('subject')}
                  />
                  {errors.subject && <p className="text-red-400 text-xs">{errors.subject}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm text-slate-400">
                  Mensagem <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Escreva sua mensagem..."
                  className={`${inputClass('message')} resize-none`}
                />
                {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
              </div>

              {pageState === 'error' && serverError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">{serverError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={pageState === 'loading'}
                className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {pageState === 'loading' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Mensagem'
                )}
              </button>
            </form>
          )}

          {/* Alternative contact info */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">E-mail</h3>
                <a href="mailto:contato@dompietro.com" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  contato@dompietro.com
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">WhatsApp</h3>
                <a href="https://wa.me/5511999999999" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                  +55 (11) 99999-9999
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Localização</h3>
                <p className="text-sm text-slate-400">São Paulo, SP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
