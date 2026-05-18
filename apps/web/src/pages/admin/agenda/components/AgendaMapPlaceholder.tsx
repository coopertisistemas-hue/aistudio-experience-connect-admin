import type { AgendaItem } from '@/mocks/admin-agenda';

interface AgendaMapPlaceholderProps {
  items: AgendaItem[];
  onClose: () => void;
}

// Fixed "positions" for mock route visualization
const routeNodes = [
  { id: 'sdu', label: 'SDU', left: '18%', top: '38%', type: 'airport' },
  { id: 'gig', label: 'GIG', left: '72%', top: '15%', type: 'airport' },
  { id: 'ipanema', label: 'Ipanema', left: '28%', top: '62%', type: 'hotel' },
  { id: 'barra', label: 'Barra', left: '8%', top: '55%', type: 'hotel' },
  { id: 'leblon', label: 'Leblon', left: '22%', top: '70%', type: 'hotel' },
  { id: 'copacabana', label: 'Copa', left: '35%', top: '72%', type: 'hotel' },
  { id: 'centro', label: 'Centro', left: '50%', top: '55%', type: 'business' },
  { id: 'buzios', label: 'Búzios', left: '88%', top: '35%', type: 'destination' },
  { id: 'paraty', label: 'Paraty', left: '78%', top: '82%', type: 'destination' },
];

const activeTransfers = [
  { from: { left: '72%', top: '15%' }, to: { left: '22%', top: '70%' }, color: '#18A79B', driver: 'Carlos Mendes', status: 'in_progress' },
  { from: { left: '28%', top: '62%' }, to: { left: '72%', top: '15%' }, color: '#2A52A0', driver: 'João Silva', status: 'driver_assigned' },
  { from: { left: '72%', top: '15%' }, to: { left: '8%', top: '55%' }, color: '#D4A84B', driver: 'Pedro Rocha', status: 'delayed' },
];

export default function AgendaMapPlaceholder({ items, onClose }: AgendaMapPlaceholderProps) {
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const active = items.filter((i) => ['in_progress', 'driver_assigned'].includes(i.status)).length;

  return (
    <div className="bg-white border border-sand-200 rounded-2xl overflow-hidden mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-sand-200 bg-sand-50/60">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-navy-950">
            <i className="ri-map-2-line text-white text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-800">Mapa Operacional em Tempo Real</p>
            <p className="text-[11px] text-navy-400">Visualização de transfers ativos na operação</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-navy-500">{inProgress} em trânsito</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-navy-500"></span>
              <span className="text-navy-500">{active} ativos</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-400 hover:bg-sand-200 hover:text-navy-700 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>
      </div>

      {/* Map visualization */}
      <div className="relative bg-stone-50 overflow-hidden" style={{ height: 320 }}>
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(42,82,160,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(42,82,160,0.08) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Background "coastline" hint */}
        <div className="absolute inset-0">
          <img
            src="https://readdy.ai/api/search-image?query=clean%20minimal%20aerial%20map%20view%20Rio%20de%20Janeiro%20coastline%20Ipanema%20Copacabana%20Barra%20Maracan%C3%A3%20with%20soft%20muted%20colors%20very%20light%20pastel%20blue%20ocean%20and%20beige%20land%20no%20labels%20just%20geography%20abstract%20cartographic%20illustration&width=1200&height=320&seq=agenda-map-bg&orientation=landscape"
            alt="Mapa operacional"
            className="w-full h-full object-cover object-top opacity-30"
          />
        </div>

        {/* SVG route lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 320" preserveAspectRatio="none">
          {activeTransfers.map((t, i) => {
            const fx = parseFloat(t.from.left) * 10;
            const fy = parseFloat(t.from.top) * 3.2;
            const tx = parseFloat(t.to.left) * 10;
            const ty = parseFloat(t.to.top) * 3.2;
            const mx = (fx + tx) / 2;
            const my = Math.min(fy, ty) - 40;
            return (
              <path
                key={i}
                d={`M ${fx} ${fy} Q ${mx} ${my} ${tx} ${ty}`}
                stroke={t.color}
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Route nodes */}
        {routeNodes.map((node) => (
          <div
            key={node.id}
            className="absolute flex flex-col items-center"
            style={{ left: node.left, top: node.top, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm ${
              node.type === 'airport' ? 'bg-navy-700' :
              node.type === 'destination' ? 'bg-teal-600' :
              node.type === 'business' ? 'bg-stone-500' :
              'bg-stone-300'
            }`}>
              <i className={`text-white text-[9px] ${
                node.type === 'airport' ? 'ri-flight-takeoff-line' :
                node.type === 'destination' ? 'ri-map-pin-line' :
                node.type === 'business' ? 'ri-building-2-line' :
                'ri-hotel-line'
              }`}></i>
            </div>
            <span className="mt-0.5 text-[9px] font-semibold text-navy-700 bg-white/80 px-1 rounded whitespace-nowrap">
              {node.label}
            </span>
          </div>
        ))}

        {/* Moving vehicle indicators */}
        {activeTransfers.map((t, i) => {
          const cx = (parseFloat(t.from.left) + parseFloat(t.to.left)) / 2;
          const cy = (parseFloat(t.from.top) + parseFloat(t.to.top)) / 2;
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-full border-2 border-white shadow-md
                ${t.status === 'in_progress' ? 'bg-teal-500' : t.status === 'delayed' ? 'bg-amber-500' : 'bg-navy-600'}`}
              >
                <i className="ri-car-line text-white text-[10px]"></i>
              </div>
              <p className="mt-0.5 text-[8px] font-semibold text-navy-700 bg-white/90 px-1 rounded whitespace-nowrap text-center shadow-sm">
                {t.driver.split(' ')[0]}
              </p>
            </div>
          );
        })}

        {/* Live badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white border border-sand-200 rounded-lg px-2.5 py-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          <span className="text-[10px] font-semibold text-navy-700">LIVE</span>
        </div>

        {/* Placeholder badge */}
        <div className="absolute bottom-3 right-3 bg-navy-950/70 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <p className="text-[9px] text-white/70 font-medium">Integração GPS em desenvolvimento</p>
        </div>
      </div>

      {/* Active transfers list */}
      <div className="px-5 py-3 border-t border-sand-100 flex gap-4 overflow-x-auto scrollbar-none">
        {items.filter((i) => ['in_progress', 'driver_assigned', 'delayed'].includes(i.status)).map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 bg-sand-50 border border-sand-200 rounded-xl px-3 py-2 flex-shrink-0">
            <div className={`w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0 ${
              item.status === 'in_progress' ? 'bg-teal-100' :
              item.status === 'delayed' ? 'bg-amber-100' :
              'bg-navy-100'
            }`}>
              <i className={`text-xs ${
                item.status === 'in_progress' ? 'ri-car-line text-teal-600' :
                item.status === 'delayed' ? 'ri-alarm-warning-line text-amber-600' :
                'ri-steering-2-line text-navy-600'
              }`}></i>
            </div>
            <div>
              <p className="text-[10px] font-bold text-navy-800">{item.reference}</p>
              <p className="text-[9px] text-navy-400">{item.driver?.name ?? 'Sem motorista'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}