import { useState } from 'react';
import { X } from 'lucide-react';
import { CartItem } from '../contexts/CartContext';
import type { BusinessInfo } from '../lib/types';
import { money, toAmount } from '../lib/format';

interface OrderModalProps {
  items: CartItem[];
  business: BusinessInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OrderModal({ items, business, isOpen, onClose, onSuccess }: OrderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    note: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalPrice = items.reduce((sum, item) => sum + toAmount(item.price) * item.cartQuantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    let itemsList = 'Order Details:\n';
    items.forEach((item, index) => {
      itemsList += `\n${index + 1}. ${item.name}\n   Price: GHS ${money(item.price)} × ${item.cartQuantity} = GHS ${money(toAmount(item.price) * item.cartQuantity)}`;
    });

    const message = `Hi! I'd like to place an order:\n${itemsList}\n\n💰 *Total: GHS ${totalPrice.toFixed(2)}*\n\n👤 Customer Name: ${formData.name}\n📍 Location: ${formData.location}${formData.note ? `\n📝 Special Requests: ${formData.note}` : ''}\n\nThank you!`;

    const rawNumber = business?.whatsapp_number;
    if (!rawNumber) {
      alert('Business WhatsApp number is not configured. Please add it to your store settings.');
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = rawNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Attempt to open in a new tab; fallback to same tab if popup blocker is active
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = whatsappUrl;
    }

    onSuccess();
    setFormData({ name: '', location: '', note: '' });
  };

  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-dark/70 backdrop-blur-xs">
      <div className="bg-brand-dark/95 backdrop-blur-md w-full max-w-md rounded-t-2xl sm:rounded-lg p-6 sm:p-8 border border-brand-steel/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-header">Checkout</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-steel/20 text-brand-header rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-brand-dark/60 border border-brand-steel/20 p-4 rounded-lg mb-6 max-h-48 overflow-y-auto">
          <p className="text-sm font-semibold text-brand-slate mb-3">Order Items:</p>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-brand-slate">{item.name} × {item.cartQuantity}</span>
                <span className="font-semibold text-brand-cream">
                  GHS {money(toAmount(item.price) * item.cartQuantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-slate mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-brand-dark border border-brand-steel/40 text-brand-header placeholder-brand-slate/50 rounded-lg focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate mb-2">
              Delivery Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Accra, Kumasi, Tema"
              className="w-full px-4 py-2 bg-brand-dark border border-brand-steel/40 text-brand-header placeholder-brand-slate/50 rounded-lg focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate mb-2">
              Special Requests or Notes
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Any special requests or preferences..."
              rows={3}
              className="w-full px-4 py-2 bg-brand-dark border border-brand-steel/40 text-brand-header placeholder-brand-slate/50 rounded-lg focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="bg-brand-dark/50 p-4 rounded-lg border border-brand-steel/20">
            <p className="text-sm text-brand-slate">Total Amount</p>
            <p className="text-3xl font-bold text-brand-cream">
              GHS {totalPrice.toFixed(2)}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-brand-bronze to-brand-cream text-brand-dark font-black py-3 rounded-lg transition-all hover:opacity-90"
          >
            Send Order via WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-brand-steel/20 hover:bg-brand-steel/35 text-brand-header font-semibold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
