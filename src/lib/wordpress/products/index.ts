import { Products } from '@/entities/Products';
import { Pages } from '@/entities/Pages';
import { processAndStoreImage } from '../imageProcessor';
import { stripHtmlAndUnescape } from '@/lib/stringUtils/stripHtmlAndUnescape';
import { initI18n } from '@/context/LanguageContext/getNameLang';
export async function getProducts(WC_URL: string, pages: Pages[], isPreview: boolean = false) { // Renamed function to match file name
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

    const Pages = allWPProducts.sort((a, b) => {
      const hasA = !!a.acf?.origin_product_id;
      const hasB = !!b.acf?.origin_product_id;

      if (hasA === hasB) return 0;
      return hasA ? 1 : -1;
    });

    let unifiedPages: Products[] = [];
    const pages_product = pages.filter((a: Pages) => { return a.key === 'products' });
    

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
      const itemPR = pages_product.find((a: Pages) => a.lang === lang);
      let slug = '', slugPR = '';
      if (slugPR) {
        slugPR = itemPR.slug;
        slug = `${slugPR}/${item.slug}`;
      }
      else
        slug = item.slug;

      if (itemcp == null) {
        const variations = (item.prices?.variations || []).map((v: any) => ({
            parent_id: v.parent_id, // hoặc v.id nếu đó là ID của biến thể
            variation_id: String(v.variation_id || ''), // Chuyển sang string như định nghĩa interface
            name: v.name || '',
            price: Number(v.display_price) || 0,
            regular_price: Number(v.display_regular_price) || 0
          }));
        itemcp = {
          _id: originKey,
          _name: '',
          item_key: '',
          variations: initI18n(variations),
          coupons_dktm: item.prices?.coupon_dktm,
          slug: initI18n(slug),
          slugP: initI18n(slugPR),
          itemImage: initI18n(featuredImage),
          itemName: initI18n(item.title?.rendered || ''),
          itemDescription: initI18n(description),
          itemDescriptionShort: initI18n(descriptionShort),
          itemCurrency: initI18n(currency),
          itemPrice: initI18n(item.price || -1),
          itemPriceRegister: initI18n(item.prices?.price_register || -1),
          itemPriceRenew: initI18n(item.prices?.price_renew || -1),
          itemPriceRegisterSale: initI18n(item.prices?.price_register_sale || -1),
          itemPriceRenewSale: initI18n(item.prices?.price_renew_sale || -1),
          itemInstallment: initI18n(installment),
          category: initI18n(product_cat_name || ''),
          isFeatured: initI18n(isFeatured || false),
        };
        unifiedPages.push(itemcp);
      }
      else {
        itemcp.slug[lang] = slug;
        itemcp.slugP[lang] = slugPR;
        itemcp.itemImage[lang] = featuredImage;
        itemcp.itemName[lang] = item.title?.rendered || '';
        itemcp.itemDescription[lang] = description;
        itemcp.itemDescriptionShort[lang] = descriptionShort;
        itemcp.itemCurrency[lang] = currency;
        itemcp.itemPrice[lang] = item.price || -1;
        itemcp.itemInstallment[lang] = installment;
        itemcp.category[lang] = product_cat_name || '';
        itemcp.isFeatured[lang] = isFeatured || false;
      }
    });
    // Xử lý lưu ảnh static cho tất cả template đã gom nhóm
    return await Promise.all(Object.values(unifiedPages).map(async (p: any): Promise<Products> => {
      if (p.itemImage) {
        for (const id of Object.keys(p.itemImage)) {
          const store = await processAndStoreImage({
            imageUrl: p.itemImage[id],
            wcUrl: WC_URL,
            publicDirBase: 'images/pages', // Lưu vào thư mục riêng cho sản phẩm
            isPreview: isPreview, // Truyền trạng thái preview
          });
          p.itemImage[id] = store;
        }
      }
      return p;
    }));
  }
  catch (err) {
    throw new Error(`Lỗi Product.ts: ${err instanceof Error ? err.message : err}`);
  }
}