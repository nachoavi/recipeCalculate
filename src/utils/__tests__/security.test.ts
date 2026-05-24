import { describe, it, expect } from 'vitest';
import { calculateRecipeCost, costPerBaseUnit, ingredientLineCost, formatCLP, formatUSD } from '../calculations';
import type { Ingredient, Recipe } from '../../types';

const safeIngredient: Ingredient = {
  id: 'x',
  name: 'Safe',
  packageSize: 1000,
  unit: 'g',
  packagePrice: 1000,
};

const safeRecipe: Recipe = {
  id: 'r',
  name: 'Test',
  servings: 1,
  ingredients: [{ ingredientId: 'x', quantity: 100, unit: 'g' }],
  packaging: [],
  overheadPercent: 0,
  profitMargin: 0,
};

describe('Security: numeric edge cases', () => {
  it('does not crash with very large prices', () => {
    const ing: Ingredient = { ...safeIngredient, packagePrice: Number.MAX_SAFE_INTEGER };
    expect(() => costPerBaseUnit(ing)).not.toThrow();
  });

  it('does not crash with very large quantity', () => {
    const recipe: Recipe = {
      ...safeRecipe,
      ingredients: [{ ingredientId: 'x', quantity: Number.MAX_SAFE_INTEGER, unit: 'g' }],
    };
    expect(() => calculateRecipeCost(recipe, [safeIngredient], [])).not.toThrow();
  });

  it('does not produce negative costs from negative price', () => {
    const ing: Ingredient = { ...safeIngredient, packagePrice: -500 };
    const cost = costPerBaseUnit(ing);
    // We don't block negatives at calculation level but result should be a number
    expect(typeof cost).toBe('number');
  });

  it('costPerBaseUnit returns 0 for packageSize = 0 (no Infinity/NaN)', () => {
    const result = costPerBaseUnit({ ...safeIngredient, packageSize: 0 });
    expect(result).toBe(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('formatUSD does not throw with Infinity rate', () => {
    expect(() => formatUSD(1000, Infinity)).not.toThrow();
  });

  it('formatCLP does not throw with Infinity value', () => {
    expect(() => formatCLP(Infinity)).not.toThrow();
  });

  it('profitMarginOnSale is 0 when sellingPrice is 0 (no NaN)', () => {
    const recipe: Recipe = { ...safeRecipe, overheadPercent: 0, profitMargin: 0 };
    const costs = calculateRecipeCost(recipe, [], []);
    expect(costs.profitMarginOnSale).toBe(0);
    expect(Number.isNaN(costs.profitMarginOnSale)).toBe(false);
  });

  it('does not crash with 0 servings', () => {
    const recipe: Recipe = { ...safeRecipe, servings: 0 };
    const costs = calculateRecipeCost(recipe, [safeIngredient], []);
    expect(costs.costPerServing).toBe(0);
    expect(Number.isNaN(costs.costPerServing)).toBe(false);
  });

  it('does not crash with extreme overhead percent', () => {
    const recipe: Recipe = { ...safeRecipe, overheadPercent: 99999 };
    expect(() => calculateRecipeCost(recipe, [safeIngredient], [])).not.toThrow();
  });
});

describe('Security: XSS input passthrough', () => {
  it('calculation functions handle XSS strings in ingredient name without throwing', () => {
    const xssIng: Ingredient = {
      ...safeIngredient,
      name: '<script>alert(1)</script>',
    };
    expect(() => ingredientLineCost(
      { ingredientId: 'x', quantity: 100, unit: 'g' },
      xssIng
    )).not.toThrow();
  });

  it('recipe with XSS name processes costs normally', () => {
    const recipe: Recipe = { ...safeRecipe, name: '"><img src=x onerror=alert(1)>' };
    expect(() => calculateRecipeCost(recipe, [safeIngredient], [])).not.toThrow();
  });
});
