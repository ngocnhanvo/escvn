import { WPInfo, Pages } from '@/entities';
import { processAndStoreImage } from './imageProcessor';
import { replaceAllProperties } from '../i18n';
const WC_URL = import.meta.env.WC_URL || process.env.WC_URL;

export async function getPages(data_info: WPInfo, isPreview: boolean = false) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    let allWPProducts: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100; // Tối đa số lượng sản phẩm mỗi lần fetch theo quy định của WP API

    do {
      const response = await fetch(
        `${WC_URL}/wp-json/wp/v2/pages?_embed=true&status=publish&per_page=${perPage}&page=${page}`
      );
      
      if (!response.ok) break;

      const data = await response.json();
      allWPProducts = [...allWPProducts, ...data];
      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    const Pages = allWPProducts;
    let unifiedPages: Pages[] = [];
    Pages.forEach((item: any) => {
      const id = item.id;
      const idP = item.acf?.origin_page_id || '';
      const key = item.acf?.key || '';
      const action = item.acf?.action || '';
      const lang = item.acf?.product_lang.value || 'vi';
      const slug = item.slug || '';
      const label = item.acf?.label || '';
      const title = item.acf?.title || '';
      const image = item.acf?.image?.url || '';
      const alt_image = item.acf?.image?.alt || '';
      const content = replaceAllProperties(item.acf?.content, data_info, lang) || '';
      const description = replaceAllProperties(item.acf?.description, data_info, lang) || '';
      
      let itemcp = unifiedPages.find((t) => t.id === id);
      if (itemcp == null) {
        itemcp = {
          id: id,
          idP: idP,
          key: key,
          lang: lang,
          slug: slug,
          label: label,
          title: title,
          description: description,
          content: content,
          action: action,
          image: { [lang]: { src: image, alt: alt_image } }
        };
        unifiedPages.push(itemcp);
      }
    });

    const home = unifiedPages.find(page => page.key === 'home' && (page.idP ?? '') == '');
    const homeM = {...home};
    homeM.slug = '';
    unifiedPages.unshift(homeM);

    // Xử lý lưu ảnh static cho tất cả template đã gom nhóm
    return await Promise.all(Object.values(unifiedPages).map(async (p: Pages): Promise<Pages> => {
      if (p.image) {
        for (const id of Object.keys(p.image)) {
          const store = await processAndStoreImage({
            imageUrl: p.image[id].src,
            alt: p.image[id].alt,
            wcUrl: WC_URL,
            publicDirBase: 'images/pages', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.image[id] = store;
          if(p.image[id].src == '') {
            p.image[id] = data_info.image[id];
          }
        }
      }

      // Xử lý trích xuất và lưu các ảnh nhúng trong nội dung HTML (Rich Text)
      if (p.content && (import.meta.env.SSR || typeof window === 'undefined')) {
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const matches = Array.from(p.content.matchAll(imgRegex));
        
        for (const match of matches) {
          const originalSrc = match[1];
          // Bỏ qua các ảnh dạng base64
          if (originalSrc && !originalSrc.startsWith('data:')) {
            const storedImage = await processAndStoreImage({
              imageUrl: originalSrc,
              wcUrl: WC_URL,
              publicDirBase: 'images/pages/content', // Lưu vào thư mục riêng cho nội dung
              isPreview: isPreview,
            });
            
            const imgRegex = /<img([^>]*?)src="([^"]+)"([^>]*)>/gi;
            p.content = p.content.replace(
              imgRegex,
              (fullMatch, beforeSrc, src, afterSrc) => {
                if (src !== originalSrc) return fullMatch;

                return `
                  <picture style="width:inherit; height: inherit">
                    <source srcset="${storedImage.srcSet}" type="image/webp">
                    <img${beforeSrc}src="${storedImage.src}"${afterSrc}>
                  </picture>
                `;
              }
            );
          }
        }
      }

      return p;
    }));
  } catch (error) {
    console.error(`❌ LỖI fetch Pages:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}