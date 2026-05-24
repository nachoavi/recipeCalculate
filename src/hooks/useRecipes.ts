import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Recipe } from '../types';

function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useRecipes() {
  const [raw, setRecipes] = useLocalStorage<Recipe[]>('rc_recipes', []);
  const recipes: Recipe[] = Array.isArray(raw) ? raw : [];

  const addRecipe = useCallback(
    (data: Omit<Recipe, 'id'>) => {
      setRecipes((prev) => [...prev, { ...data, id: generateId() }]);
    },
    [setRecipes]
  );

  const updateRecipe = useCallback(
    (id: string, data: Partial<Omit<Recipe, 'id'>>) => {
      setRecipes((prev) =>
        prev.map((rec) => (rec.id === id ? { ...rec, ...data } : rec))
      );
    },
    [setRecipes]
  );

  const removeRecipe = useCallback(
    (id: string) => {
      setRecipes((prev) => prev.filter((rec) => rec.id !== id));
    },
    [setRecipes]
  );

  return { recipes, addRecipe, updateRecipe, removeRecipe };
}
