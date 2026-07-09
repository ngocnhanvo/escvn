import type { APIRoute } from 'astro';
export const prerender = false;

async function checkDomainWithFallback(domain: string, act: string) {
    //API chính
    const baseUrl1 = 'https://whois.net.vn/checkdomain.php';
    //API dự phòng
    const baseUrl2 = 'https://member.esc.vn/checkdomain/checkdomain_member.php'; // URL dự phòng của bạn

    const query = act === 'getwhois' ? `?domain=${domain}&act=getwhois` : `?domain=${domain}`;

    // Hàm thực hiện fetch có timeout
    const fetchWithTimeout = async (url: string, method: string = 'GET', timeout = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        // Cấu hình request options
        const options: RequestInit = {
            method,
            signal: controller.signal,
        };
        const data = new FormData();
        data.append("domain", domain);

        // Chỉ đính kèm body nếu KHÔNG PHẢI là GET hoặc HEAD
        if (data && method !== 'GET' && method !== 'HEAD') {
            options.body = data;
        }

        try {
            const response = await fetch(url, options);
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
        const link = `${baseUrl2}${query}`;
        return await fetchWithTimeout(link, 'POST');
    } catch (error) {
        console.warn("API chính lỗi hoặc timeout, đang chuyển sang API dự phòng...");

        // Thử API dự phòng
        try {
            const link = `${baseUrl1}${query}`;
            return await fetchWithTimeout(link);
        } catch (finalError) {
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