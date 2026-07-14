// src/lib/wordpress/tablepress/tablePressProcessor.ts
import { WPInfo } from '@/entities/WPInfo';
import { Products } from '@/entities/Products';
import { getData } from './getData';



interface ProcessOptions {
  tblshort: string;
  WC_URL: string;
  publicDirBase?: string;
  isPreview?: boolean;
  data_info: WPInfo;
  products: Products[];
  lang: string;
}

export const removeTargetImgRegex = /<img[^>]*class="[^"]*tablepress-attached-image[^"]*"[^>]*>/g;
export const imgRegex = /<img[^>]+src="([^">]+)"/g;
export const imgRegexFull = /<img([\s\S]*?)src="([^"]+)"([\s\S]*?)>/gi;
export const tblPressRegex = /\[table id=\s*([a-zA-Z0-9_-]+)\s*\/]/g;
export const tablepressRegex = /<div[^>]*class="tablepress-preview-wrap"[^>]*>[\s\S]*?data-table-id="([^"]+)"[\s\S]*?<\/div>/gi;

export function clearTablePressCache(): void {
  processedtblPressCache.clear();
}

const processedtblPressCache = new Map<string, Promise<any>>();

/**
 * Hàm main xử lý dữ liệu từ TablePress Shortcode
 */
export async function processAndGetData({
  tblshort,
  WC_URL,
  data_info,
  products,
  lang,
  isPreview = false,
  rawTableData = null // <-- Bổ sung: Cho phép truyền dữ liệu thô đã cập nhật từ Log vào
}: ProcessOptions & { rawTableData?: any }): Promise<any> {
  if (!tblshort) return {};
  
  const cacheKey = `${tblshort}_${lang}`;
  if (processedtblPressCache.has(cacheKey)) {
    return processedtblPressCache.get(cacheKey)!;
  }

  const tableProcessPromise = (async (): Promise<any> => {
    try {
      let json = rawTableData;
      
      // Nếu không có sẵn dữ liệu thô từ Log truyền vào thì mới phải fetch API từ WordPress
      if (!json) {
        const response = await fetch(`${WC_URL}/wp-json/tablepress/v1/table/${tblshort}`);
        if (!response.ok) return {};
        json = await response.json();
      } else {
        // Nếu có dữ liệu thô, thực hiện deep clone để tránh thay đổi trực tiếp vùng nhớ gốc của Log
        json = JSON.parse(JSON.stringify(json));
      }
      
      // Thực hiện transform (hình ảnh, icon, i18n, sản phẩm) đúng theo context của trang hiện tại
      json = await getData(json, WC_URL, data_info, products, isPreview);
      return json;
    } catch (err) {
      processedtblPressCache.delete(cacheKey);
      throw new Error(`Lỗi xử lý tablepress ${tblshort} (${lang}): ${err instanceof Error ? err.message : err}`);
    }
  })();

  processedtblPressCache.set(cacheKey, tableProcessPromise);

  if (processedtblPressCache.size > 500) {
    const firstKey = processedtblPressCache.keys().next().value;
    if (firstKey) processedtblPressCache.delete(firstKey);
  }

  return tableProcessPromise;
}