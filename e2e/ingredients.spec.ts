import { test, expect } from '@playwright/test';
import { clearAppState, addIngredient, ingredientName } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearAppState(page);
});

test('shows empty state when no ingredients', async ({ page }) => {
  await expect(page.getByText('Agregá ingredientes para empezar a calcular')).toBeVisible();
});

test('add ingredient and verify it appears in list', async ({ page }) => {
  await addIngredient(page, 'Harina 000', '1000', 'g', '1200');
  await expect(ingredientName(page, 'Harina 000')).toBeVisible();
  await expect(page.getByText('1000 g')).toBeVisible();
});

test('ingredient counter shows in tab', async ({ page }) => {
  await addIngredient(page, 'Azúcar', '1000', 'g', '900');
  const tab = page.getByRole('button', { name: /ingredientes/i });
  await expect(tab.locator('span', { hasText: '1' })).toBeVisible();
});

test('delete ingredient removes it from list', async ({ page }) => {
  await addIngredient(page, 'Sal', '500', 'g', '300');
  await expect(ingredientName(page, 'Sal')).toBeVisible();
  await page.getByTitle('Eliminar ingrediente').click();
  await expect(ingredientName(page, 'Sal')).not.toBeVisible();
  await expect(page.getByText('Agregá ingredientes para empezar a calcular')).toBeVisible();
});

test('multiple ingredients are all listed', async ({ page }) => {
  await addIngredient(page, 'Harina', '1000', 'g', '1200');
  await addIngredient(page, 'Azúcar', '1000', 'g', '900');
  await addIngredient(page, 'Mantequilla', '250', 'g', '2500');
  await expect(page.getByText('3 ingredientes')).toBeVisible();
});

test('persists ingredients after page reload', async ({ page }) => {
  await addIngredient(page, 'Vainilla', '100', 'ml', '800');
  await expect(ingredientName(page, 'Vainilla')).toBeVisible();
  // reload — no addInitScript so localStorage survives
  await page.reload();
  await expect(ingredientName(page, 'Vainilla')).toBeVisible();
});
