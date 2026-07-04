import { WPInfo } from '@/entities/WPInfo';
import { Pages } from '@/entities/Pages';
/**
 * Tự động tạo file sitemap.xml dựa trên dữ liệu từ WordPress
 * Hàm này nên được gọi trong quá trình build (ví dụ: trong file trang chủ hoặc script build)
 */
export async function generateAndSaveSitemap(
  allPages: Pages[],
  infoData: WPInfo // Assuming infoData[0] is passed here
): Promise<{ sitemap: string | null; robots: string | null }> {
  // Chỉ chạy ở phía Server
  if (import.meta.env.SSR || typeof window === 'undefined') {
    try {
      const { writeFileSync } = await import('node:fs');
      const path = await import('node:path');

      // 1. Lấy thông tin domain từ infoData được truyền vào
      const domain = infoData?.domain['vi'] || '';

      if (!domain) {
        throw new Error('Build failed: Domain missing in WPInfo, cannot generate sitemap.');
      }

      const baseUrl = domain.startsWith('http') ? domain.replace(/\/$/, '') : `https://${domain.replace(/\/$/, '')}`;
      const urls: string[] = [];
      const lastMod = new Date().toISOString().split('T')[0];

      // 2. Thêm các trang từ allPages được truyền vào
      allPages.forEach(page => {
        const pathSegment = page.slug === undefined ? '' : page.slug; // Xử lý trang chủ 'vi'
        const fullUrl = `${baseUrl}${pathSegment ? `/${pathSegment}/` : ''}`;
        urls.push(fullUrl);
      });

      // 3. Tạo cấu trúc XML
      const xmlEntries = urls.map(url => {
        // Ưu tiên trang chủ cao hơn
        const priority = url.endsWith('/vi') || url.endsWith('/en') ? '1.0' : '0.8';
        return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
      }).join('\n');

      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;

// --- PHẦN LOGIC TẠO ROBOTS.TXT ---
      const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /preview/
Disallow: /wp-admin/
Disallow: /wp-login.php
Sitemap: ${baseUrl}/sitemap.xml`;
      // 4. Ghi file vào thư mục public
      const publicPath = path.resolve('public', 'sitemap.xml');
      writeFileSync(publicPath, sitemapXml);
      
      const robotsPath = path.resolve('public', 'robots.txt');
      writeFileSync(robotsPath, robotsTxt);

      console.log(`✅ Đã tạo sitemap.xml tại: ${publicPath} với ${urls.length} links.`);
      return { sitemap: sitemapXml, robots: robotsTxt };
    } catch (err) {
      console.error('❌ Lỗi nghiêm trọng khi tạo sitemap:', err);
      throw new Error(err);
    }
  }
  return { sitemap: null, robots: null };
}