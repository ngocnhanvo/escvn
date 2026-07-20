import { WPInfo } from '@/entities/WPInfo';
import { getData } from './getData';
import { getDataFromLogs } from './getDataFromLogs';

export async function getInfo(allWPInfo_old, WC_URL, isPreview: boolean = false) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    let allWPInfo: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100;

    const coInfos = allWPInfo_old.length > 0;
    let link = `${WC_URL}/wp-json/astro/v1/get-thongtinchung-logs`;
    do {
      if (!coInfos)
        link = `${WC_URL}/wp-json/wp/v2/thong-tin-chung?_embed=true&status=publish&per_page=${perPage}&page=${page}`;
      
      const response = await fetch(link);
      if (!response.ok) break;

      const data = await response.json();
      if (!coInfos)
        allWPInfo = [...allWPInfo, ...data];
      else
        allWPInfo = data;
      
      totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
      page++;
    } while (page <= totalPages);

    let infoFN: WPInfo[] = [];
    if (coInfos) {
      const len = allWPInfo_old.length;
      for (let i = 0; i < len; i++) {
          allWPInfo_old[i].reload = false;
      }
      const info = await getDataFromLogs(allWPInfo_old, allWPInfo, WC_URL, isPreview);
      allWPInfo = info.allWPInfo;
      infoFN = info.info;
    }
    else {
      const len = allWPInfo.length;
      for (let i = 0; i < len; i++) {
        allWPInfo[i].reload = true;
      }
      infoFN = await getData(allWPInfo, WC_URL, isPreview);
    }

    return {
      infoFN,
      allWPInfo
    };
  } catch (err) {
    throw new Error(`Lỗi Info.ts: ${err instanceof Error ? err.message : err}`);
  }
}