import { Package } from 'lucide-react';
import type { Ingredient } from '../../types';
import { IngredientForm } from './IngredientForm';
import { IngredientCard } from './IngredientCard';

interface IngredientsTabProps {
  ingredients: Ingredient[];
  rate: number;
  onAdd: (data: Omit<Ingredient, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function IngredientsTab({ ingredients, rate, onAdd, onRemove }: IngredientsTabProps) {
  return (
    <div className="space-y-6">
      <IngredientForm onAdd={onAdd} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Tus ingredientes</h2>
          {ingredients.length > 0 && (
            <span className="text-xs text-charcoal-700/40">
              {ingredients.length} {ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
            </span>
          )}
        </div>

        {ingredients.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Package size={32} className="text-charcoal-700/20" />
            <p className="text-sm text-charcoal-700/40">
              Agregá ingredientes para empezar a calcular
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                rate={rate}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
