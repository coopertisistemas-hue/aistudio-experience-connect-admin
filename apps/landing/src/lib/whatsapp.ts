export function getWhatsAppNumber(
  tenantSettings: { whatsapp_number: string | null } | undefined,
  fallback?: string
): string {
  if (tenantSettings?.whatsapp_number) return tenantSettings.whatsapp_number;
  if (fallback) return fallback;
  return import.meta.env.VITE_WHATSAPP_DEFAULT_NUMBER || '';
}

export function getWhatsAppMessage(
  tenantSettings: { whatsapp_message_template: string | null } | undefined,
  routeName?: string
): string {
  if (tenantSettings?.whatsapp_message_template) {
    return tenantSettings.whatsapp_message_template.replace('{route}', routeName || '');
  }
  return '';
}
