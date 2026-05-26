export type Unit = 'kg' | 'g' | 'L' | 'ml' | 'u';

export interface Ingredient {
  id: string;
  name: string;
  packageSize: number;
  unit: Unit;
  packagePrice: number;
}

export interface Packaging {
  id: string;
  name: string;
  pricePerUnit: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
}

export interface RecipePackaging {
  packagingId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  packaging: RecipePackaging[];
  overheadPercent: number;
  profitMargin: number;
}

export interface AlviProduct {
  product_id: string | number;
  name: string;
  brand: string;
  format: string;
  price: number | null;
  list_price?: number | null;
  ppum?: string;
  in_stock: boolean;
  categories?: string[];
  url?: string;
  image?: string;
}

export interface AlviData {
  updatedAt: string | null;
  products: AlviProduct[];
}

export interface CostBreakdown {
  ingredientCost: number;
  packagingCost: number;
  totalCost: number;
  withOverhead: number;
  sellingPrice: number;
  costPerServing: number;
  sellingPricePerServing: number;
  profit: number;
  profitPerServing: number;
  profitMarginOnSale: number;
}
