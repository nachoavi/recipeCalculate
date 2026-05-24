import { describe, it, expect } from 'vitest';
import {
  calculateRecipeCost,
  costPerBaseUnit,
  ingredientLineCost,
  formatCLP,
  formatUSD,
  compatibleUnits,
} from '../calculations';
import type { Ingredient, Packaging, Recipe } from '../../types';

const flour: Ingredient = {
  id: 'ing_flour',
  name: 'Harina 000',
  packageSize: 1000,
  unit: 'g',
  packagePrice: 1200,
};

const butter: Ingredient = {
  id: 'ing_butter',
  name: 'Mantequilla',
  packageSize: 250,
  unit: 'g',
  packagePrice: 2500,
};

const box: Packaging = {
  id: 'pkg_box',
  name: 'Caja kraft',
  pricePerUnit: 350,
};

const baseRecipe: Recipe = {
  id: 'rec_1',
  name: 'Bizcochuelo',
  servings: 10,
  ingredients: [
    { ingredientId: 'ing_flour', quantity: 200, unit: 'g' },
    { ingredientId: 'ing_butter', quantity: 50, unit: 'g' },
  ],
  packaging: [],
  overheadPercent: 0,
  profitMargin: 0,
};

describe('costPerBaseUnit', () => {
  it('returns price per gram for a g-unit ingredient', () => {
    expect(costPerBaseUnit(flour)).toBe(1.2);
  });

  it('converts kg package correctly', () => {
    const kgFlour: Ingredient = { ...flour, packageSize: 1, unit: 'kg' };
    expect(costPerBaseUnit(kgFlour)).toBe(1.2);
  });

  it('returns 0 when packageSize is 0 (no division by zero)', () => {
    expect(costPerBaseUnit({ ...flour, packageSize: 0 })).toBe(0);
  });
});

describe('ingredientLineCost', () => {
  it('calculates cost for grams used', () => {
    expect(ingredientLineCost({ ingredientId: 'x', quantity: 100, unit: 'g' }, flour)).toBe(120);
  });

  it('handles kg quantity against g package', () => {
    const cost = ingredientLineCost({ ingredientId: 'x', quantity: 0.5, unit: 'kg' }, flour);
    expect(cost).toBe(600);
  });

  it('returns 0 for zero quantity', () => {
    expect(ingredientLineCost({ ingredientId: 'x', quantity: 0, unit: 'g' }, flour)).toBe(0);
  });
});

describe('calculateRecipeCost', () => {
  it('computes ingredientCost correctly', () => {
    const costs = calculateRecipeCost(baseRecipe, [flour, butter], []);
    // flour: 200g * 1.2 = 240, butter: 50g * 10 = 500
    expect(costs.ingredientCost).toBe(740);
  });

  it('packagingCost is 0 when no packaging assigned', () => {
    const costs = calculateRecipeCost(baseRecipe, [flour, butter], [box]);
    expect(costs.packagingCost).toBe(0);
  });

  it('adds packaging cost when packaging is assigned', () => {
    const recipe: Recipe = { ...baseRecipe, packaging: [{ packagingId: 'pkg_box', quantity: 2 }] };
    const costs = calculateRecipeCost(recipe, [flour, butter], [box]);
    expect(costs.packagingCost).toBe(700);
    expect(costs.totalCost).toBe(1440);
  });

  it('applies overhead to total cost', () => {
    const recipe: Recipe = { ...baseRecipe, overheadPercent: 10 };
    const costs = calculateRecipeCost(recipe, [flour, butter], []);
    expect(costs.withOverhead).toBeCloseTo(740 * 1.1);
  });

  it('applies profit margin on top of withOverhead', () => {
    const recipe: Recipe = { ...baseRecipe, overheadPercent: 10, profitMargin: 30 };
    const costs = calculateRecipeCost(recipe, [flour, butter], []);
    const expected = 740 * 1.1 * 1.3;
    expect(costs.sellingPrice).toBeCloseTo(expected);
  });

  it('profit = sellingPrice - withOverhead', () => {
    const recipe: Recipe = { ...baseRecipe, overheadPercent: 10, profitMargin: 30 };
    const costs = calculateRecipeCost(recipe, [flour, butter], []);
    expect(costs.profit).toBeCloseTo(costs.sellingPrice - costs.withOverhead);
  });

  it('profitMarginOnSale is correct percentage', () => {
    const recipe: Recipe = { ...baseRecipe, profitMargin: 30 };
    const costs = calculateRecipeCost(recipe, [flour, butter], []);
    // margin 30% on cost means ~23% of selling price
    expect(costs.profitMarginOnSale).toBeCloseTo((costs.profit / costs.sellingPrice) * 100);
  });

  it('costPerServing divides by serving count', () => {
    const costs = calculateRecipeCost(baseRecipe, [flour, butter], []);
    expect(costs.costPerServing).toBeCloseTo(74);
  });

  it('returns 0 costs when ingredient is missing (deleted after recipe created)', () => {
    const costs = calculateRecipeCost(baseRecipe, [], []);
    expect(costs.ingredientCost).toBe(0);
    expect(costs.totalCost).toBe(0);
  });

  it('handles missing packaging gracefully', () => {
    const recipe: Recipe = { ...baseRecipe, packaging: [{ packagingId: 'nonexistent', quantity: 1 }] };
    const costs = calculateRecipeCost(recipe, [flour, butter], []);
    expect(costs.packagingCost).toBe(0);
  });

  it('handles recipe with undefined packaging (backward compat)', () => {
    const legacy = { ...baseRecipe, packaging: undefined as unknown as [] };
    expect(() => calculateRecipeCost(legacy, [flour, butter], [])).not.toThrow();
  });
});

describe('formatCLP', () => {
  it('formats integer with CLP currency', () => {
    expect(formatCLP(1200)).toContain('1.200');
  });

  it('rounds decimal values', () => {
    expect(formatCLP(1200.9)).toContain('1.201');
  });

  it('handles zero', () => {
    expect(formatCLP(0)).toContain('0');
  });
});

describe('formatUSD', () => {
  it('converts CLP to USD correctly', () => {
    expect(formatUSD(950, 950)).toContain('1.00');
  });

  it('returns dash for zero rate', () => {
    expect(formatUSD(1000, 0)).toBe('—');
  });

  it('returns dash for negative rate', () => {
    expect(formatUSD(1000, -1)).toBe('—');
  });
});

describe('compatibleUnits', () => {
  it('kg and g are compatible', () => {
    expect(compatibleUnits('kg')).toEqual(['kg', 'g']);
    expect(compatibleUnits('g')).toEqual(['kg', 'g']);
  });

  it('L and ml are compatible', () => {
    expect(compatibleUnits('L')).toEqual(['L', 'ml']);
    expect(compatibleUnits('ml')).toEqual(['L', 'ml']);
  });

  it('units only returns u', () => {
    expect(compatibleUnits('u')).toEqual(['u']);
  });
});
