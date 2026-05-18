// admin-settings.ts — Mock data aligned to: tenants, users, user_tenants, operational preferences

export interface MockTenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo_url: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
  plan_renewal: string;
  status: 'active' | 'suspended' | 'trial';
  timezone: string;
  created_at: string;
  operational_hours_start: string;
  operational_hours_end: string;
  default_transfer_duration: number;
  default_vehicle_capacity: number;
  delay_threshold_minutes: number;
  auto_confirm_bookings: boolean;
  require_checkin_confirmation: boolean;
  operating_days: string[];
}

export interface MockUserTenant {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'operator';
  status: 'active' | 'inactive' | 'pending';
  last_access: string;
  joined_at: string;
  avatar_initials: string;
}

export interface MockNotificationSetting {
  id: string;
  category: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  whatsapp: boolean;
}

export interface MockIntegration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync: string | null;
  category: 'payment' | 'communication' | 'mapping' | 'database' | 'email';
  config_hint: string;
}

export interface MockPermissionRow {
  module: string;
  icon: string;
  owner: boolean;
  admin: boolean;
  operator: boolean;
}

export interface MockSecuritySession {
  id: string;
  device: string;
  location: string;
  ip: string;
  last_active: string;
  is_current: boolean;
}

export const mockTenant: MockTenant = {
  id: 'tenant_ec_001',
  name: 'Experience Connect',
  slug: 'experience-connect',
  email: 'operacoes@experienceconnect.com.br',
  phone: '+55 11 9 8765-4321',
  address: 'Av. Paulista, 1811 — cj. 901',
  city: 'São Paulo, SP',
  country: 'Brasil',
  logo_url: null,
  plan: 'professional',
  plan_renewal: '2025-08-15',
  status: 'active',
  timezone: 'America/Sao_Paulo',
  created_at: '2024-01-10',
  operational_hours_start: '05:00',
  operational_hours_end: '23:30',
  default_transfer_duration: 45,
  default_vehicle_capacity: 4,
  delay_threshold_minutes: 15,
  auto_confirm_bookings: false,
  require_checkin_confirmation: true,
  operating_days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
};

export const mockTeamMembers: MockUserTenant[] = [
  {
    id: 'ut_01',
    user_id: 'usr_001',
    name: 'Rafael Andrade',
    email: 'rafael@experienceconnect.com.br',
    role: 'owner',
    status: 'active',
    last_access: '2025-05-17T09:14:00',
    joined_at: '2024-01-10',
    avatar_initials: 'RA',
  },
  {
    id: 'ut_02',
    user_id: 'usr_002',
    name: 'Camila Torres',
    email: 'camila@experienceconnect.com.br',
    role: 'admin',
    status: 'active',
    last_access: '2025-05-17T08:02:00',
    joined_at: '2024-02-20',
    avatar_initials: 'CT',
  },
  {
    id: 'ut_03',
    user_id: 'usr_003',
    name: 'Bruno Melo',
    email: 'bruno@experienceconnect.com.br',
    role: 'operator',
    status: 'active',
    last_access: '2025-05-16T18:45:00',
    joined_at: '2024-03-05',
    avatar_initials: 'BM',
  },
  {
    id: 'ut_04',
    user_id: 'usr_004',
    name: 'Larissa Fonseca',
    email: 'larissa@experienceconnect.com.br',
    role: 'operator',
    status: 'active',
    last_access: '2025-05-15T11:30:00',
    joined_at: '2024-04-18',
    avatar_initials: 'LF',
  },
  {
    id: 'ut_05',
    user_id: 'usr_005',
    name: 'Diego Souza',
    email: 'diego.souza@gmail.com',
    role: 'operator',
    status: 'pending',
    last_access: '',
    joined_at: '2025-05-10',
    avatar_initials: 'DS',
  },
  {
    id: 'ut_06',
    user_id: 'usr_006',
    name: 'Tatiane Ribeiro',
    email: 'tatiane@experienceconnect.com.br',
    role: 'admin',
    status: 'inactive',
    last_access: '2025-03-20T09:00:00',
    joined_at: '2024-05-01',
    avatar_initials: 'TR',
  },
];

