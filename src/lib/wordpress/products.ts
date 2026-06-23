import { Products, WPInfo, Pages } from '@/entities';
import { processAndStoreImage } from './imageProcessor';
import { stripHtmlAndUnescape } from '@/lib/stringUtils';
const WC_URL = import.meta.env.WC_URL || process.env.WC_URL;

export async function getProducts(infoData: WPInfo, pages: Pages[], isPreview: boolean = false) { // Renamed function to match file name
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
        `${WC_URL}/wp-json/wp/v2/product?_embed=true&status=publish&per_page=${perPage}&page=${page}`
      );
      
      if (!response.ok) break;

      const data = await response.json();
      allWPProducts = [...allWPProducts, ...data];
      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    const Pages = allWPProducts;

    let unifiedPages: Products[] = [];
    const pages_product = pages.filter((a:Pages)=> { return a.key === 'products'});
    Pages.forEach((item: any) => {
      // Xác định ID gốc: Nếu có origin_page_id thì dùng nó, nếu không thì dùng chính ID của item (bản tiếng Việt)
      const originKey = (item.acf?.origin_product_id || item.id).toString();
      const featuredImage = item._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
      const lang = item.acf?.product_lang?.value || 'vi'; // Mặc định là tiếng Việt nếu không có trường này
      const currency = item.acf?.currency?.label || '';
      const flatTerms = item._embedded?.['wp:term']?.flat() || [];
      const product_cat_name = flatTerms.find((term: any) => term.id === item.product_cat?.[0])?.name || 'Chưa phân loại';
      const description = item.content?.rendered;
      const descriptionShort = stripHtmlAndUnescape(item.excerpt?.rendered);
      const installment = item.attributes?.find((attr: any) => attr.slug === 'pa_tra-gop')?.options?.[0];
      const isFeatured = item.class_list?.includes("featured");
      let itemcp = unifiedPages.find((t) => t._id === originKey);
      const slugPR = pages_product.find((a:Pages) => a.lang === lang);
      const slug = `${slugPR.slug}/${item.slug}`;
      if (itemcp == null) {
        itemcp = {
          _id: originKey,
          slug: { [lang]: slug },
          slugP: { [lang]: slugPR.slug },
          itemImage: { [lang]: featuredImage},
          itemName: { [lang]: item.title?.rendered || '' },
          itemDescription: { [lang]: description },
          itemDescriptionShort: { [lang]: descriptionShort },
          itemCurrency: { [lang]: currency },
          itemPrice: { [lang]: item.price || -1},
          itemInstallment: { [lang]: installment},
          category: {[lang]: product_cat_name || ''},
          isFeatured: {[lang]: isFeatured || false},
        };
        unifiedPages.push(itemcp);
      }
      else {
        itemcp.slug = { ...itemcp.slug, [lang]: slug };
        itemcp.slugP = { ...itemcp.slugP, [lang]: slugPR.slug };
        itemcp.itemImage = { ...itemcp.itemImage, [lang]: featuredImage };
        itemcp.itemName = { ...itemcp.itemName, [lang]: item.title?.rendered || '' };
        itemcp.itemDescription = { ...itemcp.itemDescription, [lang]: description };
        itemcp.itemDescriptionShort = { ...itemcp.itemDescriptionShort, [lang]: descriptionShort };
        itemcp.itemCurrency = { ...itemcp.itemCurrency, [lang]: currency };
        itemcp.itemPrice = { ...itemcp.itemPrice, [lang]: item.price || -1};
        itemcp.itemInstallment = { ...itemcp.itemInstallment, [lang]: installment};
        itemcp.category = { ...itemcp.category, [lang]: product_cat_name || ''};
        itemcp.isFeatured = { ...itemcp.isFeatured, [lang]: isFeatured || false}; 
      }
    });
    // Xử lý lưu ảnh static cho tất cả template đã gom nhóm
    return await Promise.all(Object.values(unifiedPages).map(async (p: any): Promise<Products> => {
      if (p.itemImage) {
        for (const id of Object.keys(p.itemImage)) {
          const store = await processAndStoreImage({
            imageUrl: p.itemImage[id],
            wcUrl: WC_URL,
            publicDirBase: 'images/products', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.itemImage[id] = store;
        }
      }
      return p;
    }));
  } catch (error) {
    console.error(`❌ LỖI fetch Products:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}