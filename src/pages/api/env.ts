import type { APIRoute } from 'astro';
import { getAvas } from '@/lib/avas_env';
export const prerender = false;


export const GET: APIRoute = async ({ request, locals }) => {
  const avas = getAvas(locals);
  return new Response(
    JSON.stringify({
      test: avas.WC_URL_CLIENT,
      node: process.version
    }),
    {
      headers: {
        'content-type': 'application/json'
      }
    }
  );
};
