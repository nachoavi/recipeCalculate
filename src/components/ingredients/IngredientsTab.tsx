import { useRef, useState } from 'react';
import { Package, Upload, FileSpreadsheet, X } from 'lucide-react';
import type { Ingredient } from '../../types';
import { IngredientForm } from './IngredientForm';
import { IngredientCard } from './IngredientCard';
import { importIngredientsFromExcel, downloadIngredientTemplate } from '../../services/import';
import type { ImportResult } from '../../services/import';

interface IngredientsTabProps {
  ingredients: Ingredient[];
  rate: number;
  onAdd: (data: Omit<Ingredient, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function IngredientsTab({ ingredients, rate, onAdd, onRemove }: IngredientsTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await importIngredientsFromExcel(file);
      for (const ing of res.imported) onAdd(ing);
      setResult(res);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  const resultColor =
    result === null
      ? ''
      : result.errors.length === 0
        ? 'bg-green-50 border-green-200 text-green-800'
        : result.imported.length > 0
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div className="space-y-6">
      <IngredientForm onAdd={onAdd} />

      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="section-title">Tus ingredientes</h2>
            {ingredients.length > 0 && (
              <span className="text-xs text-charcoal-700/40">
                {ingredients.length} {ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadIngredientTemplate()}
              className="btn-ghost border border-cream-200 bg-white shadow-card text-charcoal-700 hover:text-forest-600 hover:border-forest-400/40 text-xs"
            >
              <FileSpreadsheet size={13} />
              Plantilla
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="btn-ghost border border-cream-200 bg-white shadow-card text-charcoal-700 hover:text-forest-600 hover:border-forest-400/40 text-xs disabled:opacity-50"
            >
              <Upload size={13} />
              {importing ? 'Importando…' : 'Importar Excel'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.ods,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {result && (
          <div className={`rounded-lg border p-3 mb-3 text-sm relative ${resultColor}`}>
            <button
              onClick={() => setResult(null)}
              className="absolute top-2 right-2 opacity-50 hover:opacity-100"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
            {result.imported.length > 0 && (
              <p className="font-medium pr-5">
                Se importaron {result.imported.length}{' '}
                {result.imported.length === 1 ? 'ingrediente' : 'ingredientes'}.
              </p>
            )}
            {result.imported.length === 0 && result.errors.length === 0 && (
              <p>No se encontraron ingredientes en el archivo.</p>
            )}
            {result.errors.length > 0 && (
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs pr-5">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {ingredients.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Package size={32} className="text-charcoal-700/20" />
            <p className="text-sm text-charcoal-700/40">
              Agregá ingredientes para empezar a calcular
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {ingredients.map((ing) => (
              <IngredientCard
                key={ing.id}
                ingredient={ing}
                rate={rate}
                onRemove={onRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
