import { useState } from 'react';
import { Plus } from 'lucide-react';

interface PackagingFormProps {
  onAdd: (data: { name: string; pricePerUnit: number }) => void;
}

const EMPTY = { name: '', pricePerUnit: '' };

export function PackagingForm({ onAdd }: PackagingFormProps) {
  const [form, setForm] = useState(EMPTY);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = parseFloat(String(form.pricePerUnit));
    if (!form.name.trim() || isNaN(price) || price < 0) return;
    onAdd({ name: form.name.trim(), pricePerUnit: price });
    setForm(EMPTY);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h2 className="section-title mb-4">Agregar envase</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px_auto]">
        <div>
          <label className="label">Nombre</label>
          <input
            className="input-base"
            placeholder="Ej: Caja kraft 20×20"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="label">Precio por unidad (CLP)</label>
          <input
            className="input-base"
            type="number"
            placeholder="350"
            min="0"
            step="1"
            value={form.pricePerUnit}
            onChange={(e) => setForm((p) => ({ ...p, pricePerUnit: e.target.value }))}
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
