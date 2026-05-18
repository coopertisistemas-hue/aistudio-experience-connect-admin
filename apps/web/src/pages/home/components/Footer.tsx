import { useState } from 'react';

const footerLinks = {
  Plataforma: ['Reservas', 'Planejamento de Rotas', 'Gestão de Frota', 'Jornada do Hóspede', 'Pagamentos'],
  Experiências: ['Transfers Aeroportuários', 'Tours Privativos', 'Rotas de Vinhos', 'Viagens à Serra', 'Transporte Executivo'],
  Empresa: ['Sobre Nós', 'Parceiros', 'Carreiras', 'Imprensa', 'Contato'],
  Legal: ['Política de Privacidade', 'Termos de Uso', 'Política de Cookies', 'Conformidade LGPD'],
};

const socials = [
  { icon: 'ri-instagram-line', label: 'Instagram' },
  { icon: 'ri-linkedin-box-line', label: 'LinkedIn' },
  { icon: 'ri-twitter-x-line', label: 'X / Twitter' },
  { icon: 'ri-youtube-line', label: 'YouTube' },
];

const languages = ['Português', 'English', 'Español', 'Français'];

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('Português');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new URLSearchParams();
    const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
    if (emailInput && emailInput.value.trim()) {
      formData.append('email', emailInput.value.trim());
      try {
        await fetch('https://readdy.ai/api/form/d84mj11n2eikjpjtqdjg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
      } catch {
        // continue
      }
      setSubmitted(true);
    }
  };

  return (
    <footer className="bg-navy-950 text-white">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <i className="ri-compass-3-line text-amber-400 text-base"></i>
              </div>
              <div>
                <div className="font-serif font-semibold text-base text-white leading-tight">
                  Experience Connect
                </div>
                <div className="text-teal-400 text-xs tracking-wider uppercase">
                  Transfers &amp; Experiências
                </div>
              </div>
            </div>
            <p className="text-white/45 text-sm font-light leading-relaxed mb-6 max-w-xs">
              A plataforma premium que orquestra transfers e experiências de hospitalidade
              para viajantes exigentes e parceiros de excelência em todo o Brasil.
            </p>

            {/* Newsletter */}
            <div className="mb-2">
              <div className="text-white/60 text-xs font-medium uppercase tracking-widest mb-3">
                Novidades &amp; Insights
              </div>
              {submitted ? (
                <div className="flex items-center gap-2 text-teal-400 text-sm font-medium py-2">
                  <i className="ri-checkbox-circle-line"></i>
                  Inscrição realizada com sucesso!
                </div>
              ) : (
                <form
                  data-readdy-form
                  onSubmit={handleSubmit}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    className="flex-1 bg-white/8 border border-white/12 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-colors min-w-0"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-5">
                {category}
              </div>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      rel="nofollow"
                      className="text-white/55 hover:text-white text-sm font-light transition-colors duration-200 cursor-pointer"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5">
            <span className="text-white/35 text-xs">
              &copy; 2026 Experience Connect. Todos os direitos reservados.
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white/20 hidden sm:block"></span>
              <span className="text-white/35 text-xs">Feito com carinho no Brasil</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Socials */}
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  rel="nofollow"
                  aria-label={social.label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-colors duration-200 cursor-pointer"
                >
                  <i className={`${social.icon} text-white/60 text-sm`}></i>
                </a>
              ))}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-white/45 hover:text-white/75 text-xs transition-colors duration-200 cursor-pointer"
              >
                <i className="ri-translate-2 text-sm"></i>
                {selectedLang}
                <i className="ri-arrow-down-s-line text-sm"></i>
              </button>
              {langOpen && (
                <div className="absolute bottom-8 right-0 bg-navy-900 border border-white/12 rounded-xl overflow-hidden min-w-[140px] z-20">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setSelectedLang(lang); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                        selectedLang === lang
                          ? 'text-teal-400 bg-white/8'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}