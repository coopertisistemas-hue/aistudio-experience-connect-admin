import type { SearchResult } from '@/hooks/useGlobalSearch';
import { mockBookings } from '@/mocks/admin-bookings';
import { mockTransfers } from '@/mocks/admin-transfers';
import { mockDrivers } from '@/mocks/admin-drivers';
import { mockVehicles } from '@/mocks/admin-vehicles';
import { mockRoutes } from '@/mocks/admin-routes';
import { mockCustomers } from '@/mocks/admin-customers';
import { mockPayments } from '@/mocks/admin-payments';
import { mockExperiences, mockPartners } from '@/mocks/admin-experiences';

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // Bookings
  mockBookings.forEach((b) => {
    results.push({
      id: `booking-${b.id}`,
      title: b.passenger_name,
      subtitle: `${b.reference} · ${b.route_name ?? ''}`,
      meta: `R$ ${b.total_amount.toLocaleString('pt-BR')}`,
      status: b.status,
      statusColor:
        b.status === 'confirmed' ? 'text-teal-600' :
        b.status === 'in_progress' ? 'text-indigo-600' :
        b.status === 'completed' ? 'text-stone-500' :
        b.status === 'cancelled' ? 'text-red-500' : 'text-amber-600',
      group: 'Reservas',
      icon: 'ri-calendar-check-line',
      path: '/admin/bookings',
    });
  });

  // Transfers
  mockTransfers.forEach((t) => {
    results.push({
      id: `transfer-${t.id}`,
      title: t.passenger_name,
      subtitle: `${t.reference} · ${t.origin} → ${t.destination}`,
      meta: new Date(t.scheduled_at).toLocaleDateString('pt-BR'),
      status: t.status,
      statusColor:
        t.status === 'in_progress' ? 'text-indigo-600' :
        t.status === 'completed' ? 'text-teal-600' :
        t.status === 'delayed' ? 'text-red-500' :
        t.status === 'cancelled' ? 'text-stone-400' : 'text-amber-600',
      group: 'Transfers',
      icon: 'ri-car-line',
      path: '/admin/transfers',
    });
  });

  // Customers
  mockCustomers.forEach((c) => {
    results.push({
      id: `customer-${c.id}`,
      title: c.name,
      subtitle: `${c.email} · ${c.total_bookings} reservas`,
      meta: c.total_spent > 0 ? `R$ ${c.total_spent.toLocaleString('pt-BR')}` : undefined,
      status: c.status,
      statusColor:
        c.status === 'vip' ? 'text-amber-600' :
        c.status === 'active' ? 'text-teal-600' : 'text-stone-400',
      group: 'Clientes',
      icon: 'ri-contacts-book-2-line',
      path: '/admin/clients',
    });
  });

  // Drivers
  mockDrivers.forEach((d) => {
    results.push({
      id: `driver-${d.id}`,
      title: d.full_name,
      subtitle: `${d.license_type} · ${d.assigned_vehicle ?? 'Sem veículo'}`,
      meta: d.phone,
      status: d.status,
      statusColor:
        d.status === 'available' ? 'text-teal-600' :
        d.status === 'on_trip' ? 'text-indigo-600' :
        d.status === 'paused' ? 'text-amber-600' :
        d.status === 'unavailable' ? 'text-stone-400' : 'text-stone-500',
      group: 'Motoristas',
      icon: 'ri-steering-2-line',
      path: '/admin/drivers',
    });
  });

  // Vehicles
  mockVehicles.forEach((v) => {
    results.push({
      id: `vehicle-${v.id}`,
      title: `${v.make} ${v.model}`,
      subtitle: `${v.plate} · ${v.year}`,
      meta: `${v.capacity} pax`,
      status: v.status,
      statusColor:
        v.status === 'available' ? 'text-teal-600' :
        v.status === 'in_operation' ? 'text-indigo-600' :
        v.status === 'maintenance' ? 'text-amber-600' :
        v.status === 'attention' ? 'text-red-500' : 'text-stone-400',
      group: 'Veículos',
      icon: 'ri-taxi-line',
      path: '/admin/vehicles',
    });
  });

  // Routes
  mockRoutes.forEach((r) => {
    results.push({
      id: `route-${r.id}`,
      title: r.name,
      subtitle: `${r.origin_name} → ${r.destination_name}`,
      meta: `R$ ${r.base_price.toLocaleString('pt-BR')}`,
      status: r.status,
      statusColor:
        r.status === 'active' ? 'text-teal-600' :
        r.status === 'high_demand' ? 'text-red-500' :
        r.status === 'paused' ? 'text-amber-600' : 'text-stone-400',
      group: 'Rotas',
      icon: 'ri-route-line',
      path: '/admin/routes',
    });
  });

  // Payments
  mockPayments.forEach((p) => {
    results.push({
      id: `payment-${p.id}`,
      title: p.passenger_name,
      subtitle: `${p.reference} · ${p.booking_reference}`,
      meta: `R$ ${p.total_amount.toLocaleString('pt-BR')}`,
      status: p.status,
      statusColor:
        p.status === 'paid' ? 'text-teal-600' :
        p.status === 'overdue' ? 'text-red-500' :
        p.status === 'partial' ? 'text-amber-600' :
        p.status === 'refunded' ? 'text-stone-400' : 'text-indigo-600',
      group: 'Pagamentos',
      icon: 'ri-secure-payment-line',
      path: '/admin/payments',
    });
  });

  // Experiences
  mockExperiences.forEach((e) => {
    results.push({
      id: `exp-${e.id}`,
      title: e.name,
      subtitle: `${e.category_name} · ${e.partner_name}`,
      meta: `R$ ${e.base_price.toLocaleString('pt-BR')}`,
      status: e.status,
      statusColor:
        e.status === 'active' ? 'text-teal-600' :
        e.status === 'high_demand' ? 'text-red-500' :
        e.status === 'paused' ? 'text-amber-600' :
        e.status === 'draft' ? 'text-indigo-500' : 'text-stone-400',
      group: 'Experiências',
      icon: 'ri-compass-discover-line',
      path: '/admin/experiences',
    });
  });

  // Partners
  mockPartners.forEach((p) => {
    results.push({
      id: `partner-${p.id}`,
      title: p.name,
      subtitle: `${p.type} · ${p.city}, ${p.state}`,
      meta: p.contact_name,
      status: p.status,
      statusColor:
        p.status === 'active' ? 'text-teal-600' :
        p.status === 'paused' ? 'text-amber-600' : 'text-stone-400',
      group: 'Parceiros',
      icon: 'ri-hand-heart-line',
      path: '/admin/partners',
    });
  });

  return results;
}

const SEARCH_INDEX = buildIndex();

export function searchAll(query: string): SearchResult[] {
  if (!query.trim() || query.length < 2) return [];
  const q = query.toLowerCase();
  return SEARCH_INDEX.filter((item) =>
    item.title.toLowerCase().includes(q) ||
    item.subtitle.toLowerCase().includes(q) ||
    (item.meta?.toLowerCase().includes(q) ?? false)
  ).slice(0, 40);
}

export function groupResults(results: SearchResult[]): Map<string, SearchResult[]> {
  const map = new Map<string, SearchResult[]>();
  results.forEach((r) => {
    const group = map.get(r.group) ?? [];
    group.push(r);
    map.set(r.group, group);
  });
  return map;
}