import { getAvas } from '@/lib/avas_env';
import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { domain, act } = await request.json();
  
  const baseUrl = 'https://member.esc.vn/checkdomain/checkdomain_member.php';
    
  const query = act === 'getwhois' ? `?domain=${domain}&act=getwhois` : `?domain=${domain}`;
  const response = await fetch(`${baseUrl}${query}`);
  const result = await response.text();

  return new Response(JSON.stringify(act === 'getwhois' ? { whois: result } : { status: result.trim() }), {
    headers: { 'content-type': 'application/json' }
  });
};