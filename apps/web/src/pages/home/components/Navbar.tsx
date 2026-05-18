import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { label: 'Experiências', href: '#experiences' },
  { label: 'Plataforma', href: '#platform' },
  { label: 'Parceiros', href: '#partners' },
  { label: 'Ecossistema', href: '#ecosystem' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-sand-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                scrolled ? 'bg-navy-900' : 'bg-white/20 border border-white/30'
              }`}
            >
              <i className={`ri-compass-3-line text-base ${scrolled ? 'text-amber-400' : 'text-white'}`}></i>
            </div>
            <div>
              <span
                className={`font-serif font-semibold text-lg leading-tight block transition-colors duration-300 ${
                  scrolled ? 'text-navy-900' : 'text-white'
                }`}
              >
                Experience Connect
              </span>
              <span
                className={`text-xs font-sans font-normal tracking-wider uppercase transition-colors duration-300 ${
                  scrolled ? 'text-teal-600' : 'text-white/70'
                }`}
              >
                Transfers & Experiences
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-sm font-medium transition-colors duration-200 hover:text-amber-500 cursor-pointer ${
                  scrolled ? 'text-navy-700' : 'text-white/85'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                scrolled ? 'text-navy-700 hover:text-navy-900' : 'text-white/85 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Começar Agora
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-200 ${
              scrolled ? 'text-navy-800 hover:bg-sand-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            <i className={`text-xl ${menuOpen ? 'ri-close-line' : 'ri-menu-3-line'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } bg-white border-b border-sand-200`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="text-navy-800 font-medium text-sm py-2 border-b border-sand-100 cursor-pointer hover:text-teal-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { navigate('/login'); setMenuOpen(false); }}
            className="bg-amber-500 text-white text-sm font-semibold px-5 py-3 rounded-lg text-center mt-2 cursor-pointer whitespace-nowrap"
          >
            Começar Agora
          </button>
          <button
            onClick={() => { navigate('/login'); setMenuOpen(false); }}
            className="border border-navy-200 text-navy-700 text-sm font-medium px-5 py-3 rounded-lg text-center cursor-pointer whitespace-nowrap"
          >
            Entrar
          </button>
        </div>
      </div>
    </nav>
  );
}