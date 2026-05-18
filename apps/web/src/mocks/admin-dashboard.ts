// PLACEHOLDER — schema-aware mock data aligned with Supabase schema
// Replace with real Supabase queries when operational data is available

export const mockKPIs = {
  reservasHoje: 14,
  transfersEmAndamento: 3,
  motoristasAtivos: 7,
  ocupacaoMedia: 82,
  receitaConfirmada: 18450,
  checkInsPendentes: 5,
};

export const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    icon: 'ri-time-line',
    title: 'Transfer atrasado',
    description: 'Rota Galeão → Ipanema — Saída prevista 14:30, sem confirmação do motorista.',
    time: '14 min atrás',
  },
  {
    id: '2',
    type: 'error' as const,
    icon: 'ri-user-unfollow-line',
    title: 'Motorista não confirmado',
    description: 'Carlos Mendes não confirmou o transfer das 16:00 (Rota Santos Dumont → Leblon).',
    time: '28 min atrás',
  },
  {
    id: '3',
    type: 'info' as const,
    icon: 'ri-secure-payment-line',
    title: 'Pagamento pendente',
    description: 'Reserva #BK-0042 — R$ 320,00 aguardando confirmação de pagamento.',
    time: '1h atrás',
  },
  {
    id: '4',
    type: 'warning' as const,
    icon: 'ri-dashboard-3-line',
    title: 'Capacidade próxima do limite',
    description: 'Van Mercedes Vito (Rota Búzios) — 9/10 assentos ocupados para amanhã.',
    time: '2h atrás',
  },
];

export const mockFinancialSummary = {
  receitaHoje: 4320,
  receitaSemana: 18450,
  pendente: 2180,
  confirmado: 16270,
};

export const mockRecentActivity = [
  { id: '1', type: 'booking', text: 'Nova reserva criada', detail: '#BK-0051 — Eduardo Tavares, 2 pax', time: '5 min' },
  { id: '2', type: 'transfer', text: 'Transfer finalizado', detail: 'Rota Copacabana → Galeão — motorista João Silva', time: '22 min' },
  { id: '3', type: 'payment', text: 'Pagamento confirmado', detail: '#BK-0047 — R$ 580,00 via cartão', time: '41 min' },
  { id: '4', type: 'booking', text: 'Reserva cancelada', detail: '#BK-0039 — Solicitação do cliente', time: '1h 10min' },
];