import { test, expect } from '@playwright/test';
import { clearAppState, ingredientName } from './helpers';

const MOCK_PRODUCTS = [
  {
    product_id: '1',
    name: 'Harina Sin Polvos de Hornear',
    brand: 'Merkat',
    format: '1 Kg',
    price: 2890,
    in_stock: true,
    ppum: '$2.890 x Kg',
    url: 'https://www.alvi.cl/harina/p',
    image: null,
    categories: ['Abarrotes'],
  },
  {
    product_id: '2',
    name: 'Azúcar Granulada',
    brand: 'Iansa',
    format: '1 Kg',
    price: 1490,
    in_stock: true,
    ppum: '$1.490 x Kg',
    url: 'https://www.alvi.cl/azucar/p',
    image: null,
    categories: ['Abarrotes'],
  },
  {
    product_id: '3',
    name: 'Leche Entera',
    brand: 'Colun',
    format: '1 L',
    price: 990,
    in_stock: true,
    ppum: '$990 x L',
    url: 'https://www.alvi.cl/leche/p',
    image: null,
    categories: ['Lácteos'],
  },
];

async function mockAlviData(
  page: import('@playwright/test').Page,
  products: typeof MOCK_PRODUCTS | []
) {
  await page.route('/data/alvi-products.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        updatedAt: products.length ? '2026-05-26T08:00:00.000Z' : null,
        products,
      }),
    })
  );
}

test.beforeEach(async ({ page }) => {
  await clearAppState(page);
});

test('Alvi tab is visible in nav', async ({ page }) => {
  await expect(page.getByRole('button', { name: /alvi/i })).toBeVisible();
});

test('navigating to Alvi tab works', async ({ page }) => {
  await mockAlviData(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await expect(page.getByText('Precios Alvi')).toBeVisible();
});

test('shows empty state when no products available', async ({ page }) => {
  await mockAlviData(page, []);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await expect(page.getByText('Los precios se cargarán en el primer scraping automático.')).toBeVisible();
});

test('shows product count and update date when products exist', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await expect(page.getByText('3 productos')).toBeVisible();
});

test('products are listed with name, brand and price', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await expect(page.getByText('Harina Sin Polvos de Hornear')).toBeVisible();
  await expect(page.getByText('Merkat')).toBeVisible();
  await expect(page.getByText('$2.890', { exact: true })).toBeVisible();
});

test('search filters products by name', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await page.getByPlaceholder('Buscar por nombre o marca…').fill('harina');
  await expect(page.getByText('Harina Sin Polvos de Hornear')).toBeVisible();
  await expect(page.getByText('Azúcar Granulada')).not.toBeVisible();
  await expect(page.getByText('Leche Entera')).not.toBeVisible();
});

test('search filters products by brand', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await page.getByPlaceholder('Buscar por nombre o marca…').fill('iansa');
  await expect(page.getByText('Azúcar Granulada')).toBeVisible();
  await expect(page.getByText('Harina Sin Polvos de Hornear')).not.toBeVisible();
});

test('search with no match shows no results message', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();
  await page.getByPlaceholder('Buscar por nombre o marca…').fill('xyznotexist');
  await expect(page.getByText(/sin resultados para/i)).toBeVisible();
});

test('Usar button adds product as ingredient', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();

  const harineRow = page.locator('.card').filter({ hasText: 'Harina Sin Polvos de Hornear' });
  await harineRow.getByRole('button', { name: /usar/i }).click();

  await expect(harineRow.getByText('Agregado')).toBeVisible();

  // Verify ingredient was actually added
  await page.getByRole('button', { name: /ingredientes/i }).click();
  await expect(ingredientName(page, 'Harina Sin Polvos de Hornear Merkat')).toBeVisible();
});

test('external link has correct href and rel', async ({ page }) => {
  await mockAlviData(page, MOCK_PRODUCTS);
  await page.goto('/');
  await page.getByRole('button', { name: /alvi/i }).click();

  const link = page.locator('a[title="Ver en Alvi"]').first();
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(link).toHaveAttribute('target', '_blank');
  const href = await link.getAttribute('href');
  expect(href).toMatch(/^https?:\/\//);
});
