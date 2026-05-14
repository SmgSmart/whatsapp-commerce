import { ShoppingCart, Plus } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../lib/types';
import { money } from '../lib/format';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onClick?: () => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    if (showQuantitySelector) {
      onAddToCart(product, quantity);
      setQuantity(1);
      setShowQuantitySelector(false);
    } else {
      setShowQuantitySelector(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full border border-gray-100 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <ShoppingCart size={48} className="text-gray-500" />
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-bold text-green-600">
              GHS {money(product.price)}
            </span>
          </div>

          {showQuantitySelector && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Select Quantity:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 hover:bg-blue-100 rounded transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center px-2 py-1 border border-gray-300 rounded"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1 hover:bg-blue-100 rounded transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddClick}
            disabled={!product.in_stock}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {showQuantitySelector ? (
              <>
                <Plus size={20} />
                Add to Cart
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Add to Cart
              </>
            )}
          </button>

          {showQuantitySelector && (
            <button
              onClick={() => setShowQuantitySelector(false)}
              className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
