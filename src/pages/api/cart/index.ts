export const prerender = false;
import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
import { globalStore } from '@/services/globalStore';
import { Coupons } from '@/entities/Coupons';
export const avas = getAvas(null);
export const WC_URL = avas.WC_URL;
export const WOO_KEY = avas.WOO_KEY;
export const WOO_SECRET = avas.WOO_SECRET;

export async function sync_coupons(cartKey: string, codes: string[]) {
    const link = `${WC_URL}/wp-json/cocart/v2/cart/update${cartKey ? `?cart_key=${cartKey}` : ''}`;
    const res = await fetch(link,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cart-Key": cartKey,
            },
            body: JSON.stringify({
                namespace: "sync-coupons",
                data: {
                    "coupons": codes
                },
            }),
        }
    );

    return await res.json();
}
export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const cartKey = url.searchParams.get('cart_key');

    try {
        // const link = `${WC_URL}/wp-json/cocart/v2/cart${cartKey ? `?cart_key=${cartKey}` : ''}`;
        // const response = await fetch(link, {
        //     method: 'GET',
        //     headers: { 'Content-Type': 'application/json' }
        // });

        // // Lấy giỏ hàng từ server để đảm bảo không có gian lận tiền bạc
        // const data = await response.json();

        // Áp dụng mã giảm giá
        const products = await globalStore.getProductData(avas.WC_URL_CLIENT);
        const coupons: Coupons[] = [...new Set(products.flatMap(item => item.coupons_dktm || []))];
        const uniqueCouponCodes = [
            ...new Set(
                coupons
                    .map(c => c.coupon_code?.trim())
                    .filter(Boolean)
            ),
        ];

        const data = await sync_coupons(cartKey, uniqueCouponCodes);

        return new Response(JSON.stringify({ ok: true, data }), {
            headers: { 'content-type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ ok: false, msg: error.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
};
