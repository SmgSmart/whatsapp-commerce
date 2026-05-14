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
              className="bg-gray-200 rounded-xl h-64 animate-pulse"
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
          <h2 className="text-2xl font-bold text-gray-900">Our Products</h2>
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
            <button
              onClick={() => onSelectCategory(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === null
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No products found matching your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              onSelectCategory(null);
            }}
            className="mt-4 text-green-600 hover:text-green-700 font-medium"
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
