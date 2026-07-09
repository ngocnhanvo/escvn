export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { cartKey, billing, payment_method, create_account, customer_note, terms } = await request.json();
        if (!cartKey) {
            throw new Error("Cart key missing");
        }
        const link = `${WC_URL}/wp-json/cocart/v2/cart/update${cartKey ? `?cart_key=${cartKey}` : ''}`;
        const response = await fetch(link,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Cart-Key": cartKey,
                },
                body: JSON.stringify({
                    namespace: "checkout",
                    data: {
                        callback: "checkout",
                        payment_method,
                        customer_note,
                        terms,
                        create_account,
                        billing
                    },
                }),
            }
        );
        if (!response.ok) {
            const error = await response.json();
            return new Response(
                JSON.stringify(error),
                {
                    status: response.status,
                    headers: {
                        "content-type": "application/json"
                    }
                }
            );
        }
        const data = await response.json();

        return new Response(JSON.stringify({ ok: true, data: data }), {
            headers: { 'content-type': 'application/json' }
        });
    }
    catch (error) {
        return new Response(JSON.stringify({ ok: false, msg: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
};
