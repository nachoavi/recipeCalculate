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
  // Scope to the ingredient form specifically to avoid strict-mode violations
  // caused by all tabs being mounted (hidden via CSS) at the same time.
  const form = page.locator('form').filter({ has: page.getByPlaceholder('Ej: Harina 000') });
  await form.getByPlaceholder('Ej: Harina 000').fill(name);
  await form.getByPlaceholder('1000').fill(quantity);
  await form.getByPlaceholder('1200').fill(price);
  await form.locator('select').selectOption(unit);
  await form.getByRole('button', { name: /^agregar$/i }).click();
}

/** Returns a locator for a visible ingredient name (avoids matching hidden <option> elements). */
export function ingredientName(page: Page, name: string) {
  return page.getByText(name, { exact: true }).and(page.locator(':visible'));
}

/** Returns a locator scoped to the recipe form (avoids matching hidden IngredientForm selects). */
export function recipeForm(page: Page) {
  return page.locator('form').filter({ has: page.getByPlaceholder('Ej: Bizcochuelo de vainilla') });
}
