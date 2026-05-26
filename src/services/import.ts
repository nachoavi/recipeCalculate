import type { Unit, Ingredient } from '../types';

const VALID_UNITS: Unit[] = ['kg', 'g', 'L', 'ml', 'u'];

function normalizeUnit(raw: string): Unit | null {
  const trimmed = raw.trim();
  if ((VALID_UNITS as string[]).includes(trimmed)) return trimmed as Unit;
  const map: Record<string, Unit> = { kg: 'kg', g: 'g', l: 'L', ml: 'ml', u: 'u' };
  return map[trimmed.toLowerCase()] ?? null;
}

export interface ImportResult {
  imported: Omit<Ingredient, 'id'>[];
  errors: string[];
}

export async function importIngredientsFromExcel(file: File): Promise<ImportResult> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const sheetName = wb.SheetNames.includes('Ingredientes')
    ? 'Ingredientes'
    : wb.SheetNames[0];

  if (!sheetName) return { imported: [], errors: ['El archivo está vacío.'] };

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

  const imported: Omit<Ingredient, 'id'>[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const name = String(row['Nombre'] ?? '').trim();
    if (!name) continue;

    const packageSize = Number(row['Cantidad paquete']);
    if (!isFinite(packageSize) || packageSize <= 0) {
      errors.push(`Fila ${rowNum} (${name}): cantidad de paquete inválida.`);
      continue;
    }

    const unit = normalizeUnit(String(row['Unidad'] ?? ''));
    if (!unit) {
      errors.push(`Fila ${rowNum} (${name}): unidad "${row['Unidad']}" no válida. Usá kg, g, L, ml o u.`);
      continue;
    }

    const packagePrice = Number(row['Precio paquete (CLP)']);
    if (!isFinite(packagePrice) || packagePrice < 0) {
      errors.push(`Fila ${rowNum} (${name}): precio inválido.`);
      continue;
    }

    imported.push({ name, packageSize, unit, packagePrice });
  }

  return { imported, errors };
}

export async function downloadIngredientTemplate(): Promise<void> {
  const XLSX = await import('xlsx');
  const rows = [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Harina 0000', 1, 'kg', 2500],
    ['Manteca', 500, 'g', 1800],
    ['Leche', 1, 'L', 950],
    ['Huevos', 12, 'u', 3200],
    ['Azúcar', 1, 'kg', 1400],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 8 }, { wch: 22 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredientes');
  XLSX.writeFile(wb, 'plantilla_ingredientes.xlsx');
}
