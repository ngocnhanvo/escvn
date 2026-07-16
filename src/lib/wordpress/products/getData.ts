// src/lib/wordpress/products/getData.ts
import { initI18n } from "@/context/LanguageContext/getNameLang";
import { Pages } from "@/entities/Pages";
import { Products } from "@/entities/Products";
import { stripHtmlAndUnescape } from "@/lib/stringUtils/stripHtmlAndUnescape";
import { processAndStoreImage } from "../imageProcessor";

export async function getData(allWPProducts: any[], WC_URL: string, pages: Pages[], isPreview: boolean = false) { // Renamed function to match file name
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    
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
      const featuredImage = item.featured_media_url || '';
      const lang = item.acf?.product_lang?.value || 'vi'; // Mặc định là tiếng Việt nếu không có trường này
      const currency = item.acf?.currency?.label || '';
      const product_cat_name = item.product_categories?.[0]?.name || 'Chưa phân loại';
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
          itemImage: initI18n({ src: featuredImage }),
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
        itemcp.itemImage[lang] = { src: featuredImage };
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

    const productsArray = Object.values(unifiedPages);
    
    // Lưu thông tin task để sau này map ngược lại kết quả
    const imageTasks: Array<{ product: any; key: string }> = [];
    
    // Thay vì chạy ngay, chúng ta chỉ định nghĩa các hàm sẽ chạy tải ảnh
    const taskResolvers: Array<() => Promise<any>> = [];

    // 1. Duyệt qua toàn bộ sản phẩm để gom tất cả thông tin tác vụ tải ảnh
    for (let i = 0, lenProducts = productsArray.length; i < lenProducts; i++) {
      const p = productsArray[i];
      const reload = p.reload;
      if (p.itemImage) {
        const keys = Object.keys(p.itemImage);
        for (let j = 0, lenKeys = keys.length; j < lenKeys; j++) {
          const id = keys[j];
          const imageUrl = p.itemImage[id]?.src;
          if (imageUrl) {
            // Lưu lại ngữ cảnh (sản phẩm nào, key nào) để sau khi tải xong gán ngược lại cho đúng
            imageTasks.push({ product: p, key: id });

            // Đóng gói hàm gọi API tải ảnh để kích hoạt thủ công sau
            taskResolvers.push(() =>
              processAndStoreImage({
                imageUrl: imageUrl,
                WC_URL,
                publicDirBase: 'images/pages',
                isPreview: isPreview,
                reload
              })
            );
          }
        }
      }
      p.reload = undefined;
    }

    // 2. Kích hoạt tải ảnh theo từng đợt (Chunking) song song
    const storedImages: any[] = [];
    const CONCURRENCY_LIMIT = 8; // Tải tối đa 8 ảnh cùng một lúc (bạn có thể chỉnh từ 5 -> 10 tùy tốc độ mạng)

    for (let i = 0; i < taskResolvers.length; i += CONCURRENCY_LIMIT) {
      // Cắt ra một cụm (chunk) các hàm tải ảnh
      const chunk = taskResolvers.slice(i, i + CONCURRENCY_LIMIT);
      
      // Chạy song song cụm này và đợi tất cả hoàn thành
      const chunkPromises = chunk.map(fn => fn());
      const chunkResults = await Promise.all(chunkPromises);
      
      // Gom kết quả tải xong vào mảng tổng
      storedImages.push(...chunkResults);
    }

    // 3. Gán ngược kết quả đã tải xong vào đúng vị trí ban đầu (Xử lý đồng bộ trên RAM, cực nhanh)
    for (let i = 0, lenTasks = imageTasks.length; i < lenTasks; i++) {
      const task = imageTasks[i];
      task.product.itemImage[task.key] = storedImages[i];
    }

    // 4. Trả về mảng sản phẩm đã được cập nhật đầy đủ thông tin ảnh
    return productsArray;
  }
  catch (err) {
    throw new Error(`Lỗi Product.ts: ${err instanceof Error ? err.message : err}`);
  }
}