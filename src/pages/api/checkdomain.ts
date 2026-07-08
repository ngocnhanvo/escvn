import type { APIRoute } from 'astro';
export const prerender = false;

async function checkDomainWithFallback(domain: string, act: string) {
    const baseUrl1 = 'https://member.esc.vn/checkdomain/checkdomain_member.php';
    const baseUrl2 = 'https://api.backup-esc.vn/checkdomain'; // URL dự phòng của bạn
    
    const query = act === 'getwhois' ? `?domain=${domain}&act=getwhois` : `?domain=${domain}`;

    // Hàm thực hiện fetch có timeout
    const fetchWithTimeout = async (url: string, timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) throw new Error('API failed');
            return await response.text();
        } catch (e) {
            clearTimeout(id);
            throw e;
        }
    };

    // Thử API chính
    try {
        return await fetchWithTimeout(`${baseUrl1}${query}`);
    } catch (error) {
        console.warn("API chính lỗi hoặc timeout, đang chuyển sang API dự phòng...");
        
        // Thử API dự phòng
        try {
            return await fetchWithTimeout(`${baseUrl2}${query}`);
        } catch (finalError) {
            console.error("Cả 2 API đều thất bại");
            return "Error: Domain check service unavailable";
        }
    }
}

export const POST: APIRoute = async ({ request }) => {
  const { domain, act } = await request.json();
  const result = await checkDomainWithFallback(domain, act);
  return new Response(JSON.stringify(act === 'getwhois' ? { whois: result } : { status: result.trim() }), {
    headers: { 'content-type': 'application/json' }
  });
};