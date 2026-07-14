// src/lib/wordpress/tablepress/getData.ts
import { replaceAllPropertiesNoLang } from "@/lib/i18n/replaceAllProperties";
import { processAndStoreImage } from "../imageProcessor";
import { imgRegex } from "./tablePressProcessor";
import ReactDOMServer from "react-dom/server";
import React from "react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { getNestedValue } from "@/lib/effects/getNestedValue";
import { WPInfo } from "@/entities/WPInfo";
import { mapProducts } from "../products/mapProduct";
import { tablePress } from "@/entities/tablePress";

export function clearTablePressCache2(): void {
  iconCache.clear();
  kebabIconMap.clear();
}

const iconCache = new Map<string, string>();
const kebabIconMap = new Map<string, string>();
const fixLucideIconName = (userInput: string): string | null => {
  if (!userInput) return null;

  let kebab = userInput
    // 1. Thêm gạch ngang giữa chữ thường/số và chữ hoa (Ví dụ: LayoutGrid -> Layout-Grid)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // 2. Thêm gạch ngang giữa các chữ hoa đi liền nhau (nếu có)
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    // 3. QUAN TRỌNG: Thêm gạch ngang giữa chữ cái và chữ số đứng cuối (Ví dụ: CheckCircle2 -> check-circle-2)
    .replace(/([a-zA-Z])([0-9]+)$/g, '$1-$2')
    // 4. Chuẩn hóa khoảng trắng hoặc ký tự đặc biệt thành dấu gạch ngang đơn
    .replace(/[-_\s]+/g, '-')
    .toLowerCase();

  // Xóa dấu gạch ngang thừa ở đầu/cuối
  kebab = kebab.replace(/^-+|-+$/g, '');

  return kebab || null;
};
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

  // 1. Kiểm tra xem kebabName có thực sự tồn tại trong dynamicIconImports không
  if (!kebabName || !(kebabName in dynamicIconImports)) {
    console.warn(`Icon nhập từ CMS không tồn tại: "${value}"`);
    item[key] = '';
    return;
  }

  try {
    // 2. Lấy hàm load icon động tương ứng (Lucide đã cấu hình sẵn chuẩn mapping)
    const loadIcon = dynamicIconImports[kebabName as keyof typeof dynamicIconImports];
    const module = await loadIcon(); 
    
    // 3. Render icon thành chuỗi SVG
    const svgString = ReactDOMServer.renderToString(
      React.createElement(module.default, { size: 24 })
    );
    
    item[key] = svgString;
    iconCache.set(value, svgString);
  } catch (error) {
    console.error(`Không thể load icon: ${kebabName}`, error);
    item[key] = '';
  }
}
/**
 * Helper: Xử lý logic cho từng Field (id) bên trong một Item
 */
async function processItemField(
  id: string,
  item: any,
  context: { WC_URL?: string; isPreview: boolean; isAPI: boolean; linkAPI?: string; data_info: WPInfo; lang?: string; },
  state: { datasAPI: any }
): Promise<void> {
  const value = String(item[id] ?? '');

  // 1. Xử lý API Key
  if (id === 'api-key' && context.isAPI) {
    try {
      const responseAPI = await fetch(`${context.WC_URL}${context.linkAPI?.replaceAll(id, value)}`);
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

  if (id.startsWith('shortcode-')) {
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
          wcUrl: context.WC_URL,
          publicDirBase: 'images/pages',
          isPreview: context.isPreview,
        });
      }
    }
  } else if (typeof item[id] === 'string') {
    item[id] = replaceAllPropertiesNoLang(item[id], context.data_info);
  }
}

/**
 * HÀM MỚI TÁCH BIỆT: Biến đổi cấu trúc một bảng đơn lẻ (Dùng cho cả khi Fetch mới, Logs hoặc Dịch động)
 */
export async function transformTableData(
  json: any,
  WC_URL: string,
  data_info: WPInfo,
  products: any[],
  isPreview: boolean
): Promise<any> {
  // Tạo bản sao deep copy hoặc shallow sao cho không ảnh hưởng data gốc nếu cần
  const tableCopy = JSON.parse(JSON.stringify(json));

  const linkAPI: string = tableCopy.meta?.api;
  const isAPI = linkAPI?.startsWith('/wp-json') || linkAPI?.startsWith('https://');
  const isProduct = linkAPI === 'Product';

  if (Array.isArray(tableCopy.items)) {
    const context = { WC_URL, isPreview, isAPI, linkAPI, data_info };

    // Xử lý song song các item trong bảng
    await Promise.all(tableCopy.items.map(async (item: any) => {
      const state = { datasAPI: null };
      for (const id of Object.keys(item)) {
        await processItemField(id, item, context, state);
      }
    }));

    if (isProduct) {
      mapProducts(products, tableCopy.items);
    }
  }

  return tableCopy;
}

/**
 * HÀM CHÍNH: Xử lý khi KHÔNG CÓ DỮ LIỆU SẴN (Fetch toàn bộ từ WordPress về)
 */
export async function getData(
  allWPTablePress: any[],
  WC_URL: string,
  data_info: WPInfo,
  products: any[],
  isPreview: boolean
): Promise<tablePress[]> {

  const resultTablePress: tablePress[] = [];

  // Sử dụng for...of thay cho .forEach để đảm bảo xử lý bất đồng bộ tuần tự/đồng bộ chính xác toàn bộ danh sách bảng
  for (const json of allWPTablePress) {
    const shortcode = json.id;
    if (!shortcode) continue;

    const cleanData = await transformTableData(json, WC_URL, data_info, products, isPreview);

    let lang = "";
    if (shortcode.startsWith('pub_')) {
      lang = shortcode.endsWith('_en') ? 'en' : 'vi';
      console.log(`⚡ Early Transform bảng toàn cục: ${shortcode} (${lang})`);
    }

    resultTablePress.push({
      shortcode: shortcode,
      lang: lang,
      json: cleanData
    });
  }

  return resultTablePress;
}