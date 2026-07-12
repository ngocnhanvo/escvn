// src/lib/wordpress/products
import { Products } from '@/entities/Products';
import { Pages } from '@/entities/Pages';
import { getData } from './getData';
import { getDataFromLogs } from './getDataFromLogs';
export async function getProducts(products: Products[], WC_URL: string, pages: Pages[], isPreview: boolean = false) { // Renamed function to match file name
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    let allWPProducts: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100; // Tối đa số lượng sản phẩm mỗi lần fetch theo quy định của WP API

    const coProducts = products.length > 0;
    let link = `${WC_URL}/wp-json/astro/v1/get-product-logs`;
    do {
      if (!coProducts)
        link = `${WC_URL}/wp-json/wp/v2/product?status=publish&per_page=${perPage}&page=${page}`;
      
      const response = await fetch(link);
      if (!response.ok) break;

      const data = await response.json();
      allWPProducts = [...allWPProducts, ...data];
      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    let productsFN = [];
    if (coProducts)
      productsFN = await getDataFromLogs(products, allWPProducts, WC_URL, pages, isPreview);
    else
      productsFN = await getData(allWPProducts, WC_URL, pages, isPreview);
    return productsFN;
  }
  catch (err) {
    throw new Error(`Lỗi Product.ts: ${err instanceof Error ? err.message : err}`);
  }
}