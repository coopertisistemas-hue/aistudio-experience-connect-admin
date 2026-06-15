import { Link } from 'react-router-dom';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';

interface CTASectionProps {
  whatsappNumber?: string;
}

export function CTASection({ whatsappNumber }: CTASectionProps) {
  return (
    <section id="contato" className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Pronto para uma experiência única?
        </h2>
        <p className="text-slate-400 text-lg">
          Entre em contato conosco e descubra como podemos transformar sua
          estadia em momentos inesquecíveis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {whatsappNumber ? (
            <WhatsAppCTA
              phoneNumber={whatsappNumber}
              label="Fale pelo WhatsApp"
              variant="primary"
              className="px-8 py-3"
            />
          ) : (
            <a
              href="https://wa.me/5511999999999"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              Fale pelo WhatsApp
            </a>
          )}
          <Link
            to="/contato"
            className="inline-flex items-center justify-center rounded-lg bg-white/5 px-8 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/10 transition-colors"
          >
            Enviar Mensagem
          </Link>
        </div>
      </div>
    </section>
  );
}
