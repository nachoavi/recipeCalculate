import { test, expect } from '@playwright/test';
import { clearAppState, addIngredient, recipeForm } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearAppState(page);
  await addIngredient(page, 'Harina 000', '1000', 'g', '1200');
  await page.getByRole('button', { name: /recetas/i }).click();
});

test('shows prompt to add ingredients when none exist', async ({ page }) => {
  await clearAppState(page);
  await page.getByRole('button', { name: /recetas/i }).click();
  await expect(page.getByText('Primero agregá ingredientes')).toBeVisible();
});

test('create recipe and verify it appears in list', async ({ page }) => {
  const form = recipeForm(page);
  await form.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Torta de prueba');
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('200');
  await form.getByRole('button', { name: /guardar receta/i }).click();
  await expect(page.getByText('Torta de prueba')).toBeVisible();
});

test('recipe cost calculation is correct', async ({ page }) => {
  // Harina 000: 1000g / $1200 → $1.20/g · using 200g = $240
  const form = recipeForm(page);
  await form.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Test');
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('200');
  await form.getByRole('button', { name: /guardar receta/i }).click();

  // Expand the recipe card
  await page.getByText('Test').click();
  // Look for $240 within the ingredients breakdown (multiple occurrences expected — just verify at least one)
  await expect(page.getByText('$240').first()).toBeVisible();
});

test('recipe shows profit when margin is set', async ({ page }) => {
  const form = recipeForm(page);
  await form.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Con margen');
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('100');
  await form.locator('label').filter({ hasText: /margen/i }).locator('..').locator('input').fill('50');
  await form.getByRole('button', { name: /guardar receta/i }).click();
  await page.getByText('Con margen').click();
  await expect(page.getByText('Ganancia estimada')).toBeVisible();
});

test('delete recipe removes it from list', async ({ page }) => {
  const form = recipeForm(page);
  await form.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Eliminar esto');
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('100');
  await form.getByRole('button', { name: /guardar receta/i }).click();
  await expect(page.getByText('Eliminar esto')).toBeVisible();

  // Find and click the delete button inside the specific card
  const card = page.locator('.card').filter({ hasText: 'Eliminar esto' }).first();
  await card.locator('button').last().click();
  await expect(page.getByText('Eliminar esto')).not.toBeVisible();
});

test('recipe form name is preserved when switching tabs and back', async ({ page }) => {
  await page.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Receta en progreso');
  await page.getByRole('button', { name: /ingredientes/i }).click();
  await page.getByRole('button', { name: /recetas/i }).click();
  await expect(page.getByPlaceholder('Ej: Bizcochuelo de vainilla')).toHaveValue('Receta en progreso');
});

test('recipe form ingredient line is preserved when switching tabs and back', async ({ page }) => {
  const form = recipeForm(page);
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('350');
  await page.getByRole('button', { name: /ingredientes/i }).click();
  await page.getByRole('button', { name: /recetas/i }).click();
  await expect(form.locator('input[placeholder="Cant."]').first()).toHaveValue('350');
});

test('recipe persists after page reload', async ({ page }) => {
  const form = recipeForm(page);
  await form.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill('Persistente');
  await form.locator('select').first().selectOption({ label: 'Harina 000' });
  await form.locator('input[placeholder="Cant."]').first().fill('100');
  await form.getByRole('button', { name: /guardar receta/i }).click();
  // reload — no addInitScript so localStorage survives
  await page.reload();
  await page.getByRole('button', { name: /recetas/i }).click();
  await expect(page.getByText('Persistente')).toBeVisible();
});
