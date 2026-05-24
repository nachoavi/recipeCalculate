import { useState } from 'react';
import { Plus, Trash2, ChefHat } from 'lucide-react';
import type { Ingredient, Packaging, RecipeIngredient, RecipePackaging, Unit } from '../../types';
import { compatibleUnits, unitLabel } from '../../utils/calculations';

interface RecipeFormProps {
  ingredients: Ingredient[];
  packaging: Packaging[];
  onAdd: (data: {
    name: string;
    servings: number;
    ingredients: RecipeIngredient[];
    packaging: RecipePackaging[];
    overheadPercent: number;
    profitMargin: number;
  }) => void;
}

interface IngLine {
  id: string;
  ingredientId: string;
  quantity: string;
  unit: Unit;
}

interface PkgLine {
  id: string;
  packagingId: string;
  quantity: string;
}

const newIngLine = (): IngLine => ({
  id: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  ingredientId: '',
  quantity: '',
  unit: 'g',
});

const newPkgLine = (): PkgLine => ({
  id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  packagingId: '',
  quantity: '1',
});

export function RecipeForm({ ingredients, packaging, onAdd }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [servings, setServings] = useState('1');
  const [overhead, setOverhead] = useState('0');
  const [margin, setMargin] = useState('0');
  const [ingLines, setIngLines] = useState<IngLine[]>([newIngLine()]);
  const [pkgLines, setPkgLines] = useState<PkgLine[]>([]);

  function updateIngLine(id: string, patch: Partial<IngLine>) {
    setIngLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, ...patch };
        if (patch.ingredientId) {
          const ing = ingredients.find((i) => i.id === patch.ingredientId);
          if (ing) updated.unit = ing.unit;
        }
        return updated;
      })
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const validIng = ingLines.filter((l) => {
      const qty = parseFloat(l.quantity);
      return l.ingredientId && !isNaN(qty) && qty > 0;
    });
    if (validIng.length === 0) return;

    const validPkg: RecipePackaging[] = pkgLines
      .filter((l) => {
        const qty = parseFloat(l.quantity);
        return l.packagingId && !isNaN(qty) && qty > 0;
      })
      .map((l) => ({ packagingId: l.packagingId, quantity: parseFloat(l.quantity) }));

    onAdd({
      name: name.trim(),
      servings: Math.max(1, parseInt(servings) || 1),
      ingredients: validIng.map((l) => ({
        ingredientId: l.ingredientId,
        quantity: parseFloat(l.quantity),
        unit: l.unit,
      })),
      packaging: validPkg,
      overheadPercent: parseFloat(overhead) || 0,
      profitMargin: parseFloat(margin) || 0,
    });

    setName('');
    setServings('1');
    setOverhead('0');
    setMargin('0');
    setIngLines([newIngLine()]);
    setPkgLines([]);
  }

  if (ingredients.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 py-10 text-center">
        <ChefHat size={32} className="text-charcoal-700/20" />
        <p className="text-sm text-charcoal-700/40">
          Primero agregá ingredientes en la pestaña anterior
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-5">
      <h2 className="section-title">Nueva receta</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
        <div>
          <label className="label">Nombre</label>
          <input
            className="input-base"
            placeholder="Ej: Bizcochuelo de vainilla"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Porciones</label>
          <input
            className="input-base"
            type="number"
            min="1"
            step="1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
          />
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Ingredientes</label>
          <button
            type="button"
            onClick={() => setIngLines((p) => [...p, newIngLine()])}
            className="btn-ghost text-xs py-1 px-2"
          >
            <Plus size={12} /> Agregar línea
          </button>
        </div>
        <div className="space-y-2">
          {ingLines.map((line) => {
            const ing = ingredients.find((i) => i.id === line.ingredientId);
            const units = ing ? compatibleUnits(ing.unit) : (['g', 'kg', 'ml', 'L', 'u'] as Unit[]);
            return (
              <div key={line.id} className="flex items-center gap-2">
                <select
                  className="input-base flex-1"
                  value={line.ingredientId}
                  onChange={(e) => updateIngLine(line.id, { ingredientId: e.target.value })}
                >
                  <option value="">Seleccionar…</option>
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                <input
                  className="input-base w-24"
                  type="number"
                  placeholder="Cant."
                  min="0.001"
                  step="any"
                  value={line.quantity}
                  onChange={(e) => updateIngLine(line.id, { quantity: e.target.value })}
                />
                <select
                  className="input-base w-20"
                  value={line.unit}
                  onChange={(e) => updateIngLine(line.id, { unit: e.target.value as Unit })}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{unitLabel(u)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIngLines((p) => p.filter((l) => l.id !== line.id))}
                  className="btn-danger"
                  disabled={ingLines.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packaging */}
      {packaging.length > 0 && (
        <div className="border-t border-cream-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Envases <span className="font-normal normal-case text-charcoal-700/40">(opcional)</span></label>
            <button
              type="button"
              onClick={() => setPkgLines((p) => [...p, newPkgLine()])}
              className="btn-ghost text-xs py-1 px-2"
            >
              <Plus size={12} /> Agregar envase
            </button>
          </div>
          {pkgLines.length === 0 ? (
            <p className="text-xs text-charcoal-700/40 py-1">Sin envases asignados</p>
          ) : (
            <div className="space-y-2">
              {pkgLines.map((line) => (
                <div key={line.id} className="flex items-center gap-2">
                  <select
                    className="input-base flex-1"
                    value={line.packagingId}
                    onChange={(e) =>
                      setPkgLines((p) =>
                        p.map((l) => l.id === line.id ? { ...l, packagingId: e.target.value } : l)
                      )
                    }
                  >
                    <option value="">Seleccionar envase…</option>
                    {packaging.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                    ))}
                  </select>
                  <input
                    className="input-base w-24"
                    type="number"
                    placeholder="Cant."
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(e) =>
                      setPkgLines((p) =>
                        p.map((l) => l.id === line.id ? { ...l, quantity: e.target.value } : l)
                      )
                    }
                  />
                  <span className="text-xs text-charcoal-700/50 w-6">u</span>
                  <button
                    type="button"
                    onClick={() => setPkgLines((p) => p.filter((l) => l.id !== line.id))}
                    className="btn-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 border-t border-cream-200 pt-4">
        <div>
          <label className="label">Overhead %</label>
          <input
            className="input-base"
            type="number"
            min="0"
            max="200"
            step="0.5"
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
          />
          <p className="mt-1 text-xs text-charcoal-700/40">Gas, luz, tiempo, etc.</p>
        </div>
        <div>
          <label className="label">Margen de ganancia %</label>
          <input
            className="input-base"
            type="number"
            min="0"
            max="500"
            step="0.5"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
          <p className="mt-1 text-xs text-charcoal-700/40">% sobre costo + overhead</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          <Plus size={16} />
          Guardar receta
        </button>
      </div>
    </form>
  );
}
