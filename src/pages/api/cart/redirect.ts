import { APIRoute } from "astro";
import { getAvas } from '@/lib/avas_env';
export const avas = getAvas(null);

export const prerender = false;
export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const cartKey = url.searchParams.get('cartKey');
    const redirectUrl = `${avas.WC_URL}/cart/?cocart-load-cart=${cartKey}`;
    // Trả về lệnh chuyển hướng trực tiếp từ Server
    return Response.redirect(redirectUrl, 302);
};