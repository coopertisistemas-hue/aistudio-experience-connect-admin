import { supabase } from '@/lib/supabase';

export interface TenantSettings {
  whatsapp_number: string | null;
  whatsapp_message_template: string | null;
}

export const tenantService = {
  async getSettings(tenantId: string): Promise<TenantSettings> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const { data, error } = await client
      .from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();

    if (error || !data) {
      console.warn('[tenantService] Could not fetch tenant settings:', error);
      return { whatsapp_number: null, whatsapp_message_template: null };
    }

    const settings = (data.settings as Record<string, unknown>) || {};
    return {
      whatsapp_number: (settings.whatsapp_number as string) || null,
      whatsapp_message_template: (settings.whatsapp_message_template as string) || null,
    };
  },
};
