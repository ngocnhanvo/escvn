export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;
export const WOO_KEY = avas.WOO_KEY;
export const WOO_SECRET = avas.WOO_SECRET;

export const POST: APIRoute = async ({ request }) => {
    const { lang, _id, quantity, name, cartKey, variation_id } = await request.json();
    const result: any = { msg: null, ok: true };
    try {
        const data = JSON.stringify({
            id: _id,
            variation_id: variation_id ? variation_id.toString() : '',
            quantity: (quantity || 1).toString(),
            item_data: {
                _name: name
            }
        });
        const urlParams = cartKey ? `?cart_key=${cartKey}` : '';
        const link = `${WC_URL}/wp-json/cocart/v2/cart/add-item${urlParams}`;
        const response = await fetch(link, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        });
        const currentCartData = await response.json();
        if(currentCartData.items) {
            result.msg = currentCartData;
        }
    } catch (error) {
        result.msg = error.message;
        result.ok = false;
    }

    return new Response(JSON.stringify(result), {
        headers: { 'content-type': 'application/json' }
    });
};