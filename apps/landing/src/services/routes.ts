import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type RouteRow = Database['public']['Tables']['routes']['Row'];
type RouteCategoryRow = Database['public']['Tables']['route_categories']['Row'];

interface RouteWithCategoryRow extends RouteRow {
  route_categories: RouteCategoryRow | null;
}

export interface RouteWithCategory {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  origin: string | null;
  destination: string | null;
  distance_km: number | null;
  duration_min: number | null;
  base_price: number;
  images: Record<string, unknown>;
  is_active: boolean;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  created_at: string;
}

export interface RouteFilters {
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  max_duration?: number;
}

function mapRoute(
  row: RouteRow,
  category: RouteCategoryRow | null
): RouteWithCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    origin: row.origin,
    destination: row.destination,
    distance_km: row.distance_km,
    duration_min: row.duration_min,
    base_price: row.base_price,
    images: row.images as unknown as Record<string, unknown>,
    is_active: row.is_active,
    category_id: row.category_id,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    category_color: category?.color ?? null,
    created_at: row.created_at,
  };
}

export const publicRoutesService = {
  async list(filters?: RouteFilters): Promise<RouteWithCategory[]> {
    let query = supabase
      .from('routes')
      .select(
        `
        *,
        route_categories!routes_category_id_fkey(*)
      `
      )
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (filters?.category_slug) {
      query = query.eq('route_categories.slug', filters.category_slug);
    }
    if (filters?.min_price !== undefined) {
      query = query.gte('base_price', filters.min_price);
    }
    if (filters?.max_price !== undefined) {
      query = query.lte('base_price', filters.max_price);
    }
    if (filters?.max_duration !== undefined) {
      query = query.lte('duration_min', filters.max_duration);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[publicRoutesService.list]', error);
      throw error;
    }

    return (data as unknown as RouteWithCategoryRow[]).map((row) => {
      return mapRoute(row, row.route_categories);
    });
  },

  async getBySlug(slug: string): Promise<RouteWithCategory | null> {
    const { data, error } = await supabase
      .from('routes')
      .select(
        `
        *,
        route_categories!routes_category_id_fkey(*)
      `
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      if (error?.code !== 'PGRST116') {
        console.error('[publicRoutesService.getBySlug]', error);
      }
      return null;
    }

    const row = data as unknown as RouteWithCategoryRow;
    return mapRoute(row, row.route_categories);
  },
};
