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
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500 mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {isAdding && (
                            <tr className="bg-blue-50/50">
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="New category name"
                                        autoFocus
                                        className="w-full px-3 py-1.5 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleAdd} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setIsAdding(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {isEditing === category.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-3 py-1.5 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate(category.id)}
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{category.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(category.id, category.active)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${category.active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {category.active ? 'Active' : 'Hidden'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {isEditing === category.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleUpdate(category.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => setIsEditing(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
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
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit category"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
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
