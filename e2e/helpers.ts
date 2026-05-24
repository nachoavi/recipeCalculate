import type { Page } from '@playwright/test';

export async function clearAppState(page: Page) {
  // Navigate first, then clear state via evaluate (not addInitScript so it doesn't
  // fire again on reload — which would break persistence tests).
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'rc_exchange_rate_meta',
      JSON.stringify({ rate: 950, fetchedAt: Date.now() })
    );
  });
  // Reload so the app re-reads the freshly cleared localStorage.
  await page.reload();
}

export async function addIngredient(
  page: Page,
  name: string,
  quantity: string,
  unit: string,
  price: string
) {
  await page.getByPlaceholder('Ej: Harina 000').fill(name);
  await page.locator('label').filter({ hasText: 'Cantidad' }).locator('..').locator('input').fill(quantity);
  await page.locator('label').filter({ hasText: 'Unidad' }).locator('..').locator('select').selectOption(unit);
  await page.locator('label').filter({ hasText: 'Precio' }).locator('..').locator('input').fill(price);
  await page.getByRole('button', { name: /^agregar$/i }).click();
}
