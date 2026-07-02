export const prerender = false;
import type { APIRoute } from 'astro';
import type { Products } from '@/entities';
import crypto from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;
export const WOO_KEY = avas.WOO_KEY;
export const WOO_SECRET = avas.WOO_SECRET;
// Tự động tạo COCART_URL từ WC_URL để không phụ thuộc vào file .env

const DEFAULT_WOO_IMAGE = 'https://static.wixstatic.com/media/73be94_97c40b507e5c4d8a85419190f7952003~mv2.png?originWidth=448&originHeight=384';

const percentEncode = (value: string) =>
  encodeURIComponent(value)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');

const createOAuthSignature = (method: string, baseUrl: string, params: URLSearchParams) => {
  const sortedParams = [...params.entries()].sort((a, b) => {
    if (a[0] === b[0]) return a[1].localeCompare(b[1]);
    return a[0].localeCompare(b[0]);
  });

  const paramString = sortedParams
    .map(([key, value]) => `${percentEncode(key)}=${percentEncode(value)}`)
    .join('&');

  const baseString = [
    method.toUpperCase(), // Đảm bảo method là chữ hoa cho chữ ký
    percentEncode(baseUrl),
    percentEncode(paramString),
  ].join('&');

  const signingKey = `${percentEncode(WOO_SECRET ?? '')}&`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
};

const getWooEndpoint = (path: string, searchParams?: URLSearchParams) => {
  if (!WC_URL || !WOO_KEY || !WOO_SECRET) {
    throw new Error('WooCommerce env vars WC_URL, WOO_KEY, and WOO_SECRET are required');
  }

  const url = new URL(path, WC_URL);
  const params = new URLSearchParams(searchParams?.toString() ?? '');
  params.set('per_page', '100');

  const oauthParams = new URLSearchParams({
    oauth_consumer_key: WOO_KEY,
    oauth_nonce: Math.random().toString(36).slice(2, 12),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
  });

  for (const [key, value] of params.entries()) { // Thêm các tham số tìm kiếm khác vào oauthParams
    oauthParams.set(key, value);
  }

  const signature = createOAuthSignature('GET', url.origin + url.pathname, oauthParams);
  oauthParams.set('oauth_signature', signature);

  return `${url.origin}${url.pathname}?${oauthParams.toString()}`;
};

const stripHtml = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]+>/g, '').trim();
};

const formatDimensions = (dimensions: any): string | undefined => {
  if (!dimensions || typeof dimensions !== 'object') return undefined;

  const parts: string[] = [];
  if (dimensions.length) parts.push(`Dài ${dimensions.length}`);
  if (dimensions.width) parts.push(`Rộng ${dimensions.width}`);
  if (dimensions.height) parts.push(`Cao ${dimensions.height}`);

  return parts.length > 0 ? parts.join(' × ') : undefined;
};

const normalizeAttributeName = (name: unknown): string =>
  typeof name === 'string' ? name.trim().toLowerCase() : '';

const findAttributeByNames = (attributes: any[], names: string[]) =>
  attributes.find((attribute: any) =>
    typeof attribute.name === 'string' &&
    names.some((name) => normalizeAttributeName(attribute.name).includes(name))
  );

const formatAttributeValue = (attribute: any): string | undefined => {
  if (!attribute) return undefined;
  if (typeof attribute.options === 'string') {
    return attribute.options.trim() || undefined;
  }
  if (Array.isArray(attribute.options)) {
    const values = attribute.options.map((item) => String(item).trim()).filter(Boolean);
    return values.length > 0 ? values.join(', ') : undefined;
  }
  return undefined;
};

