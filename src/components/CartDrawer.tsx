import { X, ShoppingCart, MessageCircle } from 'lucide-react';
import { CartItem } from '../contexts/CartContext';
import { CartItemComponent } from './CartItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-white shadow-lg flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingCart size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-1">
              Add items to get started
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {items.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-900">Subtotal</span>
                <span className="font-bold text-gray-900">
                  GHS {totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Delivery fee and taxes will be calculated at checkout
              </p>

              <button
                onClick={onCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Checkout via WhatsApp
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
