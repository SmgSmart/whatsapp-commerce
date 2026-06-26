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
        className="fixed inset-0 z-40 bg-brand-dark/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-brand-dark/95 backdrop-blur-md border-l border-brand-steel/30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-brand-steel/20">
          <div className="flex items-center gap-2">
            <ShoppingCart size={24} className="text-brand-cream" />
            <h2 className="text-xl font-bold text-brand-header">Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-steel/20 rounded-lg transition-colors text-brand-header"
          >
            <X size={24} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingCart size={48} className="text-brand-slate/40 mb-4" />
            <p className="text-brand-slate font-semibold">Your cart is empty</p>
            <p className="text-sm text-brand-slate/75 mt-1">
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

            <div className="border-t border-brand-steel/20 p-4 sm:p-6 space-y-4 bg-brand-dark/30">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-brand-slate">Subtotal</span>
                <span className="font-bold text-brand-cream">
                  GHS {totalPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-brand-slate/75">
                Delivery fee and taxes will be calculated at checkout
              </p>

              <button
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-brand-bronze to-brand-cream text-brand-dark font-black py-3 rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-brand-cream/5"
              >
                <MessageCircle size={20} />
                Checkout via WhatsApp
              </button>
              <button
                onClick={onClose}
                className="w-full bg-brand-steel/20 hover:bg-brand-steel/35 text-brand-header font-semibold py-2 rounded-lg transition-colors"
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
