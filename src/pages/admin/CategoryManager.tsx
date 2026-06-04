import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import type { Category } from '../../lib/types';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');

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

    const handleAdd = async () => {
        if (!newName.trim()) return;

        try {
            await adminApi.createCategory({ name: newName });

            setNewName('');
            setIsAdding(false);
            loadCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;

        try {
            await adminApi.updateCategory(id, { name: editName });

            setIsEditing(null);
            loadCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Failed to update category');
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
                    <h1 className="text-2xl font-bold text-white">Categories</h1>
                    <p className="text-brand-slate mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
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
                        {isAdding && (
                            <tr className="bg-brand-cream/5">
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="New category name"
                                        autoFocus
                                        className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleAdd} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setIsAdding(false)} className="p-1.5 text-brand-slate hover:bg-brand-steel/30 rounded transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-brand-steel/10 transition-colors">
                                <td className="px-6 py-4">
                                    {isEditing === category.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-4 py-2 bg-brand-dark/45 border border-brand-steel/20 text-white rounded-xl focus:ring-2 focus:ring-brand-cream focus:border-brand-cream outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                                        />
                                    ) : (
                                        <span className="font-semibold text-white">{category.name}</span>
                                    )}
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
                                    {isEditing === category.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleUpdate(category.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => setIsEditing(null)} className="p-1.5 text-brand-slate hover:bg-brand-steel/30 rounded transition-colors">
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(category.id);
                                                    setEditName(category.name);
                                                }}
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
                                    )}
                                </td>
                            </tr>
                        ))}

                        {categories.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-brand-slate">
                                    No categories found. Click "Add Category" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
