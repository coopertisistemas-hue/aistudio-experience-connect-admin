import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Invitation {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
}

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'accepted' | 'error';
type OtpStep = 'email' | 'verify';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [inviteState, setInviteState] = useState<InviteState>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteState('invalid');
      return;
    }

    async function fetchInvitation() {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single() as unknown as { data: Invitation | null; error: unknown }

      if (error || !data) {
        setInviteState('invalid');
        return;
      }

      if (data.accepted_at) {
        setInviteState('accepted');
        return;
      }

      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        setInviteState('expired');
        return;
      }

      setInvitation(data);
      setInviteState('valid');
    }

    fetchInvitation();
  }, [token]);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor, insira seu e-mail.');
      return;
    }
    setAuthLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setAuthLoading(false);
      setErrorMsg('Não foi possível enviar o código. Tente novamente.');
      return;
    }

    setAuthLoading(false);
    setOtpStep('verify');
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !otpToken) {
      setErrorMsg('Por favor, preencha o e-mail e o código.');
      return;
    }
    setAuthLoading(true);
    setErrorMsg('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpToken,
      type: 'magiclink',
    });

    if (verifyError) {
      setAuthLoading(false);
      setErrorMsg('Código inválido ou expirado. Verifique e tente novamente.');
      return;
    }

    // Accept invitation via RPC
    const { error: rpcError } = await (supabase.rpc as unknown as (...args: unknown[]) => Promise<{ error: unknown }>)('accept_invite', {
      invitation_token: token,
    });

    if (rpcError) {
      setAuthLoading(false);
      setErrorMsg('Não foi possível aceitar o convite. Verifique se o código ainda é válido.');
      return;
    }

    setAuthLoading(false);
    navigate('/admin/dashboard');
  };

  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-sans text-navy-900 placeholder-navy-300 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError ? 'border-red-200' : 'border-sand-200 hover:border-sand-300'
    }`;

  if (inviteState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-navy-900 flex items-center justify-center">
            <i className="ri-compass-3-line text-amber-400 text-base"></i>
          </div>
          <div className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-navy-400 text-sm font-light">Verificando convite...</span>
          </div>
        </div>
      </div>
    );
  }

  if (inviteState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-6">
        <div className="bg-white border border-sand-200 rounded-3xl p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-error-warning-line text-red-500 text-2xl"></i>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-950 mb-2">Convite inválido</h2>
          <p className="text-navy-400 text-sm font-light leading-relaxed mb-6">
            O link de convite não foi encontrado ou está incorreto. Solicite um novo convite ao administrador da empresa.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all duration-200 cursor-pointer"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  if (inviteState === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-6">
        <div className="bg-white border border-sand-200 rounded-3xl p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-time-line text-amber-500 text-2xl"></i>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-950 mb-2">Convite expirado</h2>
          <p className="text-navy-400 text-sm font-light leading-relaxed mb-6">
            Este convite expirou. Solicite um novo convite ao administrador da empresa.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all duration-200 cursor-pointer"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  if (inviteState === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50 px-6">
        <div className="bg-white border border-sand-200 rounded-3xl p-8 md:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-5">
            <i className="ri-checkbox-circle-line text-teal-600 text-2xl"></i>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-navy-950 mb-2">Convite já aceito</h2>
          <p className="text-navy-400 text-sm font-light leading-relaxed mb-6">
            Este convite já foi utilizado. Faça login para acessar o painel.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all duration-200 cursor-pointer"
          >
            Ir para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border border-sand-200 rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-5">
              <i className="ri-mail-send-line text-teal-600 text-xs"></i>
              <span className="text-teal-700 text-xs font-medium tracking-wide">Convite para o time</span>
            </div>
            <h1 className="font-serif text-3xl font-semibold text-navy-950 leading-tight mb-2">
              Você foi convidado
            </h1>
            <p className="text-navy-400 text-sm font-light leading-relaxed">
              Faça login ou crie sua conta com código mágico para aceitar o convite e acessar o painel.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i className="ri-error-warning-line text-red-500 text-sm"></i>
              </div>
              <p className="text-red-700 text-sm font-medium leading-snug">{errorMsg}</p>
            </div>
          )}

          {otpStep === 'email' && (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="invite-email" className="text-navy-800 text-sm font-medium">E-mail</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <i className="ri-mail-line text-navy-300 text-sm"></i>
                  </div>
                  <input
                    id="invite-email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    disabled={authLoading}
                    className={inputClass(!!errorMsg)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                  authLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                }`}
              >
                {authLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar código mágico
                    <i className="ri-send-plane-line text-base"></i>
                  </>
                )}
              </button>
            </form>
          )}

          {otpStep === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto">
                  <i className="ri-mail-check-line text-teal-600 text-2xl"></i>
                </div>
                <p className="text-navy-400 text-sm font-light leading-relaxed text-center">
                  Código enviado para{' '}
                  <span className="text-navy-700 font-medium">{email}</span>.
                  Verifique sua caixa de entrada.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="invite-otp" className="text-navy-800 text-sm font-medium">Código de verificação</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <i className="ri-shield-check-line text-navy-300 text-sm"></i>
                  </div>
                  <input
                    id="invite-otp"
                    type="text"
                    name="otp"
                    value={otpToken}
                    onChange={(e) => { setOtpToken(e.target.value); setErrorMsg(''); }}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    disabled={authLoading}
                    className={inputClass(!!errorMsg)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                  authLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                }`}
              >
                {authLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Confirmando...
                  </>
                ) : (
                  <>
                    Aceitar convite e entrar
                    <i className="ri-arrow-right-line text-base"></i>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setOtpStep('email'); setOtpToken(''); setErrorMsg(''); }}
                className="text-center text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors duration-150 cursor-pointer"
              >
                Reenviar código para outro e-mail
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
