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
      className={`bg-brand-steel/10 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:border-brand-bronze/50 transition-all duration-300 overflow-hidden flex flex-col h-full border border-brand-steel/20 ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="relative h-48 w-full bg-brand-dark overflow-hidden border-b border-brand-steel/10">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-steel/20 to-brand-dark">
            <ShoppingCart size={48} className="text-brand-slate/40" />
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-brand-dark/80 flex items-center justify-center backdrop-blur-xs">
            <span className="text-brand-cream font-black text-lg uppercase tracking-wider">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold text-brand-header mb-1 line-clamp-2 group-hover:text-brand-cream transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-brand-slate mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-xl font-bold text-brand-cream">
              GHS {money(product.price)}
            </span>
          </div>

          {showQuantitySelector && (
            <div className="mb-3 p-3 bg-brand-dark/50 border border-brand-steel/30 rounded-lg">
              <p className="text-xs text-brand-slate mb-2">Select Quantity:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
                  className="px-2 py-1 hover:bg-brand-steel/30 text-brand-header rounded transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center px-2 py-1 bg-brand-dark border border-brand-steel/40 text-brand-header rounded outline-none"
                  min="1"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
                  className="px-2 py-1 hover:bg-brand-steel/30 text-brand-header rounded transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAddClick}
            disabled={!product.in_stock}
            className="w-full bg-gradient-to-r from-brand-bronze to-brand-cream text-brand-dark font-bold py-2.5 rounded-lg transition-all hover:opacity-90 disabled:from-brand-steel/40 disabled:to-brand-steel/25 disabled:text-brand-slate flex items-center justify-center gap-2"
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
              onClick={(e) => { e.stopPropagation(); setShowQuantitySelector(false); }}
              className="w-full mt-2 bg-brand-steel/30 hover:bg-brand-steel/45 text-brand-header font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
