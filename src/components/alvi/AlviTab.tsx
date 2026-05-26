import { useState } from 'react';
import { Search, ShoppingCart, ExternalLink, Check, AlertCircle, RefreshCw } from 'lucide-react';
import type { AlviProduct, Ingredient, Unit } from '../../types';
import { useAlviProducts } from '../../hooks/useAlviProducts';
import { formatCLP } from '../../utils/calculations';

interface AlviTabProps {
  rate: number;
  onAddIngredient: (data: Omit<Ingredient, 'id'>) => void;
}

const UNIT_MAP: Record<string, Unit> = {
  kg: 'kg', kilo: 'kg', kilos: 'kg',
  g: 'g', gr: 'g', gramos: 'g',
  l: 'L', lt: 'L', ltr: 'L', litro: 'L', litros: 'L',
  ml: 'ml', cc: 'ml',
  u: 'u', un: 'u', und: 'u', unid: 'u', unidades: 'u',
};

function parseFormat(format: string): { packageSize: number; unit: Unit } | null {
  if (!format) return null;
  const m = format.trim().match(/^([\d.,]+)\s*(.+)$/);
  if (!m) return null;
  const size = parseFloat(m[1].replace(',', '.'));
  const unit = UNIT_MAP[m[2].trim().toLowerCase()];
  if (!unit || !isFinite(size) || size <= 0) return null;
  return { packageSize: size, unit };
}

function isSafeUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} días`;
}

const MAX_DISPLAY = 80;

export function AlviTab({ rate, onAddIngredient }: AlviTabProps) {
  const { data, loading, error } = useAlviProducts();
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  function handleAdd(product: AlviProduct) {
    const pid = String(product.product_id);
    const parsed = parseFormat(product.format);
    if (!parsed || product.price == null) {
      setFailedId(pid);
      setTimeout(() => setFailedId(null), 3000);
      return;
    }
    const label = product.brand
      ? `${product.name} ${product.brand}`.trim()
      : product.name;
    onAddIngredient({
      name: label,
      packageSize: parsed.packageSize,
      unit: parsed.unit,
      packagePrice: product.price,
    });
    setAddedId(pid);
    setTimeout(() => setAddedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <RefreshCw size={28} className="text-charcoal-700/20 animate-spin" />
        <p className="text-sm text-charcoal-700/40">Cargando precios…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
        <AlertCircle size={28} className="text-amber-400" />
        <p className="text-sm text-charcoal-700/60">No se pudieron cargar los precios de Alvi.</p>
        <p className="text-xs text-charcoal-700/40">
          Los precios se actualizan automáticamente cada 3 días.
        </p>
      </div>
    );
  }

  const hasProducts = data.products.length > 0;

  const filtered = hasProducts
    ? data.products.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
        );
      })
    : [];

  const displayed = filtered.slice(0, MAX_DISPLAY);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h2 className="section-title">Precios Alvi</h2>
            <p className="text-xs text-charcoal-700/40 mt-0.5">
              {hasProducts
                ? `${data.products.length} productos · actualizado ${timeAgo(data.updatedAt!)}`
                : 'Sin datos aún — el primer scraping correrá automáticamente.'}
            </p>
          </div>
        </div>

        {hasProducts && (
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-700/30 pointer-events-none"
            />
            <input
              className="input-base pl-8"
              placeholder="Buscar por nombre o marca…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {!hasProducts ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ShoppingCart size={32} className="text-charcoal-700/20" />
          <p className="text-sm text-charcoal-700/40">
            Los precios se cargarán en el primer scraping automático.
          </p>
          <p className="text-xs text-charcoal-700/30">
            También podés dispararlo manualmente desde GitHub Actions.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Search size={28} className="text-charcoal-700/20" />
          <p className="text-sm text-charcoal-700/40">Sin resultados para "{search}"</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((product) => {
            const pid = String(product.product_id);
            const parsed = parseFormat(product.format);
            const canAdd = parsed !== null && product.price != null;
            const isAdded = addedId === pid;
            const isFailed = failedId === pid;

            return (
              <div key={pid} className="card p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 truncate leading-snug">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {product.brand && (
                      <span className="text-xs text-charcoal-700/50">{product.brand}</span>
                    )}
                    {product.format && (
                      <span className="text-xs text-charcoal-700/40 bg-cream-100 rounded px-1.5 py-0.5">
                        {product.format}
                      </span>
                    )}
                    {product.ppum && (
                      <span className="text-xs text-charcoal-700/40">{product.ppum}</span>
                    )}
                  </div>
                  {isFailed && (
                    <p className="text-xs text-red-500 mt-1">
                      Formato "{product.format}" no reconocido — agregalo manualmente.
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {product.price != null ? (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-charcoal-800">
                        {formatCLP(product.price)}
                      </span>
                      <span className="block text-xs text-charcoal-700/40">
                        USD {(product.price / rate).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal-700/30">Sin precio</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {isSafeUrl(product.url) && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost px-1.5 py-1 text-charcoal-700/40 hover:text-charcoal-700"
                        title="Ver en Alvi"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button
                      onClick={() => handleAdd(product)}
                      disabled={!canAdd || isAdded}
                      className={`btn-ghost text-xs px-2 py-1 transition-all ${
                        isAdded
                          ? 'text-forest-600 border-forest-400/40'
                          : canAdd
                            ? 'text-charcoal-700 hover:text-forest-600 hover:border-forest-400/40'
                            : 'opacity-30 cursor-not-allowed'
                      } border border-cream-200 bg-white shadow-card`}
                      title={canAdd ? 'Agregar como ingrediente' : 'No se puede parsear el formato'}
                    >
                      {isAdded ? <Check size={12} /> : '+'}
                      {isAdded ? 'Agregado' : 'Usar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length > MAX_DISPLAY && (
            <p className="text-center text-xs text-charcoal-700/40 py-2">
              Mostrando {MAX_DISPLAY} de {filtered.length} resultados. Refiná la búsqueda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
