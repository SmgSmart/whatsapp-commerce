import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import type { Product, Category } from '../../lib/types';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-brand-dark border border-brand-steel/20 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-brand-steel/15 flex justify-between items-center bg-brand-dark/40">
                            <h2 className="text-xl font-bold text-white">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-brand-slate hover:text-white transition-colors p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 md:col-span-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                            placeholder="e.g., Wireless Headphones"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none resize-none"
                                            placeholder="Describe your product..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Price (GHS) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-slate mb-1.5">Category</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        >
                                            <option value="" className="bg-[#071739]">Uncategorized</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id} className="bg-[#071739]">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
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
                                            <span className="text-sm font-semibold text-brand-slate">In Stock</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
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
                                                    className="w-full px-4 py-3 bg-brand-steel/10 text-brand-cream rounded-xl hover:bg-brand-steel/20 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-brand-steel/20 font-bold transition-all"
                                                >
                                                    <Upload size={20} />
                                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        <div className="mt-4 border-2 border-dashed border-brand-steel/20 rounded-xl h-48 flex flex-col items-center justify-center overflow-hidden bg-brand-dark/45 relative">
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
                                                    <ImageIcon className="w-8 h-8 text-brand-slate/50 mb-2" />
                                                    <span className="text-sm text-brand-slate/50">No Image Selected</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-brand-steel/15 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-brand-steel/20 text-brand-slate rounded-xl hover:bg-brand-steel/10 font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-brand-cream text-brand-dark rounded-xl hover:bg-white font-bold transition-colors shadow-sm"
                                >
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
