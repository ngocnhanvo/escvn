export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
import crypto from 'node:crypto';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;
export const WOO_KEY = avas.WOO_KEY;
export const WOO_SECRET = avas.WOO_SECRET;

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

export const POST: APIRoute = async ({ request }) => {
    const { lang, _id, quantity } = await request.json();
    const result: any = { msg: null, ok: true };
    try {
        const data = JSON.stringify({
            id: _id.toString(),
            quantity: (quantity || 1).toString(),
        });
        const link = `${WC_URL}/wp-json/cocart/v2/cart/add-item`;
        const response = await fetch(link, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        });
        
        const currentCartData = await response.json();
        if(currentCartData.items) {
            console.log(`datas`, currentCartData.items);
            result.msg = currentCartData.items.map((item: any) => ({
                _id: item.id,
                name: item.name,
                quantity: item.quantity?.value || item.quantity || 1
            }));
        }
    } catch (error) {
        result.msg = error.message;
        result.ok = false;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'content-type': 'application/json' }
    });
};
