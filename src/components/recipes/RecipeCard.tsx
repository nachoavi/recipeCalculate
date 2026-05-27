import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import type { Ingredient, Packaging, Recipe } from '../../types';
import {
  calculateRecipeCost,
  formatCLP,
  formatUSD,
  ingredientLineCost,
  unitLabel,
} from '../../utils/calculations';

interface RecipeCardProps {
  recipe: Recipe;
  ingredients: Ingredient[];
  packaging: Packaging[];
  rate: number;
  onRemove: (id: string) => void;
}

export function RecipeCard({ recipe, ingredients, packaging, rate, onRemove }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [includeIVA, setIncludeIVA] = useState(false);
  const byIngId = new Map(ingredients.map((i) => [i.id, i]));
  const byPkgId = new Map(packaging.map((p) => [p.id, p]));
  const costs = calculateRecipeCost(recipe, ingredients, packaging);

  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <div>
            <p className="font-medium text-charcoal-800">{recipe.name}</p>
            <p className="text-xs text-charcoal-700/50 mt-0.5">
              {recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'} ·{' '}
              {recipe.ingredients.length}{' '}
              {recipe.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
              {(recipe.packaging ?? []).length > 0 && ` · ${recipe.packaging.length} ${recipe.packaging.length === 1 ? 'envase' : 'envases'}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-money text-charcoal-800">
                {formatCLP(costs.sellingPrice)}
              </p>
              <p className="text-xs text-charcoal-700/40 text-money">
                {formatUSD(costs.sellingPrice, rate)}
              </p>
            </div>
            {costs.profit > 0 && (
              <div className="hidden sm:flex items-center gap-1 rounded-full bg-forest-500/10 border border-forest-400/20 px-2.5 py-1">
                <TrendingUp size={11} className="text-forest-500" />
                <span className="text-xs font-semibold text-money text-forest-600">
                  +{formatCLP(costs.profit)}
                </span>
              </div>
            )}
            {expanded ? (
              <ChevronUp size={16} className="text-charcoal-700/40 shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-charcoal-700/40 shrink-0" />
            )}
          </div>
        </button>
        <button onClick={() => onRemove(recipe.id)} className="btn-danger shrink-0">
          <Trash2 size={15} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-cream-200 bg-cream-50/60 px-4 py-4 space-y-4">

          {/* Ingredients */}
          <div>
            <p className="label mb-2">Ingredientes</p>
            <div className="space-y-1">
              {recipe.ingredients.map((item, i) => {
                const ing = byIngId.get(item.ingredientId);
                if (!ing) return null;
                const lineCost = ingredientLineCost(item, ing);
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-charcoal-700">
                      {ing.name}{' '}
                      <span className="text-charcoal-700/50">
                        {item.quantity} {unitLabel(item.unit)}
                      </span>
                    </span>
                    <span className="text-money text-charcoal-800">{formatCLP(lineCost)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between text-xs text-charcoal-700/50 border-t border-cream-200 pt-1 mt-1">
                <span>Subtotal ingredientes</span>
                <span className="text-money">{formatCLP(costs.ingredientCost)}</span>
              </div>
            </div>
          </div>

          {/* Packaging */}
          {(recipe.packaging ?? []).length > 0 && (
            <div>
              <p className="label mb-2">Envases</p>
              <div className="space-y-1">
                {recipe.packaging.map((item, i) => {
                  const pkg = byPkgId.get(item.packagingId);
                  if (!pkg) return null;
                  const cost = pkg.pricePerUnit * item.quantity;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-700">
                        {pkg.name}{' '}
                        <span className="text-charcoal-700/50">×{item.quantity}</span>
                      </span>
                      <span className="text-money text-charcoal-800">{formatCLP(cost)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-xs text-charcoal-700/50 border-t border-cream-200 pt-1 mt-1">
                  <span>Subtotal envases</span>
                  <span className="text-money">{formatCLP(costs.packagingCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cost breakdown */}
          <div className="space-y-1.5 border-t border-cream-200 pt-3">
            <CostRow label="Costo total de producción" clp={costs.totalCost} rate={rate} />
            {recipe.overheadPercent > 0 && (
              <CostRow
                label={`Con overhead (${recipe.overheadPercent}%)`}
                clp={costs.withOverhead}
                rate={rate}
              />
            )}
            {recipe.profitMargin > 0 && (
              <>
                <CostRow
                  label={`Precio venta (${recipe.profitMargin}% margen)`}
                  clp={costs.sellingPrice}
                  rate={rate}
                  highlighted={!includeIVA}
                />
                <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
                  <input
                    type="checkbox"
                    checked={includeIVA}
                    onChange={(e) => setIncludeIVA(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-terracotta-500 cursor-pointer"
                  />
                  <span className="text-xs text-charcoal-700/60">Agregar IVA (19%)</span>
                </label>
                {includeIVA && (
                  <>
                    <CostRow
                      label="IVA (19%)"
                      clp={costs.sellingPrice * 0.19}
                      rate={rate}
                    />
                    <CostRow
                      label="Precio venta con IVA"
                      clp={costs.sellingPrice * 1.19}
                      rate={rate}
                      highlighted
                    />
                  </>
                )}
              </>
            )}
          </div>

          {/* Per serving grid */}
          <div className="border-t border-cream-200 pt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white border border-cream-200 px-3 py-2">
              <p className="text-xs text-charcoal-700/50 mb-1">Costo / porción</p>
              <p className="text-sm font-semibold text-money text-charcoal-800">
                {formatCLP(costs.costPerServing)}
              </p>
              <p className="text-xs text-charcoal-700/40 text-money">
                {formatUSD(costs.costPerServing, rate)}
              </p>
            </div>
            <div className="rounded-lg bg-terracotta-500/8 border border-terracotta-400/20 px-3 py-2">
              <p className="text-xs text-charcoal-700/50 mb-1">
                Precio venta / porción{includeIVA ? ' (c/ IVA)' : ''}
              </p>
              <p className="text-sm font-semibold text-money text-terracotta-600">
                {formatCLP((includeIVA ? costs.sellingPricePerServing * 1.19 : costs.sellingPricePerServing))}
              </p>
              <p className="text-xs text-terracotta-500/60 text-money">
                {formatUSD((includeIVA ? costs.sellingPricePerServing * 1.19 : costs.sellingPricePerServing), rate)}
              </p>
            </div>
          </div>

          {/* Profit panel */}
          {costs.profit > 0 && (
            <div className="border-t border-cream-200 pt-3 space-y-3">
              <p className="label mb-0 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-forest-500" />
                Ganancia estimada
              </p>
              <div className="rounded-xl bg-forest-500/8 border border-forest-400/20 px-4 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-charcoal-700/50 mb-0.5">Ganancia total</p>
                    <p className="text-lg font-semibold text-money text-forest-600">
                      +{formatCLP(costs.profit)}
                    </p>
                    <p className="text-xs text-forest-500/70 text-money">
                      +{formatUSD(costs.profit, rate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-700/50 mb-0.5">Ganancia / porción</p>
                    <p className="text-lg font-semibold text-money text-forest-600">
                      +{formatCLP(costs.profitPerServing)}
                    </p>
                    <p className="text-xs text-forest-500/70 text-money">
                      +{formatUSD(costs.profitPerServing, rate)}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-charcoal-700/50">
                      {costs.profitMarginOnSale.toFixed(1)}% del precio de venta es ganancia
                    </span>
                    <span className="text-xs font-semibold text-forest-600">
                      {costs.profitMarginOnSale.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-forest-500/15 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, costs.profitMarginOnSale)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CostRow({
  label, clp, rate, highlighted = false,
}: {
  label: string; clp: number; rate: number; highlighted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between text-sm ${highlighted ? 'font-semibold' : ''}`}>
      <span className={highlighted ? 'text-charcoal-800' : 'text-charcoal-700/70'}>{label}</span>
      <div className="text-right">
        <span className={`text-money ${highlighted ? 'text-terracotta-600' : 'text-charcoal-800'}`}>
          {formatCLP(clp)}
        </span>
        <span className="ml-2 text-xs text-charcoal-700/40 text-money">
          {formatUSD(clp, rate)}
        </span>
      </div>
    </div>
  );
}
