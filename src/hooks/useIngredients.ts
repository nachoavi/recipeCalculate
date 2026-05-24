import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Ingredient } from '../types';

function generateId(): string {
  return `ing_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useIngredients() {
  const [raw, setIngredients] = useLocalStorage<Ingredient[]>('rc_ingredients', []);
  const ingredients: Ingredient[] = Array.isArray(raw) ? raw : [];

  const addIngredient = useCallback(
    (data: Omit<Ingredient, 'id'>) => {
      setIngredients((prev) => [...prev, { ...data, id: generateId() }]);
    },
    [setIngredients]
  );

  const updateIngredient = useCallback(
    (id: string, data: Partial<Omit<Ingredient, 'id'>>) => {
      setIngredients((prev) =>
        prev.map((ing) => (ing.id === id ? { ...ing, ...data } : ing))
      );
    },
    [setIngredients]
  );

  const removeIngredient = useCallback(
    (id: string) => {
      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    },
    [setIngredients]
  );

  return { ingredients, addIngredient, updateIngredient, removeIngredient };
}
