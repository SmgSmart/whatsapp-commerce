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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden relative flex flex-col md:flex-row">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 bg-white/80 hover:bg-gray-100 rounded-full transition-colors z-10 text-gray-700"
                    aria-label="Close modal"
                >
                    <X size={24} />
                </button>

                <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[400px] bg-gray-100 flex-shrink-0">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                            <ShoppingCart size={64} className="text-gray-400" />
                        </div>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-2xl tracking-wider">OUT OF STOCK</span>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {product.name}
                        </h2>
                        <div className="text-3xl font-bold text-green-600">
                            GHS {money(product.price)}
                        </div>
                    </div>

                    <div className="prose prose-sm text-gray-600 mb-8 flex-grow">
                        {product.description ? (
                            <p className="whitespace-pre-wrap">{product.description}</p>
                        ) : (
                            <p className="italic text-gray-400">No description available for this product.</p>
                        )}
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
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
                                    className="w-16 h-10 text-center text-lg font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                                    min="1"
                                />
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
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
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
