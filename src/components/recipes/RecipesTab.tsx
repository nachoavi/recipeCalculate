import { ChefHat } from 'lucide-react';
import type { Ingredient, Packaging, Recipe } from '../../types';
import { RecipeForm } from './RecipeForm';
import { RecipeCard } from './RecipeCard';

interface RecipesTabProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  packaging: Packaging[];
  rate: number;
  onAdd: (data: Omit<Recipe, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function RecipesTab({ recipes, ingredients, packaging, rate, onAdd, onRemove }: RecipesTabProps) {
  return (
    <div className="space-y-6">
      <RecipeForm ingredients={ingredients} packaging={packaging} onAdd={onAdd} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Tus recetas</h2>
          {recipes.length > 0 && (
            <span className="text-xs text-charcoal-700/40">
              {recipes.length} {recipes.length === 1 ? 'receta' : 'recetas'}
            </span>
          )}
        </div>

        {recipes.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
            <ChefHat size={32} className="text-charcoal-700/20" />
            <p className="text-sm text-charcoal-700/40">
              Guardá tu primera receta para ver el análisis de costos
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recipes.map((rec) => (
              <RecipeCard
                key={rec.id}
                recipe={rec}
                ingredients={ingredients}
                packaging={packaging}
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
