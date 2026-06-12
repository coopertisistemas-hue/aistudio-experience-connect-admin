import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@connect/core';
import type { Database } from '@connect/core';

type TenantRow = Database['public']['Tables']['tenants']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];

type Json = Record<string, unknown>;

type UserTenantJoinedRow = Database['public']['Tables']['user_tenants']['Row'] & {
  users: Database['public']['Tables']['users']['Row'] | null;
};

// postgrest-js typed `.update()` resolves to `never` with `Json` unions (TS 5.x).
const asNever = <T>(v: T) => v as never;

export interface TenantProfile {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo_url: string | null;
  plan: string;
  plan_renewal: string;
  status: string;
  timezone: string;
  operational_hours_start: string;
  operational_hours_end: string;
  default_transfer_duration: number;
  default_vehicle_capacity: number;
  delay_threshold_minutes: number;
  auto_confirm_bookings: boolean;
  require_checkin_confirmation: boolean;
  operating_days: string[];
  created_at: string;
  branding: Record<string, unknown>;
}

export interface UserTenantWithUser {
  user_id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  last_access: string;
  joined_at: string;
}

const defaultTenantProfile = (row: TenantRow): TenantProfile => {
  const s = (row.settings as Record<string, unknown>) || {};
  const profile = (s.profile as Record<string, unknown>) || {};
  const operational = (s.operational as Record<string, unknown>) || {};
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: (profile.email as string) || '',
    phone: (profile.phone as string) || '',
    address: (profile.address as string) || '',
    city: (profile.city as string) || '',
    country: (profile.country as string) || '',
    logo_url: (profile.logo_url as string | null) || null,
    plan: row.plan || 'professional',
    plan_renewal: (profile.plan_renewal as string) || '',
    status: row.status || 'active',
    timezone: (operational.timezone as string) || 'America/Sao_Paulo',
    operational_hours_start: (operational.hours_start as string) || '05:00',
    operational_hours_end: (operational.hours_end as string) || '23:30',
    default_transfer_duration: (operational.transfer_duration as number) ?? 45,
    default_vehicle_capacity: (operational.vehicle_capacity as number) ?? 4,
    delay_threshold_minutes: (operational.delay_threshold as number) ?? 15,
    auto_confirm_bookings: (operational.auto_confirm as boolean) ?? false,
    require_checkin_confirmation: (operational.require_checkin as boolean) ?? true,
    operating_days: (operational.operating_days as string[]) || ['seg', 'ter', 'qua', 'qui', 'sex'],
    created_at: row.created_at,
    branding: (row.branding as Record<string, unknown>) || {},
  };
};

export const settingsService = {
  async getTenant(tenantId: string): Promise<TenantProfile> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error || !data) {
      console.error('[settingsService.getTenant]', error);
      throw error || new Error('Tenant not found');
    }

    return defaultTenantProfile(data as TenantRow);
  },

  async updateTenant(tenantId: string, data: Partial<TenantProfile>): Promise<TenantProfile> {
    const profileFields: Record<string, unknown> = {};
    const operationalFields: Record<string, unknown> = {};
    const directFields: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (key === 'name' || key === 'slug') {
        directFields[key] = value;
      } else if (['timezone', 'operational_hours_start', 'operational_hours_end', 'default_transfer_duration', 'default_vehicle_capacity', 'delay_threshold_minutes', 'auto_confirm_bookings', 'require_checkin_confirmation', 'operating_days'].includes(key)) {
        const opKey = key === 'operational_hours_start' ? 'hours_start'
          : key === 'operational_hours_end' ? 'hours_end'
          : key === 'default_transfer_duration' ? 'transfer_duration'
          : key === 'default_vehicle_capacity' ? 'vehicle_capacity'
          : key === 'delay_threshold_minutes' ? 'delay_threshold'
          : key === 'auto_confirm_bookings' ? 'auto_confirm'
          : key === 'require_checkin_confirmation' ? 'require_checkin'
          : key;
        operationalFields[opKey] = value;
      } else {
        profileFields[key] = value;
      }
    }

    const { data: current, error: curErr } = await supabase.from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();

    if (curErr || !current) throw curErr || new Error('Tenant not found');
    const currentSettings = ((current as { settings: Record<string, unknown> }).settings ?? {}) as Record<string, unknown>;
    const newSettings = {
      ...currentSettings,
      profile: { ...(currentSettings.profile as Record<string, unknown> || {}), ...profileFields },
      operational: { ...(currentSettings.operational as Record<string, unknown> || {}), ...operationalFields },
    };

    const { data: result, error } = await supabase.from('tenants')
      .update(asNever({ ...directFields, settings: newSettings }))
      .eq('id', tenantId)
      .select()
      .single();

    if (error || !result) {
      console.error('[settingsService.updateTenant]', error);
      throw error || new Error('Update failed');
    }

    return defaultTenantProfile(result as TenantRow);
  },

  async updateSettings(tenantId: string, settings: Record<string, unknown>): Promise<void> {
    const { data: current, error: curErr } = await supabase.from('tenants')
      .select('settings')
      .eq('id', tenantId)
      .single();

    if (curErr || !current) throw curErr || new Error('Tenant not found');
    const currentSettings = ((current as { settings: Record<string, unknown> }).settings ?? {}) as Record<string, unknown>;
    const merged = { ...currentSettings, operational: settings };

    const { error } = await supabase.from('tenants')
      .update(asNever({ settings: merged }))
      .eq('id', tenantId);

    if (error) {
      console.error('[settingsService.updateSettings]', error);
      throw error;
    }
  },

  async updateBranding(tenantId: string, branding: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.from('tenants')
      .update(asNever({ branding }))
      .eq('id', tenantId);

    if (error) {
      console.error('[settingsService.updateBranding]', error);
      throw error;
    }
  },

  async listTeam(tenantId: string): Promise<UserTenantWithUser[]> {
    const { data, error } = await supabase
      .from('user_tenants')
      .select(`
        *,
        users!user_tenants_user_id_fkey(*)
      `)
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    if (error || !data) {
      console.error('[settingsService.listTeam]', error);
      if (error) throw error;
      return [];
    }

    return (data as UserTenantJoinedRow[]).map((row) => ({
      user_id: row.user_id,
      name: row.users?.full_name || null,
      email: row.users?.email || '',
      role: row.role,
      status: row.status,
      avatar_url: row.users?.avatar_url || null,
      last_access: row.users?.updated_at || '',
      joined_at: row.created_at,
    }));
  },

  async inviteMember(tenantId: string, email: string, role: string): Promise<void> {
    const { error } = await invokeEdgeFunction<any>(
      supabase as any,
      'invite-user',
      { tenant_id: tenantId, email, role } as any,
    );

    if (error) {
      console.error('[settingsService.inviteMember]', error);
      throw error;
    }
  },

  async updateMemberRole(userId: string, role: string): Promise<void> {
    const { error } = await supabase.from('user_tenants')
      .update(asNever({ role }))
      .eq('user_id', userId);

    if (error) {
      console.error('[settingsService.updateMemberRole]', error);
      throw error;
    }
  },

  async removeMember(userId: string): Promise<void> {
    const { error } = await supabase.from('user_tenants')
      .update(asNever({ deleted_at: new Date().toISOString() }))
      .eq('user_id', userId);

    if (error) {
      console.error('[settingsService.removeMember]', error);
      throw error;
    }
  },
};
