interface MindicadorResponse {
  serie: Array<{ fecha: string; valor: number }>;
}

export async function fetchDolarRate(): Promise<number> {
  const res = await fetch('https://mindicador.cl/api/dolar', {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: MindicadorResponse = await res.json();
  const valor = data.serie?.[0]?.valor;
  if (typeof valor !== 'number' || valor <= 0) throw new Error('Invalid rate');
  return valor;
}
