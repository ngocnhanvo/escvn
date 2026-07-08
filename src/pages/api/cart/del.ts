export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { cart_key, item_key } = await request.json();
        
        if (!item_key) {
            return new Response(JSON.stringify({ ok: false, msg: "Missing item_key" }), { status: 400 });
        }

        // CoCart API endpoint to remove item
        const link = `${WC_URL}/wp-json/cocart/v2/cart/item/${item_key}${cart_key ? `?cart_key=${cart_key}` : ''}`;
        
        const response = await fetch(link, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        // After removing, get the updated cart total
        const cartResponse = await fetch(`${WC_URL}/wp-json/cocart/v2/cart${cart_key ? `?cart_key=${cart_key}` : ''}`);
        const cartData = await cartResponse.json();

        return new Response(JSON.stringify({ ok: true, data: cartData }), {
            headers: { 'content-type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ ok: false, msg: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
};
