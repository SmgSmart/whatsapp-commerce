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
        return <div className="p-8">Loading products...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500 mt-1">Manage your store inventory</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                                <th className="px-6 py-4 w-16">Image</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => {
                                const category = categories.find(c => c.id === product.category_id);

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{product.name}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{product.description || 'No description'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">GHS {money(product.price)}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {category ? category.name : 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStock(product.id, product.in_stock)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${product.in_stock
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                    }`}
                                            >
                                                {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 md:col-span-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="e.g., Wireless Headphones"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                            placeholder="Describe your product..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (GHS) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="">Uncategorized</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.in_stock}
                                                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.in_stock ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.in_stock ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">In Stock</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image *</label>
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
                                                    className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 font-semibold transition-all"
                                                >
                                                    <Upload size={20} />
                                                    {uploading ? 'Uploading...' : 'Click to Upload Product Image'}
                                                </label>
                                            </div>
                                        </div>

                                        {/* Image Preview */}
                                        <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg h-48 flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative">
                                            {uploading && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span className="text-sm text-gray-500">No Image Selected</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
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
