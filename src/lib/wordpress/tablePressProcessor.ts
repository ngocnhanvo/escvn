import { WPInfo } from '@/entities/WPInfo';
import { processAndStoreImage } from './imageProcessor';
import { replaceAllProperties } from '../i18n/replaceAllProperties';
import dynamicIconImports from "lucide-react/dynamicIconImports";
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { getNestedValue } from '../effects/getNestedValue';
import { mapProducts } from './products/mapProduct';
import { Products } from '@/entities/Products';

const lucideTags = Object.keys(dynamicIconImports);
const kebabIconMap = new Map<string, string>();

lucideTags.forEach((tag) => {
  const cleanKey = tag.replace(/[-_\s]/g, "").toLowerCase();
  kebabIconMap.set(cleanKey, tag);
});

const fixLucideIconName = (userInput: string): string | null => {
  if (!userInput) return null;
  const cleanInput = userInput.replace(/[-_\s]/g, "").toLowerCase();
  return kebabIconMap.get(cleanInput) || null;
};

interface ProcessOptions {
  tblshort: string;
  wcUrl?: string;
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
export function clearTablePressCache(): void {
  processedtblPressCache.clear();
  iconCache.clear();
}

const processedtblPressCache = new Map<string, Promise<any>>();
const iconCache = new Map<string, string>();

/**
 * Helper: Xử lý phần import Icon chuyển thành chuỗi SVG String
 */
async function processIcon(value: string, key: string, item: any): Promise<void> {
  if (item[key]?.[value]) return;
  if (iconCache.has(value)) {
    item[key] = iconCache.get(value)!;
    return;
  }

  const kebabName = fixLucideIconName(value);
  if (!kebabName) {
    console.warn(`Icon nhập từ CMS không tồn tại: "${value}"`);
    item[key] = '';
    return;
  }

  try {
    const module = await import(`lucide-react/dist/esm/icons/${kebabName}.js`);
    const svgString = ReactDOMServer.renderToString(
      React.createElement(module.default, { size: 24 })
    );
    item[key] = svgString;
    iconCache.set(value, svgString);
  } catch (error) {
    console.error(`Không thể import file: ${kebabName}.js`, error);
    item[key] = '';
  }
}

/**
 * Helper: Xử lý logic cho từng Field (id) bên trong một Item
 */
async function processItemField(
  id: string, 
  item: any, 
  context: { wcUrl?: string; isPreview: boolean; isAPI: boolean; linkAPI?: string; data_info: WPInfo; lang: string },
  state: { datasAPI: any }
): Promise<void> {
  const value = String(item[id] ?? '');

  // 1. Xử lý API Key
  if (id === 'api-key' && context.isAPI) {
    try {
      const responseAPI = await fetch(`${context.wcUrl}${context.linkAPI?.replaceAll(id, value)}`);
      if (responseAPI.ok) {
        state.datasAPI = await responseAPI.json();
        item['keyAPI'] = value;
      }
    } catch (e) {
      console.error(`Lỗi fetch API Key: ${id}`, e);
    }
    return;
  }

  // 2. Xử lý data lồng từ API
  if (id.startsWith('api-') && state.datasAPI?.length > 0) {
    const val = getNestedValue(state.datasAPI[0], value);
    item[id.substring(4)] = val ?? value;
  }

  // 3. Xử lý Lucide Icon
  if (id.startsWith('lucide-')) {
    await processIcon(value, id.substring(7), item);
    return;
  }

  // 4. Xử lý Image hoặc Đổi ngôn ngữ i18n
  if (value.match(imgRegex)) {
    const matches = Array.from(value.matchAll(imgRegex));
    for (const match of matches) {
      const originalSrc = match[1];
      if (originalSrc && !originalSrc.startsWith('data:')) {
        item[id] = await processAndStoreImage({
          imageUrl: originalSrc,
          wcUrl: context.wcUrl,
          publicDirBase: 'images/pages',
          isPreview: context.isPreview,
        });
      }
    }
  } else if (typeof item[id] === 'string') {
    item[id] = replaceAllProperties(item[id], context.data_info, context.lang);
  }
}

/**
 * Hàm main xử lý dữ liệu từ TablePress Shortcode
 */
export async function processAndGetData({
  tblshort,
  wcUrl,
  data_info,
  products,
  lang,
  isPreview = false
}: ProcessOptions): Promise<any> {
  if (!tblshort) return {};
  if (processedtblPressCache.has(tblshort)) return processedtblPressCache.get(tblshort)!;

  const tableProcessPromise = (async (): Promise<any> => {
    try {
      const response = await fetch(`${wcUrl}/wp-json/tablepress/v1/table/${tblshort}`);
      if (!response.ok) return {};

      const json = await response.json();
      const linkAPI: string = json.meta?.api;
      const isAPI = linkAPI?.startsWith('/wp-json') || linkAPI?.startsWith('https://');
      const isProduct = linkAPI === 'Product';

      if (Array.isArray(json.items)) {
        const context = { wcUrl, isPreview, isAPI, linkAPI, data_info, lang };

        // TỐI ƯU: Sử dụng Promise.all để xử lý song song các item thay vì dùng vòng lặp tuần tự
        await Promise.all(json.items.map(async (item: any) => {
          const state = { datasAPI: null }; // Lưu state cục bộ của mỗi item
          for (const id of Object.keys(item)) {
            await processItemField(id, item, context, state);
          }
        }));

        if (isProduct) {
          mapProducts(products, json.items);
        }
      }
      return json;
    } catch (err) {
      processedtblPressCache.delete(tblshort);
      throw new Error(`Lỗi xử lý API tablepress ${tblshort}: ${err instanceof Error ? err.message : err}`);
    }
  })();

  processedtblPressCache.set(tblshort, tableProcessPromise);

  // Giới hạn cache tối đa 500 table trong RAM
  if (processedtblPressCache.size > 500) {
    const firstKey = processedtblPressCache.keys().next().value;
    if (firstKey) processedtblPressCache.delete(firstKey);
  }

  return tableProcessPromise;
}