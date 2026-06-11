import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type AuthState = 'idle' | 'loading' | 'error' | 'success';
type AuthMode = 'login' | 'forgot-password' | 'forgot-sent';
type LoginTab = 'password' | 'otp';
type OtpStep = 'email' | 'verify';

export default function AuthCard() {
  const navigate = useNavigate();

  // Mode
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginTab, setLoginTab] = useState<LoginTab>('password');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);

  // Auth state
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = authState === 'loading';
  const isError = authState === 'error';

  const resetError = () => {
    if (isError) setAuthState('idle');
  };

  /* ── LOGIN (PASSWORD) ── */
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthState('error');
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    setAuthState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAuthState('error');
      setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha.');
      return;
    }

    setAuthState('success');
    navigate('/admin');
  };

  /* ── OTP SEND ── */
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthState('error');
      setErrorMsg('Por favor, insira seu e-mail.');
      return;
    }
    setAuthState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setAuthState('error');
      setErrorMsg('Não foi possível enviar o código. Tente novamente.');
      return;
    }

    setAuthState('idle');
    setOtpStep('verify');
  };

  /* ── OTP VERIFY ── */
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !otpToken) {
      setAuthState('error');
      setErrorMsg('Por favor, preencha o e-mail e o código.');
      return;
    }
    setAuthState('loading');
    setErrorMsg('');

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpToken,
      type: 'magiclink',
    });

    if (error) {
      setAuthState('error');
      setErrorMsg('Código inválido ou expirado. Verifique e tente novamente.');
      return;
    }

    setAuthState('success');
    navigate('/admin/dashboard');
  };

  /* ── FORGOT PASSWORD ── */
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setAuthState('error');
      setErrorMsg('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    setAuthState('loading');
    setErrorMsg('');

    const basePath = __BASE_PATH__.split('/').filter(Boolean).join('/');
    const pathPrefix = basePath ? `/${basePath}` : '';
    const redirectTo = `${window.location.origin}${pathPrefix}/login`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setAuthState('error');
      setErrorMsg('Não foi possível enviar o e-mail. Tente novamente.');
      return;
    }

    setAuthState('idle');
    setMode('forgot-sent');
  };

  /* ── SHARED INPUT CLASS ── */
  const inputClass = (hasError: boolean) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-sans text-navy-900 placeholder-navy-300 bg-white transition-all duration-200 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed ${
      hasError ? 'border-red-200' : 'border-sand-200 hover:border-sand-300'
    }`;

  return (
    <div className="flex-1 flex items-center justify-center bg-sand-50 px-6 py-12 lg:px-16">
      <div className="w-full max-w-md">

        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-navy-900 flex items-center justify-center">
            <i className="ri-compass-3-line text-amber-400 text-base"></i>
          </div>
          <div>
            <span className="font-serif font-semibold text-navy-900 text-lg leading-tight block">Experience Connect</span>
            <span className="text-teal-600 text-xs tracking-widest uppercase font-sans">Transfers & Experiences</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-sand-200 rounded-3xl p-8 md:p-10">

          {/* ── FORGOT SENT STATE ── */}
          {mode === 'forgot-sent' && (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                <i className="ri-mail-check-line text-teal-600 text-2xl"></i>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-navy-950 mb-2">E-mail enviado</h2>
                <p className="text-navy-400 text-sm font-light leading-relaxed">
                  Enviamos um link de redefinição para{' '}
                  <span className="text-navy-700 font-medium">{email}</span>.
                  Verifique sua caixa de entrada e o spam.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setMode('login'); setAuthState('idle'); setErrorMsg(''); }}
                className="w-full py-3.5 rounded-xl text-sm font-semibold bg-navy-900 hover:bg-navy-800 text-white transition-all duration-200 cursor-pointer whitespace-nowrap"
              >
                Voltar ao Login
              </button>
            </div>
          )}

          {/* ── FORGOT PASSWORD FORM ── */}
          {mode === 'forgot-password' && (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setAuthState('idle'); setErrorMsg(''); }}
                  className="flex items-center gap-2 text-navy-400 hover:text-navy-700 text-xs font-medium transition-colors duration-200 cursor-pointer mb-6"
                >
                  <i className="ri-arrow-left-line text-sm"></i>
                  Voltar ao login
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-100 border border-sand-200 mb-5">
                  <i className="ri-lock-password-line text-navy-400 text-xs"></i>
                  <span className="text-navy-500 text-xs font-medium tracking-wide">Redefinir senha</span>
                </div>
                <h2 className="font-serif text-3xl font-semibold text-navy-950 leading-tight mb-2">
                  Esqueceu sua senha?
                </h2>
                <p className="text-navy-400 text-sm font-light leading-relaxed">
                  Informe seu e-mail e enviaremos um link para redefinição de acesso.
                </p>
              </div>

              {isError && errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-error-warning-line text-red-500 text-sm"></i>
                  </div>
                  <p className="text-red-700 text-sm font-medium leading-snug">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reset-email" className="text-navy-800 text-sm font-medium">E-mail</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                      <i className="ri-mail-line text-navy-300 text-sm"></i>
                    </div>
                    <input
                      id="reset-email"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); resetError(); }}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className={inputClass(isError)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                    isLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar link de redefinição
                      <i className="ri-send-plane-line text-base"></i>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === 'login' && (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <span className="text-teal-700 text-xs font-medium tracking-wide">Painel Administrativo</span>
                </div>
                <h1 className="font-serif text-3xl font-semibold text-navy-950 leading-tight mb-2">
                  Acesse seu Painel Administrativo
                </h1>
                <p className="text-navy-400 text-sm font-light leading-relaxed">
                  Entre para gerenciar reservas, transfers, motoristas, veículos e operações da sua empresa.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => { setLoginTab('password'); setOtpStep('email'); setAuthState('idle'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    loginTab === 'password'
                      ? 'bg-navy-900 text-white'
                      : 'bg-sand-100 text-navy-600 hover:bg-sand-200'
                  }`}
                >
                  E-mail e Senha
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginTab('otp'); setOtpStep('email'); setAuthState('idle'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    loginTab === 'otp'
                      ? 'bg-navy-900 text-white'
                      : 'bg-sand-100 text-navy-600 hover:bg-sand-200'
                  }`}
                >
                  Código Mágico (OTP)
                </button>
              </div>

              {isError && errorMsg && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-error-warning-line text-red-500 text-sm"></i>
                  </div>
                  <p className="text-red-700 text-sm font-medium leading-snug">{errorMsg}</p>
                </div>
              )}

              {/* ── PASSWORD TAB ── */}
              {loginTab === 'password' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="auth-email" className="text-navy-800 text-sm font-medium">E-mail</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                        <i className="ri-mail-line text-navy-300 text-sm"></i>
                      </div>
                      <input
                        id="auth-email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); resetError(); }}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        disabled={isLoading}
                        className={inputClass(isError)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="auth-password" className="text-navy-800 text-sm font-medium">Senha</label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot-password'); setAuthState('idle'); setErrorMsg(''); }}
                        className="text-teal-600 hover:text-teal-700 text-xs font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                        <i className="ri-lock-line text-navy-300 text-sm"></i>
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); resetError(); }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className={`${inputClass(isError)} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-navy-300 hover:text-navy-500 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Remember session */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      className={`relative w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer ${
                        rememberSession ? 'bg-teal-600 border-teal-600' : 'border-sand-300 group-hover:border-teal-400 bg-white'
                      }`}
                      onClick={() => setRememberSession(!rememberSession)}
                    >
                      {rememberSession && <i className="ri-check-line text-white text-xs"></i>}
                    </div>
                    <input type="checkbox" className="sr-only" checked={rememberSession} onChange={(e) => setRememberSession(e.target.checked)} />
                    <span className="text-navy-600 text-sm font-light select-none">Manter sessão ativa</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                      isLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Autenticando...
                      </>
                    ) : (
                      <>
                        Entrar no Painel
                        <i className="ri-arrow-right-line text-base"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── OTP TAB ── */}
              {loginTab === 'otp' && (
                <>
                  {otpStep === 'email' && (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="otp-email" className="text-navy-800 text-sm font-medium">E-mail</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                            <i className="ri-mail-line text-navy-300 text-sm"></i>
                          </div>
                          <input
                            id="otp-email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); resetError(); }}
                            placeholder="seu@email.com"
                            autoComplete="email"
                            disabled={isLoading}
                            className={inputClass(isError)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                          isLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                        }`}
                      >
                        {isLoading ? (
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
                        <label htmlFor="otp-token" className="text-navy-800 text-sm font-medium">Código de verificação</label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                            <i className="ri-shield-check-line text-navy-300 text-sm"></i>
                          </div>
                          <input
                            id="otp-token"
                            type="text"
                            name="otp"
                            value={otpToken}
                            onChange={(e) => { setOtpToken(e.target.value); resetError(); }}
                            placeholder="123456"
                            autoComplete="one-time-code"
                            disabled={isLoading}
                            className={inputClass(isError)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2.5 mt-1 ${
                          isLoading ? 'bg-navy-300 text-white cursor-not-allowed' : 'bg-navy-900 hover:bg-navy-800 text-white active:scale-[0.99]'
                        }`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Confirmando...
                          </>
                        ) : (
                          <>
                            Confirmar código
                            <i className="ri-arrow-right-line text-base"></i>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => { setOtpStep('email'); setOtpToken(''); setAuthState('idle'); setErrorMsg(''); }}
                        className="text-center text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors duration-150 cursor-pointer"
                      >
                        Reenviar código para outro e-mail
                      </button>
                    </form>
                  )}
                </>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-7">
                <div className="flex-1 h-px bg-sand-200"></div>
                <span className="text-navy-300 text-xs font-light tracking-wider">ou acesse com</span>
                <div className="flex-1 h-px bg-sand-200"></div>
              </div>

              {/* SSO Placeholders */}
              <div className="flex flex-col gap-3">
                <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-sand-200 hover:border-sand-300 bg-white hover:bg-sand-50 text-navy-700 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-google-line text-base text-navy-400"></i>
                  </div>
                  Continuar com Google
                </button>
                <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-sand-200 hover:border-sand-300 bg-white hover:bg-sand-50 text-navy-700 text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-building-2-line text-base text-navy-400"></i>
                  </div>
                  Acesso Organizacional (SSO)
                </button>
              </div>

              {/* Footer note */}
              <p className="text-center text-navy-300 text-xs font-light mt-7 leading-relaxed">
                Ao continuar, você concorda com os{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 underline underline-offset-2 transition-colors">Termos de Uso</a>
                {' '}e a{' '}
                <a href="#" className="text-teal-600 hover:text-teal-700 underline underline-offset-2 transition-colors">Política de Privacidade</a>.
              </p>
            </>
          )}
        </div>

        {/* Ecosystem info cards */}
        {mode === 'login' && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white border border-sand-200 rounded-2xl px-4 py-4 flex flex-col gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-navy-50 border border-navy-100">
                <i className="ri-layout-2-line text-navy-600 text-sm"></i>
              </div>
              <div>
                <p className="text-navy-800 text-xs font-semibold">Painel Web</p>
                <p className="text-navy-400 text-xs font-light leading-snug mt-0.5">Para proprietários e gestores da operação.</p>
              </div>
            </div>
            <div className="bg-white border border-sand-200 rounded-2xl px-4 py-4 flex flex-col gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
                <i className="ri-smartphone-line text-teal-600 text-sm"></i>
              </div>
              <div>
                <p className="text-navy-800 text-xs font-semibold">Apps Mobile</p>
                <p className="text-navy-400 text-xs font-light leading-snug mt-0.5">Para motoristas e hóspedes em jornada.</p>
              </div>
            </div>
          </div>
        )}

        {/* Back to home */}
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-navy-400 hover:text-navy-700 text-xs font-medium transition-colors duration-200 cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
