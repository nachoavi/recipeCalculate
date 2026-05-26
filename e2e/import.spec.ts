import { test, expect } from '@playwright/test';
import { clearAppState, ingredientName } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearAppState(page);
});

async function buildXlsxBuffer(rows: (string | number)[][]): Promise<Buffer> {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ingredientes');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

async function uploadExcel(page: import('@playwright/test').Page, rows: (string | number)[][]) {
  const buffer = await buildXlsxBuffer(rows);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'test.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  });
}

test('template download button is visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /plantilla/i })).toBeVisible();
});

test('import button is visible', async ({ page }) => {
  await expect(page.getByRole('button', { name: /importar excel/i })).toBeVisible();
});

test('import valid xlsx adds ingredients to list', async ({ page }) => {
  await uploadExcel(page, [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Harina Importada', 1, 'kg', 2500],
    ['Azúcar Importada', 500, 'g', 900],
  ]);

  await expect(page.getByText('Se importaron 2 ingredientes')).toBeVisible();
  await expect(ingredientName(page, 'Harina Importada')).toBeVisible();
  await expect(ingredientName(page, 'Azúcar Importada')).toBeVisible();
});

test('import xlsx with invalid unit shows error for that row', async ({ page }) => {
  await uploadExcel(page, [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Harina OK', 1, 'kg', 2500],
    ['Misterio', 1, 'toneladas', 9999],
  ]);

  await expect(page.getByText('Se importaron 1 ingrediente')).toBeVisible();
  await expect(page.getByText(/unidad.*no válida/i)).toBeVisible();
  await expect(ingredientName(page, 'Harina OK')).toBeVisible();
});

test('import xlsx with no data rows shows no ingredients message', async ({ page }) => {
  await uploadExcel(page, [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
  ]);

  await expect(page.getByText('No se encontraron ingredientes en el archivo')).toBeVisible();
});

test('import from first sheet when no Ingredientes sheet exists', async ({ page }) => {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet([
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Leche Entera', 1, 'L', 950],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'OtraHoja');
  const buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

  await page.locator('input[type="file"]').setInputFiles({
    name: 'otra.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  });

  await expect(page.getByText('Se importaron 1 ingrediente')).toBeVisible();
  await expect(ingredientName(page, 'Leche Entera')).toBeVisible();
});

test('import feedback can be dismissed', async ({ page }) => {
  await uploadExcel(page, [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Mantequilla', 500, 'g', 1800],
  ]);

  await expect(page.getByText('Se importaron 1 ingrediente')).toBeVisible();
  await page.getByLabel('Cerrar').click();
  await expect(page.getByText('Se importaron 1 ingrediente')).not.toBeVisible();
});

test('imported ingredients persist after page reload', async ({ page }) => {
  await uploadExcel(page, [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)'],
    ['Vainilla Import', 100, 'ml', 800],
  ]);

  await expect(ingredientName(page, 'Vainilla Import')).toBeVisible();
  await page.reload();
  await expect(ingredientName(page, 'Vainilla Import')).toBeVisible();
});