const mapWooProductToSnphm = (product: any): Products => {

  return {
    _id: String(product.id ?? product._id ?? ''),
    itemName: product.name ?? '',
  };
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('id');
    const category = url.searchParams.get('category');

    if (productId) {
      const response = await fetch(getWooEndpoint(`/wp-json/wc/v3/products/${encodeURIComponent(productId)}`));
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Không thể tải sản phẩm từ WooCommerce' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const product = await response.json();
      return new Response(JSON.stringify(mapWooProductToSnphm(product)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const categoriesRequest = url.searchParams.get('categories');
    if (categoriesRequest === 'true') {
      const response = await fetch(
        getWooEndpoint(
          '/wp-json/wc/v3/products/categories',
          new URLSearchParams({ hide_empty: 'false', order: 'asc' })
        )
      );
      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Không thể tải danh sách danh mục sản phẩm từ WooCommerce' }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const categories = await response.json();
      const mapped = Array.isArray(categories)
        ? categories
          .filter((categoryItem: any) => categoryItem?.name !== 'Uncategorized')
          .sort((a: any, b: any) => {
            const orderA = typeof a.menu_order === 'number' ? a.menu_order : 0;
            const orderB = typeof b.menu_order === 'number' ? b.menu_order : 0;
            return orderA - orderB;
          })
          .map((categoryItem: any) => ({
            id: String(categoryItem.id ?? ''),
            name: categoryItem.name ?? '',
            slug: categoryItem.slug ?? '',
            image: categoryItem?.image?.src ?? undefined,
          }))
        : [];

      return new Response(JSON.stringify({ categories: mapped }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const searchParams = new URLSearchParams();
    if (category) {
      searchParams.set('category', category);
    }

    const response = await fetch(getWooEndpoint('/wp-json/wc/v3/products', searchParams));
    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Không thể tải danh sách sản phẩm từ WooCommerce' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const products = await response.json();
    const items = Array.isArray(products) ? products.map(mapWooProductToSnphm) : [];

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Lỗi máy chủ' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Hàm helper mới để tạo URL CoCart có xác thực OAuth 1.0a
const getCoCartAuthenticatedUrl = (endpointPath: string, method: string = 'POST') => {
  if (!WC_URL || !WOO_KEY || !WOO_SECRET) {
    throw new Error('WooCommerce env vars WC_URL, WOO_KEY, and WOO_SECRET are required for CoCart operations.');
  }

  const baseUrl = WC_URL.replace(/\/$/, '');
  const cleanPath = endpointPath.replace(/^\/|\/$/g, '');
  // Thêm dấu / ở cuối để tránh WordPress redirect làm mất method POST
  const fullPath = `/wp-json/cocart/v2/cart/${cleanPath}/`;
  const fullUrl = new URL(fullPath, baseUrl);

  const oauthParams = new URLSearchParams({
    oauth_consumer_key: WOO_KEY,
    oauth_nonce: Math.random().toString(36).slice(2, 12),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
  });

  const signature = createOAuthSignature(method, fullUrl.origin + fullUrl.pathname, oauthParams);
  oauthParams.set('oauth_signature', signature);

  return `${fullUrl.origin}${fullUrl.pathname}?${oauthParams.toString()}`;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { items } = await request.json();

    if (!WC_URL || !WOO_KEY || !WOO_SECRET) {
      return new Response(JSON.stringify({ error: 'Thiếu biến môi trường' }), { status: 500 });
    }

    const baseUrl = WC_URL.replace(/\/$/, '');
    const authParams = `consumer_key=${WOO_KEY}&consumer_secret=${WOO_SECRET}`;
    const headers = { 'Content-Type': 'application/json', 'X-CoCart-API': 'v2' };

    // 1. Xóa sạch giỏ hàng cũ
    await fetch(`${baseUrl}/wp-json/cocart/v2/cart/clear?${authParams}`, { method: 'POST', headers });

    // 2. Thêm từng món và duy trì cart_key giữa các lần gọi
    let currentCartKey = '';

    for (const item of items) {
      const productId = String(item.itemId || item.id);
      const qty = String(item.quantity || "1");

      // Nếu đã có cart_key từ món trước, ta đính kèm vào URL để thêm tiếp vào ĐÚNG giỏ hàng đó
      const addUrl = currentCartKey
        ? `${baseUrl}/wp-json/cocart/v2/cart/add-item?${authParams}&cart_key=${currentCartKey}`
        : `${baseUrl}/wp-json/cocart/v2/cart/add-item?${authParams}`;

      const response = await fetch(addUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: productId, quantity: qty })
      });

      if (response.ok) {
        const data = await response.json();
        currentCartKey = data.cart_key; // Cập nhật key để dùng cho món tiếp theo
      }

      // Nghỉ một chút để server kịp thở
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 3. Trả về Checkout URL với cart_key cuối cùng
    const checkoutUrl = `${baseUrl}/checkout/?cocart-load-cart=${currentCartKey}&v=${Date.now()}`;

    return new Response(JSON.stringify({ url: checkoutUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
