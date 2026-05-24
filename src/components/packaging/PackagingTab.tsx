import { Box } from 'lucide-react';
import type { Packaging } from '../../types';
import { PackagingForm } from './PackagingForm';
import { PackagingCard } from './PackagingCard';

interface PackagingTabProps {
  packaging: Packaging[];
  rate: number;
  onAdd: (data: Omit<Packaging, 'id'>) => void;
  onRemove: (id: string) => void;
}

export function PackagingTab({ packaging, rate, onAdd, onRemove }: PackagingTabProps) {
  return (
    <div className="space-y-6">
      <PackagingForm onAdd={onAdd} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Tus envases</h2>
          {packaging.length > 0 && (
            <span className="text-xs text-charcoal-700/40">
              {packaging.length} {packaging.length === 1 ? 'envase' : 'envases'}
            </span>
          )}
        </div>

        {packaging.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Box size={32} className="text-charcoal-700/20" />
            <p className="text-sm text-charcoal-700/40">
              Agregá envases para incluirlos en el costo de tus recetas
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {packaging.map((item) => (
              <PackagingCard
                key={item.id}
                item={item}
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
