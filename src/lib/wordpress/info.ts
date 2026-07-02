import { Products, WPInfo, Pages } from '@/entities';
import { processAndStoreImage } from './imageProcessor';
import { stripHtmlAndUnescape } from '@/lib/stringUtils';

export async function getInfo(WC_URL, isPreview: boolean = false) {
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
        `${WC_URL}/wp-json/wp/v2/thong-tin-chung?_embed=true&status=publish&per_page=${perPage}&page=${page}`
      );
      
      if (!response.ok) break;

      const data = await response.json();
      allWPProducts = [...allWPProducts, ...data];
      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    const Pages = allWPProducts;

    let unifiedPages: WPInfo[] = [];
    Pages.forEach((item: any) => {
      // Xác định ID gốc: Nếu có origin_page_id thì dùng nó, nếu không thì dùng chính ID của item (bản tiếng Việt)
      const originKey = (item.acf?.origin_info_id || item.id).toString();
      const lang = item.acf?.product_lang || 'vi';
      const tencongty = item.acf?.tencongty || '';
      const domain = item.acf?.domain || '';
      const diachihcm = item.acf?.diachihcm || '';
      const diachihanoi = item.acf?.diachihanoi || '';
      const emailhcm = item.acf?.emailhcm || '';
      const emailhanoi = item.acf?.emailhanoi || '';
      const facebook = item.acf?.facebook || '';
      const twitter = item.acf?.twitter || '';
      const tiktok = item.acf?.tiktok || '';
      const youtube = item.acf?.youtube || '';
      const hotline = item.acf?.hotline || '';
      const googlemaphcm = item.acf?.googlemaphcm || '';
      const googlemaphanoi = item.acf?.googlemaphanoi || '';
      const sodienthoaihcm = item.acf?.sodienthoaihcm || '';
      const sodienthoaithanoi = item.acf?.sodienthoaihanoi || '';
      const favicon = item.acf?.favicon.url || '';
      const alt_favicon = item.acf?.favicon?.alt || '';
      const logo = item.acf?.logo.url || '';
      const alt_logo = item.acf?.logo?.alt || '';
      const image = item.acf?.image.url || '';
      const alt_image = item.acf?.image?.alt || '';
      const mascot = item.acf?.mascot.url || '';
      const alt_mascot = item.acf?.mascot?.alt || '';
      const motaseo = item.acf?.motaseo || '';

      let itemcp = unifiedPages.find((t) => t.id === originKey);
      if (itemcp == null) {
        itemcp = {
          id: originKey,
          tencongty: { [lang]: tencongty },
          domain: { [lang]: domain },
          diachiHCM: { [lang]: diachihcm },
          diachiHaNoi: { [lang]: diachihanoi },
          emailHCM: { [lang]: emailhcm },
          emailHaNoi: { [lang]: emailhanoi },
          facebook: { [lang]: facebook },
          twitter: { [lang]: twitter },
          tiktok: { [lang]: tiktok },
          youtube: { [lang]: youtube },
          hotline: { [lang]: hotline },
          googlemapHCM: { [lang]: googlemaphcm },
          googlemapHaNoi: { [lang]: googlemaphanoi },
          sodienthoaiHCM: { [lang]: sodienthoaihcm },
          sodienthoaiHaNoi: { [lang]: sodienthoaithanoi },
          favicon: { [lang]: { src: favicon, alt: alt_favicon } },
          logo: { [lang]: { src: logo, alt: alt_logo } },
          image: { [lang]: { src: image, alt: alt_image } },
          mascot: { [lang]: { src: mascot, alt: alt_mascot } },
          motaSeo: { [lang]: motaseo }
        };
        unifiedPages.push(itemcp);
      }
      else {
        itemcp.tencongty = { ...itemcp.tencongty, [lang]: tencongty };
        itemcp.domain = { ...itemcp.domain, [lang]: domain };
        itemcp.diachiHCM = { ...itemcp.diachiHCM, [lang]: diachihcm };
        itemcp.diachiHaNoi = { ...itemcp.diachiHaNoi, [lang]: diachihanoi };
        itemcp.emailHCM = { ...itemcp.emailHCM, [lang]: emailhcm };
        itemcp.emailHaNoi = { ...itemcp.emailHaNoi, [lang]: emailhanoi };
        itemcp.facebook = { ...itemcp.facebook, [lang]: facebook };
        itemcp.twitter = { ...itemcp.twitter, [lang]: twitter };
        itemcp.tiktok = { ...itemcp.tiktok, [lang]: tiktok };
        itemcp.youtube = { ...itemcp.youtube, [lang]: youtube };
        itemcp.hotline = { ...itemcp.hotline, [lang]: hotline };
        itemcp.googlemapHCM = { ...itemcp.googlemapHCM, [lang]: googlemaphcm };
        itemcp.googlemapHaNoi = { ...itemcp.googlemapHaNoi, [lang]: googlemaphanoi };
        itemcp.sodienthoaiHCM = { ...itemcp.sodienthoaiHCM, [lang]: sodienthoaihcm };
        itemcp.sodienthoaiHaNoi = { ...itemcp.sodienthoaiHaNoi, [lang]: sodienthoaithanoi };
        itemcp.favicon = { ...itemcp.favicon, [lang]: { src: favicon, alt: alt_favicon } };
        itemcp.logo = { ...itemcp.logo, [lang]: { src: logo, alt: alt_logo } };
        itemcp.image = { ...itemcp.image, [lang]: { src: image, alt: alt_image } };
        itemcp.mascot = { ...itemcp.mascot, [lang]: { src: mascot, alt: alt_mascot } };
        itemcp.motaSeo = { ...itemcp.motaSeo, [lang]: motaseo };
      }
    });

    // Xử lý lưu ảnh static cho tất cả template đã gom nhóm
    return await Promise.all(Object.values(unifiedPages).map(async (p: WPInfo): Promise<WPInfo> => {
      if (p.favicon) {
        for (const id of Object.keys(p.favicon)) {
          const store = await processAndStoreImage({
            imageUrl: p.favicon[id].src,
            alt: p.favicon[id].alt,
            wcUrl: WC_URL,
            publicDirBase: 'images/pages', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.favicon[id] = store;
        }
      }

      if (p.logo) {
        for (const id of Object.keys(p.logo)) {
          const store = await processAndStoreImage({
            imageUrl: p.logo[id].src,
            alt: p.logo[id].alt,
            wcUrl: WC_URL,
            publicDirBase: 'images/pages', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.logo[id] = store;
        }
      }

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
        }
      }

      if (p.mascot) {
        for (const id of Object.keys(p.mascot)) {
          const store = await processAndStoreImage({
            imageUrl: p.mascot[id].src,
            alt: p.mascot[id].alt,
            wcUrl: WC_URL,
            publicDirBase: 'images/pages', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.mascot[id] = store;
        }
      }

      return p;
    }));
  } catch (error) {
    console.error(`❌ LỖI fetch Info:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}