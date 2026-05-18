export type { TenantId } from '../types';
import type { TenantId } from '../types';

/**
 * Aplica tenant_id em uma query Supabase.
 * Use como padrão em TODAS as queries de dados operacionais.
 *
 * @example
 * const query = withTenant(
 *   supabase.from('bookings').select('*'),
 *   tenantId
 * );
 */
export function withTenant<T>(
  query: { eq: (column: string, value: string) => T },
  tenantId: TenantId
): T {
  return query.eq('tenant_id', tenantId);
}

/**
 * Verifica se um objeto possui tenant_id.
 * Útil para validações antes de inserts/updates.
 */
export function hasTenantScope<T extends { tenant_id?: string }>(
  record: T
): record is T & { tenant_id: string } {
  return typeof record.tenant_id === 'string' && record.tenant_id.length > 0;
}

/**
 * Injeta tenant_id em um objeto de insert/update.
 * Sempre use antes de enviar dados ao Supabase.
 */
export function injectTenant<T extends object>(
  record: T,
  tenantId: TenantId
): T & { tenant_id: TenantId } {
  return { ...record, tenant_id: tenantId };
}
