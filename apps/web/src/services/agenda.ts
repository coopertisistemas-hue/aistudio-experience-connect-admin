import { bookingService } from './bookings';
import type { BookingWithDetails } from './bookings';

export type AgendaStatus =
  | 'scheduled'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

export type AgendaConflictType =
  | 'driver_double'
  | 'vehicle_double'
  | 'time_overlap'
  | 'capacity_exceeded'
  | 'operational_delay';

export interface AgendaDriverDisplay {
  id: string;
  name: string;
  initials: string;
  phone: string;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_type: string;
  vehicle_capacity: number;
}

export interface AgendaTimelineEvent {
  id: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface AgendaItem {
  id: string;
  reference: string;
  booking_type: 'transfer' | 'experience';
  status: AgendaStatus;
  scheduled_at: string;
  estimated_duration_min: number;
  pickup_location: string;
  dropoff_location: string;
  route_name: string | null;
  driver: AgendaDriverDisplay | null;
  passenger_name: string;
  passenger_count: number;
  notes: string | null;
  timeline: AgendaTimelineEvent[];
}

export interface AgendaConflict {
  id: string;
  type: AgendaConflictType;
  severity: 'warning' | 'critical';
  label: string;
  description: string;
  affected_item_ids: string[];
}

function computeInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function mapBookingStatusToAgenda(booking: BookingWithDetails): AgendaStatus {
  if (booking.status === 'cancelled') return 'cancelled';
  if (booking.status === 'in_progress') return 'in_progress';
  if (booking.status === 'completed') return 'completed';

  if (booking.status === 'confirmed') {
    const isPast = new Date(booking.scheduled_at) < new Date();
    if (isPast) return 'delayed';
    if (booking.driver_id) return 'driver_assigned';
    return 'scheduled';
  }

  if (booking.status === 'draft' || booking.status === 'hold_created' || booking.status === 'payment_pending') {
    return 'scheduled';
  }

  return 'scheduled';
}

function deriveTimeline(booking: BookingWithDetails): AgendaTimelineEvent[] {
  const events: AgendaTimelineEvent[] = [];

  events.push({
    id: `${booking.id}-created`,
    label: 'Reserva criada',
    description: 'Registro inicial da solicitação.',
    at: booking.created_at,
    icon: 'ri-add-circle-line',
    color: 'stone',
  });

  if (booking.payment_status === 'completed') {
    events.push({
      id: `${booking.id}-payment`,
      label: 'Pagamento aprovado',
      description: booking.payment_method
        ? `Pagamento via ${booking.payment_method}.`
        : 'Pagamento confirmado.',
      at: booking.scheduled_at,
      icon: 'ri-checkbox-circle-line',
      color: 'teal',
    });
  }

  if (booking.driver_name) {
    events.push({
      id: `${booking.id}-driver`,
      label: 'Motorista atribuído',
      description: `${booking.driver_name} — ${booking.vehicle_name || ''} ${booking.vehicle_plate || ''}`.trim(),
      at: booking.scheduled_at,
      icon: 'ri-steering-2-line',
      color: 'navy',
    });
  }

  if (booking.status === 'in_progress') {
    events.push({
      id: `${booking.id}-started`,
      label: 'Transfer iniciado',
      description: 'Partida confirmada.',
      at: booking.scheduled_at,
      icon: 'ri-car-line',
      color: 'navy',
    });
  }

  if (booking.status === 'completed') {
    events.push({
      id: `${booking.id}-completed`,
      label: 'Finalizado',
      description: 'Transfer concluído com sucesso.',
      at: booking.scheduled_end_at || booking.scheduled_at,
      icon: 'ri-checkbox-circle-line',
      color: 'teal',
    });
  }

  if (mapBookingStatusToAgenda(booking) === 'delayed') {
    events.push({
      id: `${booking.id}-delayed`,
      label: 'Atraso operacional',
      description: 'ETA revisado devido ao horário excedido.',
      at: booking.scheduled_at,
      icon: 'ri-alarm-warning-line',
      color: 'amber',
    });
  }

  return events;
}

function buildDriverDisplay(booking: BookingWithDetails): AgendaDriverDisplay | null {
  if (!booking.driver_name) return null;
  return {
    id: booking.driver_id || '',
    name: booking.driver_name,
    initials: computeInitials(booking.driver_name),
    phone: booking.driver_phone || '',
    vehicle_name: booking.vehicle_name || '',
    vehicle_plate: booking.vehicle_plate || '',
    vehicle_type: booking.vehicle_type || '',
    vehicle_capacity: booking.vehicle_capacity ?? 0,
  };
}

function computeDuration(booking: BookingWithDetails): number {
  if (booking.scheduled_end_at) {
    const start = new Date(booking.scheduled_at).getTime();
    const end = new Date(booking.scheduled_end_at).getTime();
    const diff = Math.round((end - start) / 60000);
    if (diff > 0) return diff;
  }
  return 60;
}

function mapToAgendaItem(booking: BookingWithDetails): AgendaItem {
  return {
    id: booking.id,
    reference: booking.reference,
    booking_type: booking.booking_type,
    status: mapBookingStatusToAgenda(booking),
    scheduled_at: booking.scheduled_at,
    estimated_duration_min: computeDuration(booking),
    pickup_location: booking.pickup_location,
    dropoff_location: booking.dropoff_location,
    route_name: booking.route_name,
    driver: buildDriverDisplay(booking),
    passenger_name: booking.passenger_name,
    passenger_count: booking.passenger_count,
    notes: booking.notes,
    timeline: deriveTimeline(booking),
  };
}

export const agendaService = {
  async listByDate(tenantId: string, date: string): Promise<{ items: AgendaItem[]; conflicts: AgendaConflict[] }> {
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const { data: bookings } = await bookingService.list(tenantId, {
      dateFrom: dayStart,
      dateTo: date,
    });

    const items = bookings
      .filter((b) => {
        const d = b.scheduled_at.split('T')[0];
        return d === date;
      })
      .map(mapToAgendaItem);

    const conflicts = agendaService.detectConflicts(items);

    return { items, conflicts };
  },

  async listDrivers(tenantId: string): Promise<{ id: string; name: string; vehicle_type: string }[]> {
    const { data: bookings } = await bookingService.list(tenantId);
    const driverMap = new Map<string, { id: string; name: string; vehicle_type: string }>();

    for (const b of bookings) {
      if (b.driver_id && b.driver_name) {
        driverMap.set(b.driver_id, {
          id: b.driver_id,
          name: b.driver_name,
          vehicle_type: b.vehicle_type || '',
        });
      }
    }

    return Array.from(driverMap.values());
  },

  detectConflicts(items: AgendaItem[]): AgendaConflict[] {
    const conflicts: AgendaConflict[] = [];
    let conflictId = 0;

    const nextId = () => {
      conflictId += 1;
      return `ag-conflict-${conflictId}`;
    };

    const driverGroups = new Map<string, AgendaItem[]>();
    const vehicleGroups = new Map<string, AgendaItem[]>();

    for (const item of items) {
      if (item.driver) {
        if (!driverGroups.has(item.driver.id)) driverGroups.set(item.driver.id, []);
        driverGroups.get(item.driver.id)!.push(item);

        const vKey = `${item.driver.vehicle_plate}`;
        if (vKey) {
          if (!vehicleGroups.has(vKey)) vehicleGroups.set(vKey, []);
          vehicleGroups.get(vKey)!.push(item);
        }
      }
    }

    const unassigned = items.filter((i) => !i.driver);
    if (unassigned.length > 1) {
      conflicts.push({
        id: nextId(),
        type: 'driver_double',
        severity: 'warning',
        label: `Motorista não alocado — ${unassigned.length} transfers pendentes`,
        description: `${unassigned.length} agendamentos ainda sem motorista definido.`,
        affected_item_ids: unassigned.map((i) => i.id),
      });
    }

    for (const [, group] of driverGroups) {
      if (group.length < 2) continue;

      const sorted = [...group].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        const currentEnd = new Date(current.scheduled_at).getTime() + current.estimated_duration_min * 60000;
        const nextStart = new Date(next.scheduled_at).getTime();

        if (nextStart < currentEnd) {
          const overlapMin = Math.round((currentEnd - nextStart) / 60000);
          conflicts.push({
            id: nextId(),
            type: 'time_overlap',
            severity: overlapMin > 30 ? 'critical' : 'warning',
            label: `Conflito de horário — ${current.driver!.name}`,
            description: `${current.driver!.name} tem ${current.reference} e ${next.reference}. Sobreposição de ${overlapMin} minutos.`,
            affected_item_ids: [current.id, next.id],
          });
        }
      }
    }

    for (const [, group] of vehicleGroups) {
      if (group.length < 2) continue;
      const sorted = [...group].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        const currentEnd = new Date(current.scheduled_at).getTime() + current.estimated_duration_min * 60000;
        const nextStart = new Date(next.scheduled_at).getTime();

        if (nextStart < currentEnd) {
          conflicts.push({
            id: nextId(),
            type: 'vehicle_double',
            severity: 'critical',
            label: `Veículo com reserva duplicada — ${current.driver?.vehicle_plate}`,
            description: `O veículo ${current.driver?.vehicle_plate} tem transfers sobrepostos: ${current.reference} e ${next.reference}.`,
            affected_item_ids: [current.id, next.id],
          });
          break;
        }
      }
    }

    const delayedItems = items.filter((i) => i.status === 'delayed');
    for (const item of delayedItems) {
      conflicts.push({
        id: nextId(),
        type: 'operational_delay',
        severity: 'warning',
        label: `Atraso operacional — ${item.driver?.name || item.reference}`,
        description: `${item.reference} com atraso. Horário agendado: ${item.scheduled_at}.`,
        affected_item_ids: [item.id],
      });
    }

    return conflicts;
  },
};