export const mockNotificationSettings: MockNotificationSetting[] = [
  {
    id: 'notif_01',
    category: 'Operação',
    label: 'Nova reserva criada',
    description: 'Alertas quando uma nova reserva é registrada no sistema',
    email: true,
    push: true,
    whatsapp: false,
  },
  {
    id: 'notif_02',
    category: 'Operação',
    label: 'Reserva cancelada',
    description: 'Notificação imediata ao cancelar uma reserva',
    email: true,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_03',
    category: 'Operação',
    label: 'Transfer iniciado',
    description: 'Confirmação quando o motorista inicia o serviço',
    email: false,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_04',
    category: 'Operação',
    label: 'Transfer concluído',
    description: 'Relatório ao finalizar cada transfer',
    email: true,
    push: false,
    whatsapp: false,
  },
  {
    id: 'notif_05',
    category: 'Financeiro',
    label: 'Pagamento confirmado',
    description: 'Alerta quando um pagamento é processado com sucesso',
    email: true,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_06',
    category: 'Financeiro',
    label: 'Pagamento atrasado',
    description: 'Lembretes automáticos para pagamentos vencidos',
    email: true,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_07',
    category: 'Financeiro',
    label: 'Reembolso processado',
    description: 'Confirmação de estornos e devoluções',
    email: true,
    push: false,
    whatsapp: false,
  },
  {
    id: 'notif_08',
    category: 'Motoristas',
    label: 'Motorista atribuído',
    description: 'Quando um motorista é designado para um transfer',
    email: false,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_09',
    category: 'Motoristas',
    label: 'Atraso detectado',
    description: 'Alertas quando o atraso supera o limite configurado',
    email: true,
    push: true,
    whatsapp: true,
  },
  {
    id: 'notif_10',
    category: 'Check-in',
    label: 'Check-in confirmado',
    description: 'Notificação ao confirmar presença do passageiro',
    email: false,
    push: true,
    whatsapp: false,
  },
  {
    id: 'notif_11',
    category: 'Check-in',
    label: 'Check-in pendente',
    description: 'Lembretes para check-ins não realizados próximos ao embarque',
    email: true,
    push: true,
    whatsapp: true,
  },
];

export const mockIntegrations: MockIntegration[] = [
  {
    id: 'int_01',
    name: 'Supabase',
    description: 'Banco de dados, autenticação e funções serverless',
    icon: 'ri-database-2-line',
    status: 'connected',
    last_sync: '2025-05-17T09:14:00',
    category: 'database',
    config_hint: 'Conectado ao projeto experience-connect-prod',
  },
  {
    id: 'int_02',
    name: 'Mercado Pago',
    description: 'Gateway de pagamento para Pix, cartão e link de pagamento',
    icon: 'ri-bank-card-2-line',
    status: 'connected',
    last_sync: '2025-05-17T08:45:00',
    category: 'payment',
    config_hint: 'Conta MP vinculada · Webhooks ativos',
  },
  {
    id: 'int_03',
    name: 'WhatsApp Business',
    description: 'Notificações e confirmações via WhatsApp',
    icon: 'ri-whatsapp-line',
    status: 'disconnected',
    last_sync: null,
    category: 'communication',
    config_hint: 'Configure token de acesso da Meta Business API',
  },
  {
    id: 'int_04',
    name: 'Google Maps',
    description: 'Geocodificação, rotas e mapa operacional',
    icon: 'ri-map-pin-2-line',
    status: 'pending',
    last_sync: null,
    category: 'mapping',
    config_hint: 'Aguardando ativação da Maps API Key',
  },
  {
    id: 'int_05',
    name: 'Provedor de E-mail',
    description: 'Envio transacional de confirmações e alertas',
    icon: 'ri-mail-send-line',
    status: 'error',
    last_sync: '2025-05-14T22:00:00',
    category: 'email',
    config_hint: 'Falha na última sincronização — verifique credenciais SMTP',
  },
];

export const mockPermissions: MockPermissionRow[] = [
  { module: 'Visão Geral', icon: 'ri-dashboard-3-line', owner: true, admin: true, operator: true },
  { module: 'Reservas', icon: 'ri-calendar-check-line', owner: true, admin: true, operator: true },
  { module: 'Transfers', icon: 'ri-car-line', owner: true, admin: true, operator: true },
  { module: 'Agenda', icon: 'ri-calendar-schedule-line', owner: true, admin: true, operator: true },
  { module: 'Rotas', icon: 'ri-route-line', owner: true, admin: true, operator: false },
  { module: 'Check-ins', icon: 'ri-check-double-line', owner: true, admin: true, operator: true },
  { module: 'Motoristas', icon: 'ri-steering-2-line', owner: true, admin: true, operator: false },
  { module: 'Veículos', icon: 'ri-taxi-line', owner: true, admin: true, operator: false },
  { module: 'Pagamentos', icon: 'ri-secure-payment-line', owner: true, admin: true, operator: false },
  { module: 'Clientes', icon: 'ri-contacts-book-2-line', owner: true, admin: true, operator: false },
  { module: 'Relatórios', icon: 'ri-bar-chart-2-line', owner: true, admin: true, operator: false },
  { module: 'Configurações', icon: 'ri-settings-3-line', owner: true, admin: false, operator: false },
];

export const mockSecuritySessions: MockSecuritySession[] = [
  {
    id: 'sess_01',
    device: 'Chrome · macOS Sequoia',
    location: 'São Paulo, SP',
    ip: '187.20.xx.xx',
    last_active: '2025-05-17T09:14:00',
    is_current: true,
  },
  {
    id: 'sess_02',
    device: 'Safari · iPhone 15 Pro',
    location: 'São Paulo, SP',
    ip: '187.20.xx.xx',
    last_active: '2025-05-16T19:30:00',
    is_current: false,
  },
  {
    id: 'sess_03',
    device: 'Chrome · Windows 11',
    location: 'Campinas, SP',
    ip: '200.148.xx.xx',
    last_active: '2025-05-12T14:20:00',
    is_current: false,
  },
];