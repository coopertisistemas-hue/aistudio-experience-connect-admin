import { supabase } from '@/lib/supabase';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function submitContact(data: ContactFormData): Promise<boolean> {
  const tenantId = import.meta.env.VITE_PUBLIC_TENANT_ID || '';

  const { error } = await supabase.from('contact_messages').insert({
    tenant_id: tenantId,
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject,
    message: data.message,
  } as never);

  if (error) {
    console.error('[contactService.submitContact]', error);
    return false;
  }

  return true;
}
