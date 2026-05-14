export interface BusinessInfo {
  id: string;
  slug?: string;
  owner_id?: string;
  business_name: string;
  logo_url: string | null;
  tagline: string | null;
  hero_banner_url: string | null;
  whatsapp_number: string;
  location: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  store_id?: string;
  name: string;
  display_order: number;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  store_id?: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_public_id?: string | null;
  category_id: string | null;
  in_stock: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string | null;
  display_name?: string | null;
}

export interface AdminDashboardStats {
  products: number;
  categories: number;
}
