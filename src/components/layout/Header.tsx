import { useState } from 'react';
import { Pencil, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCLP } from '../../utils/calculations';

interface HeaderProps {
  rate: number;
  loading: boolean;
  error: boolean;
  lastUpdated: number;
  onRateChange: (rate: number) => void;
  onRefresh: () => void;
}

function timeAgo(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} d`;
}

export function Header({ rate, loading, error, lastUpdated, onRateChange, onRefresh }: HeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startEdit() {
    setDraft(String(rate));
    setEditing(true);
  }

  function confirm() {
    const parsed = parseFloat(draft.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) onRateChange(parsed);
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  const ago = timeAgo(lastUpdated);

  return (
    <header className="border-b border-cream-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl text-terracotta-500">RecipeCalc</span>
          <span className="hidden text-xs text-charcoal-700/40 sm:block">
            Costos de recetas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-charcoal-700/50">1 USD =</span>

          {editing ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirm();
                  if (e.key === 'Escape') cancel();
                }}
                className="w-24 rounded-md border border-terracotta-400 px-2 py-1 text-sm outline-none ring-2 ring-terracotta-400/20"
              />
              <button onClick={confirm} className="btn-ghost text-forest-500 px-1.5 py-1">
                <Check size={14} />
              </button>
              <button onClick={cancel} className="btn-ghost text-red-400 px-1.5 py-1">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-charcoal-800 hover:bg-cream-100 transition-colors"
            >
              <span className={`text-money transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {formatCLP(rate)}
              </span>
              <Pencil size={11} className="text-charcoal-700/40" />
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-ghost px-1.5 py-1 disabled:opacity-40"
            title="Actualizar tipo de cambio"
          >
            <RefreshCw
              size={13}
              className={`transition-transform ${loading ? 'animate-spin' : 'text-charcoal-700/50'}`}
            />
          </button>

          {error && (
            <span title="No se pudo actualizar. Usando último valor guardado.">
              <AlertCircle size={13} className="text-amber-500" />
            </span>
          )}

          {ago && !loading && !error && (
            <span className="hidden text-xs text-charcoal-700/30 sm:block whitespace-nowrap">
              {ago}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
