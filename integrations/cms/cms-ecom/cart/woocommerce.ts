import type { Products } from '@/entities';
// The client-side integration calls a local API proxy to keep WooCommerce credentials secret.
const API_BASE = '/api/woocommerce';

interface ProductListResponse {
  items: Products[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export async function getWooProducts(categoryId?: string): Promise<Products[]> {
  const query = categoryId ? `?category=${encodeURIComponent(categoryId)}` : '';
  const response = await fetch(`${API_BASE}${query}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to load WooCommerce products: ${errorBody}`);
  }
  const json = (await response.json()) as ProductListResponse;
  return json.items || [];
}

export async function getWooProductById(productId: string): Promise<Products | null> {
  const response = await fetch(`${API_BASE}?id=${encodeURIComponent(productId)}`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to load WooCommerce product: ${errorBody}`);
  }
  const product = (await response.json()) as Products;
  return product || null;
}

export async function getWooCategories(): Promise<CategoryItem[]> {
  const response = await fetch(`${API_BASE}?categories=true`);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to load WooCommerce categories: ${errorBody}`);
  }

  const json = await response.json();
  return Array.isArray(json.categories) ? json.categories : [];
}

/** Đẩy dữ liệu giỏ hàng lên server và lấy link checkout */
export async function getCheckoutUrlFromServer(items: any[]) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) throw new Error('Failed to sync cart with server');
  return await response.json();
}
