import { Trash2 } from 'lucide-react';
import type { Ingredient } from '../../types';
import { costPerBaseUnit, formatCLP, formatUSD } from '../../utils/calculations';

interface IngredientCardProps {
  ingredient: Ingredient;
  rate: number;
  onRemove: (id: string) => void;
}

export function IngredientCard({ ingredient, rate, onRemove }: IngredientCardProps) {
  const unitCost = costPerBaseUnit(ingredient);
  const baseUnitName = ingredient.unit === 'kg' || ingredient.unit === 'g' ? 'g' : ingredient.unit === 'L' || ingredient.unit === 'ml' ? 'ml' : 'u';

  return (
    <div className="card flex items-center gap-3 px-4 py-3 transition-shadow hover:shadow-card-hover">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal-800 truncate">{ingredient.name}</p>
        <p className="text-xs text-charcoal-700/50 mt-0.5">
          {ingredient.packageSize} {ingredient.unit} ·{' '}
          <span className="text-money">{formatCLP(ingredient.packagePrice)}</span> por paquete
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-medium text-money text-charcoal-800">
          {formatCLP(unitCost)}
          <span className="text-xs text-charcoal-700/50 font-normal">/{baseUnitName}</span>
        </p>
        <p className="text-xs text-charcoal-700/40 text-money">
          {formatUSD(unitCost, rate)}/{baseUnitName}
        </p>
      </div>
      <button
        onClick={() => onRemove(ingredient.id)}
        className="btn-danger shrink-0"
        title="Eliminar ingrediente"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
