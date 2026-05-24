import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Unit } from '../../types';
import { unitLabel } from '../../utils/calculations';

const UNITS: Unit[] = ['kg', 'g', 'L', 'ml', 'u'];

interface IngredientFormProps {
  onAdd: (data: { name: string; packageSize: number; unit: Unit; packagePrice: number }) => void;
}

const EMPTY = { name: '', packageSize: '', unit: 'g' as Unit, packagePrice: '' };

export function IngredientForm({ onAdd }: IngredientFormProps) {
  const [form, setForm] = useState(EMPTY);

  function set<K extends keyof typeof EMPTY>(key: K, val: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const size = parseFloat(String(form.packageSize));
    const price = parseFloat(String(form.packagePrice));
    if (!form.name.trim() || isNaN(size) || size <= 0 || isNaN(price) || price < 0) return;
    onAdd({ name: form.name.trim(), packageSize: size, unit: form.unit, packagePrice: price });
    setForm(EMPTY);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h2 className="section-title mb-4">Agregar ingrediente</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px_90px_120px_auto]">
        <div>
          <label className="label">Nombre</label>
          <input
            className="input-base"
            placeholder="Ej: Harina 000"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Cantidad</label>
          <input
            className="input-base"
            type="number"
            placeholder="1000"
            min="0.001"
            step="any"
            value={form.packageSize}
            onChange={(e) => set('packageSize', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Unidad</label>
          <select
            className="input-base cursor-pointer"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value as Unit)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {unitLabel(u)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Precio (CLP)</label>
          <input
            className="input-base"
            type="number"
            placeholder="1200"
            min="0"
            step="1"
            value={form.packagePrice}
            onChange={(e) => set('packagePrice', e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            <Plus size={16} />
            Agregar
          </button>
        </div>
      </div>
    </form>
  );
}
