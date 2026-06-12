import type { RouteFilters } from '@/services/routes';

interface FilterBarProps {
  filters: RouteFilters;
  onChange: (filters: RouteFilters) => void;
}

const categories = [
  { slug: '', label: 'Todas' },
  { slug: 'transfer', label: 'Transfers' },
  { slug: 'tour', label: 'Passeios' },
  { slug: 'experience', label: 'Experiências' },
];

const priceRanges = [
  { label: 'Qualquer preço', min: undefined, max: undefined },
  { label: 'Até R$ 200', min: undefined, max: 200 },
  { label: 'R$ 200 - R$ 500', min: 200, max: 500 },
  { label: 'Acima de R$ 500', min: 500, max: undefined },
];

const durationOptions = [
  { label: 'Qualquer duração', value: undefined },
  { label: 'Até 1h', value: 60 },
  { label: 'Até 2h', value: 120 },
  { label: 'Até 4h', value: 240 },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onChange({ ...filters, category_slug: cat.slug || undefined })}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              (filters.category_slug || '') === cat.slug
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {priceRanges.map((range) => (
          <button
            key={range.label}
            onClick={() =>
              onChange({
                ...filters,
                min_price: range.min,
                max_price: range.max,
              })
            }
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              filters.min_price === range.min && filters.max_price === range.max
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
            }`}
          >
            {range.label}
          </button>
        ))}

        <select
          value={filters.max_duration ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              max_duration: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="px-3 py-1.5 text-xs rounded-lg border bg-white/5 border-white/10 text-slate-400 hover:border-white/20 transition-colors"
        >
          {durationOptions.map((opt) => (
            <option key={opt.label} value={opt.value ?? ''}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
