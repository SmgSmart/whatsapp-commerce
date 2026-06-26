import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import type { Category } from '../../lib/types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        active: true,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            const data = await adminApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    }

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                active: category.active,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                active: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            if (editingCategory) {
                await adminApi.updateCategory(editingCategory.id, {
                    name: formData.name,
                    active: formData.active,
                });
            } else {
                await adminApi.createCategory({ name: formData.name });
            }

            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await adminApi.updateCategory(id, { active: !currentStatus });
            loadCategories();
        } catch (error) {
            console.error('Error toggling category status:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) {
            return;
        }

        try {
            await adminApi.deleteCategory(id);
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
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
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-brand-header">Categories</h1>
                    <p className="text-brand-slate mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-brand-cream hover:bg-white text-brand-dark px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-cream/5 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="bg-brand-steel/10 rounded-3xl border border-brand-steel/15 overflow-hidden backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-brand-dark/40 border-b border-brand-steel/15 text-sm font-semibold text-brand-slate">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-steel/10">
                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-brand-steel/10 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-brand-header">{category.name}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(category.id, category.active)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${category.active
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                : 'bg-brand-steel/20 text-brand-slate border-brand-steel/20 hover:bg-brand-steel/30'
                                            }`}
                                    >
                                        {category.active ? 'Active' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => openModal(category)}
                                            className="p-1.5 text-brand-cream hover:bg-brand-steel/30 rounded transition-colors"
                                            title="Edit category"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.id)}
                                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                                            title="Delete category"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-brand-slate">
                                    No categories found. Click "Add Category" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Category Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <form
                        onSubmit={handleSave}
                        className="bg-brand-dark border border-brand-steel/20 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-brand-steel/15 flex justify-between items-center bg-brand-dark/40 flex-shrink-0">
                            <h2 className="text-xl font-bold text-brand-header font-display">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-brand-slate hover:text-brand-header transition-colors p-1 hover:scale-105 active:scale-95"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-steel/30 scrollbar-track-transparent">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-brand-slate mb-1.5">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-brand-dark/45 border border-brand-steel/20 text-brand-header rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-transparent outline-none transition-all hover:border-brand-steel/30"
                                        placeholder="e.g., Electronics, Fashion"
                                        autoFocus
                                    />
                                </div>

                                {editingCategory && (
                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={formData.active}
                                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                />
                                                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.active ? 'bg-brand-cream' : 'bg-brand-steel/30'}`}></div>
                                                <div className={`absolute left-1 top-1 bg-brand-dark w-4 h-4 rounded-full transition-transform ${formData.active ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-sm font-semibold text-brand-slate">Active (Visible in storefront)</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-brand-steel/15 flex justify-end gap-3 bg-brand-dark/40 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 border border-brand-steel/20 text-brand-slate rounded-xl hover:bg-brand-steel/10 font-bold transition-colors hover:text-brand-header"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-brand-cream text-brand-dark rounded-xl hover:bg-white font-bold transition-colors shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
