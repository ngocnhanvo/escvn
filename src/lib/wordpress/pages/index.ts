import { Pages } from '@/entities/Pages';
import { WPInfo } from '@/entities/WPInfo';
import { getData } from './getData';
import { getDataFromLogs } from './getDataFromLogs';


export async function getPages(allWPPages_old, WC_URL, data_info: WPInfo, isPreview: boolean = false) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    let allWPPages: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100; // Tối đa số lượng sản phẩm mỗi lần fetch theo quy định của WP API

    const coPages = allWPPages_old.length > 0;
    let link = `${WC_URL}/wp-json/astro/v1/get-page-logs`;
    do {
      if (!coPages)
        link = `${WC_URL}/wp-json/wp/v2/pages?_embed=true&status=publish&per_page=${perPage}&page=${page}`;

      const response = await fetch(link);
      if (!response.ok) break;

      const data = await response.json();
      if (!coPages)
        allWPPages = [...allWPPages, ...data];
      else
        allWPPages = data;

      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    let pages: Pages[] = [];
    if (coPages) {
      const page = await getDataFromLogs(allWPPages_old, allWPPages, WC_URL, data_info, isPreview);
      allWPPages = page.allWPPages;
      pages = page.pages;
    }
    else { 
      const len = allWPPages.length;
      for (let i = 0; i < len; i++) {
          allWPPages[i].reload = true;
      }
      pages = await getData(allWPPages, WC_URL, data_info, isPreview);
    }

    return {
      pages,
      allWPPages
    };
  }
  catch (err) {
    throw new Error(`Lỗi Pages.ts: ${err instanceof Error ? err.message : err}`);
  }
}