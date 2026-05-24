import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchDolarRate } from '../exchangeRate';

function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchDolarRate', () => {
  it('returns the first serie valor on valid response', async () => {
    mockFetch({ serie: [{ fecha: '2025-05-24T00:00:00.000Z', valor: 975.5 }] });
    const rate = await fetchDolarRate();
    expect(rate).toBe(975.5);
  });

  it('throws on HTTP error status', async () => {
    mockFetch({}, 500);
    await expect(fetchDolarRate()).rejects.toThrow('HTTP 500');
  });

  it('throws when serie is empty', async () => {
    mockFetch({ serie: [] });
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when valor is 0', async () => {
    mockFetch({ serie: [{ fecha: '2025-05-24', valor: 0 }] });
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when valor is negative', async () => {
    mockFetch({ serie: [{ fecha: '2025-05-24', valor: -100 }] });
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when valor is a string instead of number', async () => {
    mockFetch({ serie: [{ fecha: '2025-05-24', valor: '975' }] });
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when serie is missing entirely', async () => {
    mockFetch({ codigo: 'dolar' });
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when response is an empty object', async () => {
    mockFetch({});
    await expect(fetchDolarRate()).rejects.toThrow('Invalid rate');
  });

  it('throws when fetch itself rejects (network error)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    await expect(fetchDolarRate()).rejects.toThrow('Network error');
  });
});
