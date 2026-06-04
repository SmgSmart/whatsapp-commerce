import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '../contexts/CartContext';
import { money, toAmount } from '../lib/format';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b border-brand-steel/10">
      <div className="w-20 h-20 bg-brand-dark rounded-lg flex-shrink-0 overflow-hidden border border-brand-steel/20">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-steel/30 to-brand-dark" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm truncate">
          {item.name}
        </h3>
        <p className="text-brand-cream font-bold text-sm mt-1">
          GHS {money(item.price)}
        </p>
        <p className="text-brand-slate text-xs mt-1">
          Total: GHS {money(toAmount(item.price) * item.cartQuantity)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex items-center gap-1 bg-brand-dark/50 border border-brand-steel/30 rounded-lg">
          <button
            onClick={() =>
              onUpdateQuantity(item.id, Math.max(1, item.cartQuantity - 1))
            }
            className="p-1 hover:bg-brand-steel/30 text-white transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-medium text-white">
            {item.cartQuantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
            className="p-1 hover:bg-brand-steel/30 text-white transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
