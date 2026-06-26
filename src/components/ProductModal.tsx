import { ShoppingCart, Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../lib/types';
import { money, toAmount } from '../lib/format';

interface ProductModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);

    if (!isOpen) return null;

    const handleAddClick = () => {
        onAddToCart(product, quantity);
        setQuantity(1);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/70 backdrop-blur-sm overflow-y-auto">
            <div className="bg-brand-dark/95 backdrop-blur-md rounded-2xl border border-brand-steel/20 shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col md:flex-row">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-brand-dark/80 hover:bg-brand-steel/30 rounded-full transition-colors z-10 text-brand-header border border-brand-steel/10"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[400px] bg-brand-dark flex-shrink-0">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-steel/20 to-brand-dark">
                            <ShoppingCart size={64} className="text-brand-slate/40" />
                        </div>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-brand-dark/80 flex items-center justify-center">
                            <span className="text-brand-cream font-black text-2xl tracking-wider">OUT OF STOCK</span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-brand-header mb-2">
                            {product.name}
                        </h2>
                        <div className="text-3xl font-bold text-brand-cream">
                            GHS {money(product.price)}
                        </div>
                    </div>

                    <div className="prose prose-sm text-brand-slate mb-8 flex-grow">
                        {product.description ? (
                            <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                        ) : (
                            <p className="italic text-brand-slate/50">No description available for this product.</p>
                        )}
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="bg-brand-dark/50 rounded-xl p-4 border border-brand-steel/20">
                            <label htmlFor="quantity" className="block text-sm font-medium text-brand-slate mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full bg-brand-steel/20 border border-brand-steel/30 flex items-center justify-center text-brand-header hover:bg-brand-steel/40 transition-colors shadow-sm"
                                    aria-label="Decrease quantity"
                                    type="button"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-16 h-10 text-center text-lg font-semibold bg-brand-dark border border-brand-steel/40 text-brand-header rounded-lg focus:ring-2 focus:ring-brand-cream outline-none shadow-sm"
                                    min="1"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full bg-brand-steel/20 border border-brand-steel/30 flex items-center justify-center text-brand-header hover:bg-brand-steel/40 transition-colors shadow-sm"
                                    aria-label="Increase quantity"
                                    type="button"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleAddClick}
                            disabled={!product.in_stock}
                            className="w-full bg-gradient-to-r from-brand-bronze to-brand-cream hover:opacity-90 disabled:from-brand-steel/40 disabled:to-brand-steel/25 disabled:cursor-not-allowed text-brand-dark font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Plus size={24} />
                            <span className="text-lg">Add to Cart - GHS {money(toAmount(product.price) * quantity)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
