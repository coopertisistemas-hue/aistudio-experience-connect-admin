# Supabase Edge Functions

Diretório para Edge Functions (Deno/TypeScript).

## Estrutura

```
functions/
├── _shared/          → Código compartilhado entre functions
├── bookings/         → Lógica de reservas
├── payments/         → Integração Mercado Pago
├── notifications/    → Email, SMS, push
├── scheduler/        → Otimização de agenda
└── ai/               → Funções de IA/recomendações
```

## Comandos

```bash
# Iniciar functions localmente
supabase functions serve

# Deploy de uma function
supabase functions deploy <nome>

# Novo function
supabase functions new <nome>
```

## Variáveis de ambiente

Configurar no Supabase Dashboard:
- `MERCADO_PAGO_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`

## Segurança

- Todas as functions verificam JWT
- `tenant_id` é extraído do token e validado
- Rate limiting por IP e tenant
