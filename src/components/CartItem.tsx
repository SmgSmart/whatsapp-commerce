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
    <div className="flex gap-4 py-4 border-b border-gray-200">
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm truncate">
          {item.name}
        </h3>
        <p className="text-green-600 font-bold text-sm mt-1">
          GHS {money(item.price)}
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Total: GHS {money(toAmount(item.price) * item.cartQuantity)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={16} />
        </button>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
          <button
            onClick={() =>
              onUpdateQuantity(item.id, Math.max(1, item.cartQuantity - 1))
            }
            className="p-1 hover:bg-gray-200 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {item.cartQuantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
            className="p-1 hover:bg-gray-200 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
