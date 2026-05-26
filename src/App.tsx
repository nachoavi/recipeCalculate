import { useState } from 'react';
import { Package, ChefHat, Box, Download, ShoppingCart } from 'lucide-react';
import { Header } from './components/layout/Header';
import { IngredientsTab } from './components/ingredients/IngredientsTab';
import { PackagingTab } from './components/packaging/PackagingTab';
import { RecipesTab } from './components/recipes/RecipesTab';
import { AlviTab } from './components/alvi/AlviTab';
import { useIngredients } from './hooks/useIngredients';
import { useRecipes } from './hooks/useRecipes';
import { usePackaging } from './hooks/usePackaging';
import { useExchangeRate } from './hooks/useExchangeRate';
import { exportToExcel } from './services/export';

type Tab = 'ingredients' | 'packaging' | 'recipes' | 'alvi';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('ingredients');
  const { ingredients, addIngredient, removeIngredient } = useIngredients();
  const { packaging, addPackaging, removePackaging } = usePackaging();
  const { recipes, addRecipe, removeRecipe } = useRecipes();
  const { rate, setRate, loading, error, lastUpdated, refresh } = useExchangeRate();

  const hasData = ingredients.length > 0 || packaging.length > 0 || recipes.length > 0;

  return (
    <div className="min-h-screen bg-cream-50">
      <Header
        rate={rate}
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        onRateChange={setRate}
        onRefresh={refresh}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <nav className="flex gap-0.5 sm:gap-1 bg-white rounded-xl border border-cream-200 p-1 shadow-card w-full sm:w-fit">
            <TabButton
              active={activeTab === 'ingredients'}
              onClick={() => setActiveTab('ingredients')}
              icon={<Package size={15} />}
              label="Ingredientes"
              count={ingredients.length}
            />
            <TabButton
              active={activeTab === 'packaging'}
              onClick={() => setActiveTab('packaging')}
              icon={<Box size={15} />}
              label="Envases"
              count={packaging.length}
            />
            <TabButton
              active={activeTab === 'recipes'}
              onClick={() => setActiveTab('recipes')}
              icon={<ChefHat size={15} />}
              label="Recetas"
              count={recipes.length}
            />
            <TabButton
              active={activeTab === 'alvi'}
              onClick={() => setActiveTab('alvi')}
              icon={<ShoppingCart size={15} />}
              label="Alvi"
              count={0}
            />
          </nav>

          {hasData && (
            <button
              onClick={() => exportToExcel(ingredients, packaging, recipes, rate)}
              className="btn-ghost border border-cream-200 bg-white shadow-card text-charcoal-700 hover:text-forest-600 hover:border-forest-400/40"
            >
              <Download size={14} />
              Exportar Excel
            </button>
          )}
        </div>

        <div className={activeTab !== 'ingredients' ? 'hidden' : ''}>
          <IngredientsTab
            ingredients={ingredients}
            rate={rate}
            onAdd={addIngredient}
            onRemove={removeIngredient}
          />
        </div>
        <div className={activeTab !== 'packaging' ? 'hidden' : ''}>
          <PackagingTab
            packaging={packaging}
            rate={rate}
            onAdd={addPackaging}
            onRemove={removePackaging}
          />
        </div>
        <div className={activeTab !== 'recipes' ? 'hidden' : ''}>
          <RecipesTab
            recipes={recipes}
            ingredients={ingredients}
            packaging={packaging}
            rate={rate}
            onAdd={addRecipe}
            onRemove={removeRecipe}
          />
        </div>
        <div className={activeTab !== 'alvi' ? 'hidden' : ''}>
          <AlviTab rate={rate} onAddIngredient={addIngredient} />
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active, onClick, icon, label, count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-2 sm:px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
        active
          ? 'bg-terracotta-500 text-white shadow-sm'
          : 'text-charcoal-700/60 hover:text-charcoal-800 hover:bg-cream-100'
      }`}
    >
      {icon}
      <span className="hidden min-[480px]:inline">{label}</span>
      {count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
            active ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-700/60'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
