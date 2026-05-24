import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Packaging } from '../types';

function generateId(): string {
  return `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function usePackaging() {
  const [raw, setPackaging] = useLocalStorage<Packaging[]>('rc_packaging', []);
  const packaging: Packaging[] = Array.isArray(raw) ? raw : [];

  const addPackaging = useCallback(
    (data: Omit<Packaging, 'id'>) => {
      setPackaging((prev) => [...prev, { ...data, id: generateId() }]);
    },
    [setPackaging]
  );

  const removePackaging = useCallback(
    (id: string) => {
      setPackaging((prev) => prev.filter((p) => p.id !== id));
    },
    [setPackaging]
  );

  return { packaging, addPackaging, removePackaging };
}
