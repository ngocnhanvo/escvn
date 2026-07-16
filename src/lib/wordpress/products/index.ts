// src/lib/wordpress/products
import { Products } from '@/entities/Products';
import { Pages } from '@/entities/Pages';
import { getData } from './getData';
import { getDataFromLogs } from './getDataFromLogs';
export async function getProducts(allWPProducts_old: any[], WC_URL: string, pages: Pages[], isPreview: boolean = false) { // Renamed function to match file name
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    let allWPProducts: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100; // Tối đa số lượng sản phẩm mỗi lần fetch theo quy định của WP API

    const coProducts = allWPProducts_old.length > 0;
    let link = `${WC_URL}/wp-json/astro/v1/get-product-logs`;
    do {
      if (!coProducts)
        link = `${WC_URL}/wp-json/wp/v2/product?status=publish&per_page=${perPage}&page=${page}`;
      
      const response = await fetch(link);
      if (!response.ok) break;

      const data = await response.json();
      if (!coProducts)
        allWPProducts = [...allWPProducts, ...data];
      else
        allWPProducts = data;

      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);
    
    let products: Products[] = [];
    if (coProducts) {
      const product = await getDataFromLogs(allWPProducts_old, allWPProducts, WC_URL, pages, isPreview);
      allWPProducts = product.allWPProducts;
      products = product.products;
    }
    else {
      const len = allWPProducts.length;
      for (let i = 0; i < len; i++) {
          allWPProducts[i].reload = true;
      }
      products = await getData(allWPProducts, WC_URL, pages, isPreview);
    }

    return {
      products,
      allWPProducts
    };
  }
  catch (err) {
    throw new Error(`Lỗi Product.ts: ${err instanceof Error ? err.message : err}`);
  }
}