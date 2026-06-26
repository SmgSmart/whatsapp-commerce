import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Category, Product } from '../lib/types';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function ProductGrid({
  products,
  categories,
  loading,
  onAddToCart,
  selectedCategory,
  onSelectCategory,
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-brand-steel/15 rounded-xl h-64 animate-pulse border border-brand-steel/10"
            />
          ))}
        </div>
      </div>
    );
  }

  // Filter products by search term
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    return matchesSearch;
  });

  return (
    <section className="px-4 sm:px-6 py-8" id="products">
      <div className="mb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand-header">Our Products</h2>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-brand-slate" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-brand-steel/30 rounded-lg leading-5 bg-brand-dark/40 text-brand-header placeholder-brand-slate/60 focus:outline-none focus:placeholder-brand-slate/80 focus:ring-1 focus:ring-brand-cream focus:border-brand-cream sm:text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
            <button
              onClick={() => onSelectCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === null
                ? 'bg-brand-cream text-brand-dark shadow-sm shadow-brand-cream/10'
                : 'bg-brand-steel/20 text-brand-slate hover:bg-brand-steel/30 hover:text-brand-header'
                }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === category.id
                  ? 'bg-brand-cream text-brand-dark shadow-sm shadow-brand-cream/10'
                  : 'bg-brand-steel/20 text-brand-slate hover:bg-brand-steel/30 hover:text-brand-header'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-brand-steel/5 rounded-2xl border border-dashed border-brand-steel/20">
          <p className="text-brand-slate text-lg">No products found matching your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              onSelectCategory(null);
            }}
            className="mt-4 text-brand-cream hover:underline font-bold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </section>
  );
}
