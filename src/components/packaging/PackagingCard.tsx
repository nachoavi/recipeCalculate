import { Trash2 } from 'lucide-react';
import type { Packaging } from '../../types';
import { formatCLP, formatUSD } from '../../utils/calculations';

interface PackagingCardProps {
  item: Packaging;
  rate: number;
  onRemove: (id: string) => void;
}

export function PackagingCard({ item, rate, onRemove }: PackagingCardProps) {
  return (
    <div className="card flex items-center gap-3 px-4 py-3 transition-shadow hover:shadow-card-hover">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal-800 truncate">{item.name}</p>
        <p className="text-xs text-charcoal-700/50 mt-0.5">Por unidad</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-money text-charcoal-800">
          {formatCLP(item.pricePerUnit)}
        </p>
        <p className="text-xs text-charcoal-700/40 text-money">
          {formatUSD(item.pricePerUnit, rate)}
        </p>
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="btn-danger shrink-0"
        title="Eliminar envase"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
