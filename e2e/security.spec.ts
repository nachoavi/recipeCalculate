import { test, expect } from '@playwright/test';
import { clearAppState, addIngredient } from './helpers';

test.beforeEach(async ({ page }) => {
  await clearAppState(page);
});

test('XSS in ingredient name is rendered as text, not executed', async ({ page }) => {
  const xssPayload = '<script>window.__xss=true</script>';
  await addIngredient(page, xssPayload, '100', 'g', '500');

  const xssExecuted = await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss);
  expect(xssExecuted).toBeUndefined();
  await expect(page.getByText(xssPayload)).toBeVisible();
});

test('XSS in recipe name is not executed', async ({ page }) => {
  await addIngredient(page, 'Harina', '1000', 'g', '1200');
  await page.getByRole('button', { name: /recetas/i }).click();

  const xss = '"><img src=x onerror=window.__xss2=true>';
  await page.getByPlaceholder('Ej: Bizcochuelo de vainilla').fill(xss);
  await page.locator('select').first().selectOption({ label: 'Harina' });
  await page.locator('input[placeholder="Cant."]').first().fill('100');
  await page.getByRole('button', { name: /guardar receta/i }).click();

  const xssExecuted = await page.evaluate(() => (window as unknown as { __xss2?: boolean }).__xss2);
  expect(xssExecuted).toBeUndefined();
});

test('corrupted localStorage does not crash the app', async ({ page }) => {
  // Set corrupted values THEN navigate (app must handle them gracefully on load)
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('rc_ingredients', 'INVALID_JSON{{{{');
    localStorage.setItem('rc_recipes', '{"broken":true}');
    localStorage.setItem('rc_packaging', 'null');
    localStorage.setItem('rc_exchange_rate_meta', JSON.stringify({ rate: 950, fetchedAt: Date.now() }));
  });
  await page.reload();
  await expect(page.getByText('RecipeCalc')).toBeVisible();
  await expect(page.getByText('Agregá ingredientes para empezar a calcular')).toBeVisible();
});

test('exchange rate editing rejects non-numeric input', async ({ page }) => {
  const rateButton = page.locator('button').filter({ hasText: /^\$\d/ }).first();
  await rateButton.click();
  await page.keyboard.type('abc');
  await page.keyboard.press('Enter');
  await expect(page.getByText('$950')).toBeVisible();
});

test('very long ingredient name is handled without layout break', async ({ page }) => {
  const longName = 'A'.repeat(200);
  await addIngredient(page, longName, '1000', 'g', '1000');
  await expect(page.getByText('RecipeCalc')).toBeVisible();
});

test('negative price input does not crash the app', async ({ page }) => {
  await addIngredient(page, 'Negativo', '1000', 'g', '-500');
  await expect(page.getByText('RecipeCalc')).toBeVisible();
});
