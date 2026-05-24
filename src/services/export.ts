import type { WorkSheet, WorkBook } from 'xlsx';
import type { Ingredient, Packaging, Recipe } from '../types';
import {
  calculateRecipeCost,
  ingredientLineCost,
  costPerBaseUnit,
  unitLabel,
} from '../utils/calculations';

type Row = (string | number)[];

function clp(v: number) { return Math.round(v); }
function usd(v: number, rate: number) { return parseFloat((v / rate).toFixed(2)); }

function buildIngredientsRows(ingredients: Ingredient[], rate: number): Row[] {
  const baseUnitName = (ing: Ingredient) =>
    ing.unit === 'kg' || ing.unit === 'g' ? 'g' : ing.unit === 'L' || ing.unit === 'ml' ? 'ml' : 'u';

  return [
    ['Nombre', 'Cantidad paquete', 'Unidad', 'Precio paquete (CLP)', 'Precio paquete (USD)', `Precio / ${baseUnitName(ingredients[0] ?? { unit: 'g' } as Ingredient)} (CLP)`],
    ...ingredients.map((ing) => [
      ing.name,
      ing.packageSize,
      unitLabel(ing.unit),
      clp(ing.packagePrice),
      usd(ing.packagePrice, rate),
      parseFloat(costPerBaseUnit(ing).toFixed(4)),
    ]),
  ];
}

function buildPackagingRows(packaging: Packaging[], rate: number): Row[] {
  return [
    ['Nombre', 'Precio por unidad (CLP)', 'Precio por unidad (USD)'],
    ...packaging.map((p) => [p.name, clp(p.pricePerUnit), usd(p.pricePerUnit, rate)]),
  ];
}

function buildRecipesRows(
  recipes: Recipe[],
  ingredients: Ingredient[],
  packaging: Packaging[],
  rate: number
): Row[] {
  const byIngId = new Map(ingredients.map((i) => [i.id, i]));
  const byPkgId = new Map(packaging.map((p) => [p.id, p]));
  const allRows: Row[] = [];

  for (const recipe of recipes) {
    const costs = calculateRecipeCost(recipe, ingredients, packaging);

    allRows.push([`RECETA: ${recipe.name}`]);
    allRows.push([`Porciones: ${recipe.servings}`]);
    allRows.push([]);

    allRows.push(['INGREDIENTES', '', '', '', '']);
    allRows.push(['Ingrediente', 'Cantidad', 'Unidad', 'Costo (CLP)', 'Costo (USD)']);
    for (const item of recipe.ingredients) {
      const ing = byIngId.get(item.ingredientId);
      if (!ing) continue;
      const cost = ingredientLineCost(item, ing);
      allRows.push([ing.name, item.quantity, unitLabel(item.unit), clp(cost), usd(cost, rate)]);
    }
    allRows.push(['', '', '', 'Subtotal ingredientes', clp(costs.ingredientCost)]);
    allRows.push([]);

    const recipePackaging = recipe.packaging ?? [];
    if (recipePackaging.length > 0) {
      allRows.push(['ENVASES', '', '', '', '']);
      allRows.push(['Envase', 'Cantidad', '', 'Costo (CLP)', 'Costo (USD)']);
      for (const item of recipePackaging) {
        const pkg = byPkgId.get(item.packagingId);
        if (!pkg) continue;
        const cost = pkg.pricePerUnit * item.quantity;
        allRows.push([pkg.name, item.quantity, 'u', clp(cost), usd(cost, rate)]);
      }
      allRows.push(['', '', '', 'Subtotal envases', clp(costs.packagingCost)]);
      allRows.push([]);
    }

    allRows.push(['RESUMEN DE COSTOS', '', '', 'CLP', 'USD']);
    allRows.push(['Costo total (ingredientes + envases)', '', '', clp(costs.totalCost), usd(costs.totalCost, rate)]);
    if (recipe.overheadPercent > 0) {
      allRows.push([`Con overhead (${recipe.overheadPercent}%)`, '', '', clp(costs.withOverhead), usd(costs.withOverhead, rate)]);
    }
    if (recipe.profitMargin > 0) {
      allRows.push([`Precio de venta (margen ${recipe.profitMargin}%)`, '', '', clp(costs.sellingPrice), usd(costs.sellingPrice, rate)]);
      allRows.push([`Ganancia total`, '', '', clp(costs.profit), usd(costs.profit, rate)]);
    }
    allRows.push(['Costo por porción', '', '', clp(costs.costPerServing), usd(costs.costPerServing, rate)]);
    if (recipe.profitMargin > 0) {
      allRows.push(['Precio de venta por porción', '', '', clp(costs.sellingPricePerServing), usd(costs.sellingPricePerServing, rate)]);
      allRows.push(['Ganancia por porción', '', '', clp(costs.profitPerServing), usd(costs.profitPerServing, rate)]);
      allRows.push([`Margen sobre precio de venta`, '', '', `${costs.profitMarginOnSale.toFixed(1)}%`, '']);
    }
    allRows.push([]);
    allRows.push([]);
  }

  return allRows;
}

export async function exportToExcel(
  ingredients: Ingredient[],
  packaging: Packaging[],
  recipes: Recipe[],
  rate: number
) {
  const XLSX = await import('xlsx');

  function makeSheet(rows: Row[], colWidths: number[]): WorkSheet {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = colWidths.map((wch) => ({ wch }));
    return ws;
  }

  const wb: WorkBook = XLSX.utils.book_new();

  if (ingredients.length > 0) {
    XLSX.utils.book_append_sheet(wb, makeSheet(buildIngredientsRows(ingredients, rate), [28, 16, 8, 20, 18, 22]), 'Ingredientes');
  }
  if (packaging.length > 0) {
    XLSX.utils.book_append_sheet(wb, makeSheet(buildPackagingRows(packaging, rate), [28, 22, 20]), 'Envases');
  }
  if (recipes.length > 0) {
    XLSX.utils.book_append_sheet(wb, makeSheet(buildRecipesRows(recipes, ingredients, packaging, rate), [36, 10, 8, 20, 16]), 'Recetas');
  }

  if (wb.SheetNames.length === 0) return;

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `RecipeCalc_${date}.xlsx`);
}
