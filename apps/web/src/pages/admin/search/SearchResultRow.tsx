import type { SearchResult } from '@/hooks/useGlobalSearch';

const STATUS_LABELS: Record<string, string> = {
  confirmed:      'Confirmado',
  in_progress:    'Em andamento',
  completed:      'Concluído',
  cancelled:      'Cancelado',
  pending:        'Pendente',
  rescheduled:    'Reagendado',
  scheduled:      'Agendado',
  driver_assigned:'Mot. alocado',
  delayed:        'Atrasado',
  available:      'Disponível',
  on_trip:        'Em viagem',
  paused:         'Pausado',
  unavailable:    'Indisponível',
  maintenance:    'Manutenção',
  in_operation:   'Em operação',
  reserved:       'Reservado',
  attention:      'Atenção',
  active:         'Ativo',
  inactive:       'Inativo',
  high_demand:    'Alta demanda',
  draft:          'Rascunho',
  vip:            'VIP',
  paid:           'Pago',
  overdue:        'Vencido',
  partial:        'Parcial',
  refunded:       'Reembolsado',
  pending_review: 'Em revisão',
};

interface SearchResultRowProps {
  result: SearchResult;
  isActive: boolean;
  onSelect: (result: SearchResult) => void;
  onMouseEnter: () => void;
}

export default function SearchResultRow({ result, isActive, onSelect, onMouseEnter }: SearchResultRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors rounded-lg cursor-pointer ${
        isActive
          ? 'bg-navy-50 border border-navy-100'
          : 'hover:bg-stone-50 border border-transparent'
      }`}
    >
      {/* Entity icon */}
      <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
        isActive ? 'bg-navy-100' : 'bg-stone-100'
      }`}>
        <i className={`${result.icon} text-navy-500 text-sm`}></i>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-navy-800 text-xs font-medium truncate">{result.title}</span>
          {result.status && (
            <span className={`text-[10px] font-medium ${result.statusColor} whitespace-nowrap`}>
              {STATUS_LABELS[result.status] ?? result.status}
            </span>
          )}
        </div>
        <p className="text-navy-400 text-[11px] truncate mt-0.5">{result.subtitle}</p>
      </div>

      {/* Meta right */}
      {result.meta && (
        <span className="text-navy-500 text-[11px] font-medium whitespace-nowrap flex-shrink-0">
          {result.meta}
        </span>
      )}

      {/* Arrow on active */}
      <div className={`w-4 h-4 flex items-center justify-center flex-shrink-0 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <i className="ri-corner-down-left-line text-navy-400 text-xs"></i>
      </div>
    </button>
  );
}