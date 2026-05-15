import type { AdminDashboardStats, AdminUser, BusinessInfo, Category, Product } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Get the session token from cookies (handle both __Secure prefix and local)
  const cookies = document.cookie.split('; ');
  const sessionToken = cookies.find(row => row.trim().startsWith('__Secure-neon-auth.session_token='))?.split('=')[1]
    || cookies.find(row => row.trim().startsWith('neon-auth.session_token='))?.split('=')[1]
    || cookies.find(row => row.trim().startsWith('better-auth.session_token='))?.split('=')[1];

  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      // Keep the status-based message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function storeQuery(slug?: string) {
  return slug ? `?store=${encodeURIComponent(slug)}` : '';
}

export const publicApi = {
  getAllStores: () =>
    apiRequest<BusinessInfo[]>(`/api/stores`),
  getBusinessInfo: (slug?: string) =>
    apiRequest<BusinessInfo | null>(`/api/store${storeQuery(slug)}`),
  getCategories: (slug?: string) =>
    apiRequest<Category[]>(`/api/categories${storeQuery(slug)}`),
  getProducts: (slug?: string, categoryId?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set('store', slug);
    if (categoryId) params.set('category', categoryId);
    const query = params.toString();
    return apiRequest<Product[]>(`/api/products${query ? `?${query}` : ''}`);
  },
};

export const authApi = {
  getSession: () => apiRequest<{ user: AdminUser | null }>('/api/auth/session'),
  login: (email: string, password: string) =>
    apiRequest<{ user: AdminUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  logout: () =>
    apiRequest<void>('/api/auth/logout', {
      method: 'POST',
    }),
};

export const adminApi = {
  getMyStores: () => apiRequest<BusinessInfo[]>('/api/admin/stores'),
  createStore: (store: Partial<BusinessInfo>) =>
    apiRequest<BusinessInfo>('/api/admin/stores', {
      method: 'POST',
      body: store,
    }),
  getDashboardStats: () => apiRequest<AdminDashboardStats>('/api/admin/dashboard'),
  getBusinessInfo: () => apiRequest<BusinessInfo | null>('/api/admin/store'),
  saveBusinessInfo: (business: Partial<BusinessInfo>) =>
    apiRequest<BusinessInfo>('/api/admin/store', {
      method: 'PUT',
      body: business,
    }),
  getCategories: () => apiRequest<Category[]>('/api/admin/categories'),
  createCategory: (category: Pick<Category, 'name'>) =>
    apiRequest<Category>('/api/admin/categories', {
      method: 'POST',
      body: category,
    }),
  updateCategory: (id: string, category: Partial<Category>) =>
    apiRequest<Category>(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      body: category,
    }),
  deleteCategory: (id: string) =>
    apiRequest<void>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  getProducts: () => apiRequest<Product[]>('/api/admin/products'),
  createProduct: (product: Partial<Product>) =>
    apiRequest<Product>('/api/admin/products', {
      method: 'POST',
      body: product,
    }),
  updateProduct: (id: string, product: Partial<Product>) =>
    apiRequest<Product>(`/api/admin/products/${id}`, {
      method: 'PATCH',
      body: product,
    }),
  deleteProduct: (id: string) =>
    apiRequest<void>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    }),
  uploadImage: async (file: File, folder: 'products' | 'branding') => {
    const signature = await apiRequest<{
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    }>('/api/admin/uploads/signature', {
      method: 'POST',
      body: { folder },
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', String(signature.timestamp));
    formData.append('folder', signature.folder);
    formData.append('signature', signature.signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const uploaded = await response.json();
    return {
      url: uploaded.secure_url as string,
      public_id: uploaded.public_id as string,
    };
  },
};
