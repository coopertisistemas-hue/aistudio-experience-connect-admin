import { Helmet } from 'react-helmet-async';

import { CatalogSection } from '@/components/CatalogSection';
import { CTASection } from '@/components/CTASection';
import { HeroSection } from '@/components/HeroSection';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { getWhatsAppNumber } from '@/lib/whatsapp';

const TENANT_ID = import.meta.env.VITE_PUBLIC_TENANT_ID || 'default';

export function Home() {
  const { data: tenantSettings } = useTenantSettings(TENANT_ID);
  const whatsappNumber = getWhatsAppNumber(tenantSettings, '5511999999999');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dom Pietro Experience',
    url: 'https://dompietro.com',
    logo: 'https://dompietro.com/logo.png',
    description:
      'Transfers exclusivos, experiências únicas e concierge digital para hóspedes de alto padrão.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+55-${whatsappNumber.slice(2)}`,
      contactType: 'customer service',
      email: 'contato@dompietro.com',
    },
    sameAs: ['https://instagram.com/dompietro'],
  };

  return (
    <>
      <Helmet>
        <title>Dom Pietro Experience — Transfers & Experiências Exclusivas</title>
        <meta
          name="description"
          content="Transfers exclusivos, experiências únicas e concierge digital para hóspedes de alto padrão. Descubra a Dom Pietro Experience."
        />
        <meta property="og:title" content="Dom Pietro Experience" />
        <meta
          property="og:description"
          content="Transfers exclusivos, experiências únicas e concierge digital para hóspedes de alto padrão."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dompietro.com" />
        <meta property="og:image" content="https://dompietro.com/og-image.png" />
        <link rel="canonical" href="https://dompietro.com" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <HeroSection />
      <CatalogSection />
      <CTASection whatsappNumber={whatsappNumber} />
    </>
  );
}
