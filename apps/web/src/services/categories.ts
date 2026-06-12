import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type CategoryRow = Database['public']['Tables']['route_categories']['Row'];
type CategoryInsert = Database['public']['Tables']['route_categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['route_categories']['Update'];

export interface CategoryDisplay {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  experiences_count: number;
  bookings_count: number;
  demand: string;
  visibility: string;
  sort_order: number;
  tags: string[];
}

function mapToDisplay(row: CategoryRow, stats?: { experiences_count: number; bookings_count: number }): CategoryDisplay {
  const tags = row.tags;
  const tagsArray = Array.isArray(tags) ? tags as string[] : [];

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    icon: row.icon || 'ri-price-tag-3-line',
    color: row.color || 'teal',
    experiences_count: stats?.experiences_count ?? 0,
    bookings_count: stats?.bookings_count ?? 0,
    demand: 'medium',
    visibility: row.visibility || 'visible',
    sort_order: row.sort_order,
    tags: tagsArray,
  };
}

interface CategoryStats {
  experiences_count: number;
  bookings_count: number;
}

const _from = (table: string) => supabase.from(table) as any;

async function computeAllCategoryStats(tenantId: string): Promise<Map<string, CategoryStats>> {
  const { data: rawRoutes } = await _from('routes')
    .select('id, category_id')
    .eq('tenant_id', tenantId);

  const routes: { id: string; category_id: string | null }[] = rawRoutes || [];
  const routeIdsByCategory = new Map<string, string[]>();
  const allRouteIds: string[] = [];

  for (const r of routes) {
    if (r.category_id) {
      if (!routeIdsByCategory.has(r.category_id)) routeIdsByCategory.set(r.category_id, []);
      routeIdsByCategory.get(r.category_id)!.push(r.id);
      allRouteIds.push(r.id);
    }
  }

  const bookingsByRoute = new Map<string, number>();
  if (allRouteIds.length > 0) {
    const { data: rawBookings } = await _from('bookings')
      .select('route_id')
      .in('route_id', allRouteIds)
      .eq('tenant_id', tenantId);

    const bookings: { route_id: string | null }[] = rawBookings || [];
    for (const b of bookings) {
      if (b.route_id) {
        bookingsByRoute.set(b.route_id, (bookingsByRoute.get(b.route_id) || 0) + 1);
      }
    }
  }

  const statsMap = new Map<string, CategoryStats>();

  for (const [categoryId, routeIds] of routeIdsByCategory) {
    const experiencesCount = routeIds.length;
    const bookingsCount = routeIds.reduce((sum, routeId) => sum + (bookingsByRoute.get(routeId) || 0), 0);
    statsMap.set(categoryId, { experiences_count: experiencesCount, bookings_count: bookingsCount });
  }

  return statsMap;
}

export const categoryService = {
  async list(tenantId: string): Promise<CategoryDisplay[]> {
    const { data: categories, error } = await supabase
      .from('route_categories')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sort_order');

    if (error || !categories) {
      console.error('[categoryService.list]', error);
      if (error) throw error;
      return [];
    }

    const statsMap = await computeAllCategoryStats(tenantId);

    return (categories as CategoryRow[]).map((row) => {
      const stats = statsMap.get(row.id);
      return mapToDisplay(row, stats);
    });
  },

  async getById(id: string, tenantId: string): Promise<CategoryDisplay | null> {
    const { data: category, error } = await supabase
      .from('route_categories')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !category) {
      console.error('[categoryService.getById]', error);
      if (error) throw error;
      return null;
    }

    const statsMap = await computeAllCategoryStats(tenantId);
    const stats = statsMap.get(id);
    return mapToDisplay(category as CategoryRow, stats);
  },

  async create(data: CategoryInsert): Promise<CategoryRow | null> {
    const { data: result, error } = await _from('route_categories')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('[categoryService.create]', error);
      throw error;
    }

    return result as CategoryRow;
  },

  async update(id: string, data: CategoryUpdate, tenantId: string): Promise<CategoryRow | null> {
    const { data: result, error } = await _from('route_categories')
      .update(data)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();

    if (error) {
      console.error('[categoryService.update]', error);
      throw error;
    }

    return result as CategoryRow;
  },

  async delete(id: string, tenantId: string): Promise<boolean> {
    const { error } = await _from('route_categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) {
      console.error('[categoryService.delete]', error);
      throw error;
    }

    return true;
  },
};
