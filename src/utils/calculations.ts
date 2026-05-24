import type { Ingredient, Packaging, Recipe, RecipeIngredient, Unit, CostBreakdown } from '../types';

const UNIT_TO_BASE: Record<Unit, number> = {
  kg: 1000,
  g: 1,
  L: 1000,
  ml: 1,
  u: 1,
};

function toBaseUnit(value: number, unit: Unit): number {
  return value * UNIT_TO_BASE[unit];
}

export function costPerBaseUnit(ingredient: Ingredient): number {
  const baseUnits = toBaseUnit(ingredient.packageSize, ingredient.unit);
  if (baseUnits === 0) return 0;
  return ingredient.packagePrice / baseUnits;
}

export function ingredientLineCost(item: RecipeIngredient, ingredient: Ingredient): number {
  const usedBaseUnits = toBaseUnit(item.quantity, item.unit);
  return usedBaseUnits * costPerBaseUnit(ingredient);
}

export function calculateRecipeCost(
  recipe: Recipe,
  ingredients: Ingredient[],
  packagingItems: Packaging[]
): CostBreakdown {
  const byIngId = new Map(ingredients.map((i) => [i.id, i]));
  const byPkgId = new Map(packagingItems.map((p) => [p.id, p]));

  const ingredientCost = recipe.ingredients.reduce((sum, item) => {
    const ing = byIngId.get(item.ingredientId);
    if (!ing) return sum;
    return sum + ingredientLineCost(item, ing);
  }, 0);

  const packagingCost = (recipe.packaging ?? []).reduce((sum, item) => {
    const pkg = byPkgId.get(item.packagingId);
    if (!pkg) return sum;
    return sum + pkg.pricePerUnit * item.quantity;
  }, 0);

  const totalCost = ingredientCost + packagingCost;
  const withOverhead = totalCost * (1 + recipe.overheadPercent / 100);
  const sellingPrice = withOverhead * (1 + recipe.profitMargin / 100);
  const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
  const sellingPricePerServing = recipe.servings > 0 ? sellingPrice / recipe.servings : 0;
  const profit = sellingPrice - withOverhead;
  const profitPerServing = recipe.servings > 0 ? profit / recipe.servings : 0;
  const profitMarginOnSale = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return {
    ingredientCost,
    packagingCost,
    totalCost,
    withOverhead,
    sellingPrice,
    costPerServing,
    sellingPricePerServing,
    profit,
    profitPerServing,
    profitMarginOnSale,
  };
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatUSD(value: number, rate: number): string {
  if (rate <= 0) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / rate);
}

export function unitLabel(unit: Unit): string {
  const labels: Record<Unit, string> = {
    kg: 'kg', g: 'g', L: 'L', ml: 'ml', u: 'u',
  };
  return labels[unit];
}

export function compatibleUnits(unit: Unit): Unit[] {
  if (unit === 'kg' || unit === 'g') return ['kg', 'g'];
  if (unit === 'L' || unit === 'ml') return ['L', 'ml'];
  return ['u'];
}
