export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { cartKey, item_key, quantity, varId } = await request.json();

        if (!item_key) {
            return new Response(JSON.stringify({ ok: false, msg: "Missing item_key" }), { status: 400 });
        }

        let data = {};
        if (varId) {
            const link = `${WC_URL}/wp-json/cocart/v2/cart/update${cartKey ? `?cart_key=${cartKey}` : ''}`;
            console.log(`key`, link);
            const response = await fetch(link,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Cart-Key": cartKey,
                    },
                    body: JSON.stringify({
                        namespace: "change-variation",
                        data: {
                            "cart_item_key": item_key,
                            "variation_id_new": varId
                        },
                    }),
                }
            );

            data = await response.json();
        }
        else {
            // CoCart API endpoint to update item quantity
            const link = `${WC_URL}/wp-json/cocart/v2/cart/item/${item_key}${cartKey ? `?cart_key=${cartKey}` : ''}`;

            const response = await fetch(link, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    quantity: String(quantity)
                })
            });
            data = await response.json();
        }

        // After updating item, get the updated cart total
        //const cartResponse = await fetch(`${WC_URL}/wp-json/cocart/v2/cart${cart_key ? `?cart_key=${cart_key}` : ''}`);
        //const cartData = await cartResponse.json();

        return new Response(JSON.stringify({ ok: true, data: data }), {
            headers: { 'content-type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ ok: false, msg: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
};
