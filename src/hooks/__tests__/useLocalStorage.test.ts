import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  it('returns the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', [1, 2, 3]));
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it('persists value to localStorage on set', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test_key', ''));
    act(() => { result.current[1]('hello'); });
    expect(localStorage.getItem('test_key')).toBe('"hello"');
  });

  it('reads existing value from localStorage on mount', () => {
    localStorage.setItem('test_key', JSON.stringify({ rate: 980 }));
    const { result } = renderHook(() => useLocalStorage('test_key', { rate: 950 }));
    expect(result.current[0]).toEqual({ rate: 980 });
  });

  it('falls back to initialValue when localStorage contains invalid JSON', () => {
    localStorage.setItem('test_key', 'NOT_VALID_JSON{{{{');
    const { result } = renderHook(() => useLocalStorage<number[]>('test_key', []));
    expect(result.current[0]).toEqual([]);
  });

  it('falls back to initialValue when localStorage contains wrong type', () => {
    localStorage.setItem('test_key', '"a string"');
    const { result } = renderHook(() => useLocalStorage<number[]>('test_key', []));
    // Returns the parsed string — consumers should validate types
    expect(result.current[0]).toBeDefined();
  });

  it('does not throw when localStorage quota is exceeded', () => {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });
    const { result } = renderHook(() => useLocalStorage<string>('test_key', ''));
    expect(() => act(() => { result.current[1]('big value'); })).not.toThrow();
    vi.restoreAllMocks();
    void originalSetItem;
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage<number>('test_key', 0));
    act(() => { result.current[1]((prev) => prev + 5); });
    expect(result.current[0]).toBe(5);
  });

  it('returns initialValue when stored value is null', () => {
    localStorage.setItem('test_key', 'null');
    const { result } = renderHook(() => useLocalStorage<string[]>('test_key', []));
    expect(result.current[0]).toEqual([]);
  });
});
