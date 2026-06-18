import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import type { Product, Category } from '../../lib/types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStorage } from '../../hooks/useStorage';
import { money } from '../../lib/format';

export function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const { uploadFile } = useStorage();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: '',
        in_stock: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                adminApi.getProducts(),
                adminApi.getCategories()
            ]);

            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    const openModal = (product?: Product) => {
        setCurrentStep(1);
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                image_url: product.image_url || '',
                category_id: product.category_id || '',
                in_stock: product.in_stock,
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                image_url: '',
                category_id: categories.length > 0 ? categories[0].id : '',
                in_stock: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);

        try {
            const productData = {
                name: formData.name,
                description: formData.description || null,
                price: parseFloat(formData.price),
                image_url: formData.image_url || null,
                category_id: formData.category_id || null,
                in_stock: formData.in_stock,
            };

            if (editingProduct) {
                await adminApi.updateProduct(editingProduct.id, productData);
            } else {
                await adminApi.createProduct({ ...productData, display_order: products.length + 1 });
            }

            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const url = await uploadFile(file, 'products');
        if (url) {
            setFormData({ ...formData, image_url: url });
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await adminApi.deleteProduct(id);
            loadData();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    const toggleStock = async (id: string, currentStock: boolean) => {
        try {
            await adminApi.updateProduct(id, { in_stock: !currentStock });
            loadData();
        } catch (error) {
            console.error('Error toggling stock status:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-steel/20 border-b-brand-cream"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Products</h1>
                    <p className="text-brand-slate mt-1">Manage your store inventory</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-brand-cream hover:bg-white text-brand-dark px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-cream/5 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-brand-dark/40 border-b border-brand-steel/15 text-sm font-semibold text-brand-slate">
                                <th className="px-6 py-4 w-16">Image</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-steel/10">
                            {products.map((product) => {
                                const category = categories.find(c => c.id === product.category_id);

                                return (
                                    <tr key={product.id} className="hover:bg-brand-steel/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-brand-dark/45 overflow-hidden flex items-center justify-center border border-brand-steel/20">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-brand-slate/65" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white">{product.name}</div>
                                            <div className="text-xs text-brand-slate truncate max-w-xs mt-0.5">{product.description || 'No description'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-brand-cream">GHS {money(product.price)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-steel/20 text-brand-cream border border-brand-steel/20">
                                                {category ? category.name : 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStock(product.id, product.in_stock)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${product.in_stock
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                                    }`}
                                            >
                                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="p-1.5 text-brand-cream hover:bg-brand-steel/30 rounded transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-brand-slate">
                                        No products found. Start by adding a new product to your store.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <form
                        onSubmit={handleSave}
                        className="bg-brand-dark border border-brand-steel/20 rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-brand-steel/15 flex justify-between items-center bg-brand-dark/40 flex-shrink-0">
                            <h2 className="text-xl font-bold text-white font-display">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-brand-slate hover:text-white transition-colors p-1 hover:scale-105 active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Progress Stepper */}
                        <div className="px-6 py-4 bg-brand-dark/20 border-b border-brand-steel/10 flex items-center justify-between flex-shrink-0">
                            {[
                                { step: 1, label: 'Details' },
                                { step: 2, label: 'Pricing' },
                                { step: 3, label: 'Media' },
                                { step: 4, label: 'Review' }
                            ].map((s, idx, arr) => (
                                <div key={s.step} className="flex items-center flex-1 last:flex-none">
                                    <button
                                        type="button"
                                        disabled={s.step > currentStep && !editingProduct} // allow clicking steps if editing
                                        onClick={() => {
                                            // Validate before jumping
                                            if (s.step === 2 && !formData.name.trim()) return;
                                            if (s.step === 3 && (!formData.name.trim() || !formData.price || parseFloat(formData.price) < 0)) return;
                                            if (s.step === 4 && (!formData.name.trim() || !formData.price || parseFloat(formData.price) < 0)) return;
                                            setCurrentStep(s.step);
                                        }}
                                        className="flex items-center gap-2 group focus:outline-none"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all border ${
                                            currentStep === s.step
                                                ? 'bg-brand-cream text-brand-dark border-brand-cream shadow-md shadow-brand-cream/10 scale-110'
                                                : currentStep > s.step
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-brand-steel/10 text-brand-slate border-brand-steel/15'
                                        }`}>
                                            {currentStep > s.step ? '✓' : s.step}
                                        </div>
                                        <span className={`text-xs font-bold transition-colors hidden sm:inline ${
                                            currentStep === s.step ? 'text-white' : 'text-brand-slate group-hover:text-white'
                                        }`}>
                                            {s.label}
                                        </span>
                                    </button>
                                    
                                    {idx < arr.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                                            currentStep > s.step ? 'bg-emerald-500/20' : 'bg-brand-steel/15'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-steel/30 scrollbar-track-transparent">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all hover:border-brand-steel/30"
                                            placeholder="e.g., Wireless Headphones"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none resize-none transition-all hover:border-brand-steel/30"
                                            placeholder="Describe your product (features, materials, size, etc.)..."
                                        />
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Price (GHS) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all hover:border-brand-steel/30"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Category</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all hover:border-brand-steel/30"
                                        >
                                            <option value="" className="bg-[#071739]">Uncategorized</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id} className="bg-[#071739]">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.in_stock}
                                                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.in_stock ? 'bg-brand-cream' : 'bg-brand-steel/30'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-[#071739] w-4 h-4 rounded-full transition-transform ${formData.in_stock ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-sm font-semibold text-brand-slate">In Stock & Available for Order</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Product Image *</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="product-image-upload"
                                            />
                                            <label
                                                htmlFor="product-image-upload"
                                                className="w-full px-4 py-3 bg-brand-steel/10 text-brand-cream rounded-xl hover:bg-brand-steel/20 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-brand-steel/20 font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                <Upload size={20} />
                                                {uploading ? 'Uploading...' : 'Upload Image'}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="border border-brand-steel/20 rounded-xl h-64 flex flex-col items-center justify-center overflow-hidden bg-brand-dark/45 relative">
                                        {uploading && (
                                            <div className="absolute inset-0 bg-[#071739]/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-cream"></div>
                                            </div>
                                        )}
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-12 h-12 text-brand-slate/50 mb-2" />
                                                <span className="text-sm text-brand-slate/50 font-medium">No Image Uploaded Yet</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start bg-brand-steel/5 p-6 rounded-2xl border border-brand-steel/15">
                                        {/* Card Mockup */}
                                        <div className="w-64 bg-[#071739] border border-brand-steel/20 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
                                            <div className="h-44 bg-brand-dark/50 relative overflow-hidden flex items-center justify-center border-b border-brand-steel/10">
                                                {formData.image_url ? (
                                                    <img src={formData.image_url} alt={formData.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-12 h-12 text-brand-slate/40" />
                                                )}
                                                {formData.in_stock ? (
                                                    <span className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">In Stock</span>
                                                ) : (
                                                    <span className="absolute top-3 right-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</span>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <span className="text-[10px] font-semibold tracking-wider text-brand-cream uppercase">
                                                    {categories.find(c => c.id === formData.category_id)?.name || 'Uncategorized'}
                                                </span>
                                                <h3 className="font-bold text-white text-sm truncate">{formData.name || 'Product Name'}</h3>
                                                <p className="text-xs text-brand-slate line-clamp-2 min-h-[2rem]">{formData.description || 'No description provided.'}</p>
                                                <div className="font-black text-brand-cream text-base pt-1">GHS {money(parseFloat(formData.price || '0'))}</div>
                                            </div>
                                        </div>

                                        {/* Details Summary */}
                                        <div className="flex-1 w-full space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-wider text-brand-slate">Final Review</h4>
                                            <div className="divide-y divide-brand-steel/15 text-sm">
                                                <div className="py-2.5 flex justify-between gap-4">
                                                    <span className="text-brand-slate">Product Name</span>
                                                    <span className="text-white font-semibold text-right">{formData.name}</span>
                                                </div>
                                                <div className="py-2.5 flex justify-between gap-4">
                                                    <span className="text-brand-slate">Price</span>
                                                    <span className="text-brand-cream font-bold">GHS {money(parseFloat(formData.price || '0'))}</span>
                                                </div>
                                                <div className="py-2.5 flex justify-between gap-4">
                                                    <span className="text-brand-slate">Category</span>
                                                    <span className="text-white font-medium">{categories.find(c => c.id === formData.category_id)?.name || 'Uncategorized'}</span>
                                                </div>
                                                <div className="py-2.5 flex justify-between gap-4">
                                                    <span className="text-brand-slate">Availability</span>
                                                    <span className={formData.in_stock ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                                        {formData.in_stock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <div className="py-2.5 flex justify-between gap-4">
                                                    <span className="text-brand-slate">Has Image</span>
                                                    <span className={formData.image_url ? 'text-emerald-400 font-bold' : 'text-brand-slate'}>
                                                        {formData.image_url ? 'Yes' : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-brand-steel/15 flex justify-between items-center bg-brand-dark/40 flex-shrink-0">
                            <div>
                                {currentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="px-5 py-2.5 border border-brand-steel/20 text-brand-slate rounded-xl hover:bg-brand-steel/10 font-bold transition-colors flex items-center gap-1 hover:text-white"
                                    >
                                        <ChevronLeft size={16} />
                                        Back
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 border border-brand-steel/20 text-brand-slate rounded-xl hover:bg-brand-steel/10 font-bold transition-colors hover:text-white"
                                >
                                    Cancel
                                </button>
                                
                                {currentStep < 4 ? (
                                    <button
                                        type="button"
                                        disabled={
                                            (currentStep === 1 && !formData.name.trim()) ||
                                            (currentStep === 2 && (!formData.price || parseFloat(formData.price) < 0)) ||
                                            uploading
                                        }
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        className="px-5 py-2.5 bg-brand-cream text-brand-dark rounded-xl hover:bg-white font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-6 py-2.5 bg-brand-cream text-brand-dark rounded-xl hover:bg-white font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {editingProduct ? 'Save Changes' : 'Create Product'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
