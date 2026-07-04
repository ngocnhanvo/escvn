import { WPInfo } from '@/entities/WPInfo';
import { processAndStoreImage } from './imageProcessor';
import { replaceAllProperties } from '../i18n/replaceAllProperties';
import dynamicIconImports from "lucide-react/dynamicIconImports";
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const lucideTags = Object.keys(dynamicIconImports);
const kebabIconMap = new Map<string, string>();

lucideTags.forEach((tag) => {
  const cleanKey = tag.replace(/[-_\s]/g, "").toLowerCase();
  kebabIconMap.set(cleanKey, tag);
});

const fixLucideIconName = function (userInput: string): string | null {
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
  lang: string;
}

export const removeTargetImgRegex = new RegExp(`<img[^>]*class="[^"]*tablepress-attached-image[^"]*"[^>]*>`, 'g');
export const imgRegex = /<img[^>]+src="([^">]+)"/g;

const getNestedValue = function (obj: any, pathString: string) {
  if (!obj || !pathString) return undefined;
  let cleanPath = pathString.replace(/\?/g, '').replace(/\[(\d+)\]/g, '.$1');
  const keys = cleanPath.split('.').filter(Boolean);
  return keys.reduce((current, key) => {
    return (current && current[key] !== undefined) ? current[key] : undefined;
  }, obj);
}

// 1. Chuyển sang dùng Map lưu Promise để tránh Race Condition toàn diện
const processedtblPressCache = new Map<string, Promise<any>>();
const iconCache = new Map<string, string>();
export async function processAndGetData({
  tblshort,
  wcUrl,
  isPreview = false,
  data_info,
  lang,
}: ProcessOptions): Promise<any> {

  if (!tblshort) return {};

  // 2. Kiểm tra nếu đang hoặc đã fetch shortcode này rồi thì ăn theo Promise đó luôn
  if (processedtblPressCache.has(tblshort)) {
    return processedtblPressCache.get(tblshort)!;
  }

  // 3. Tạo một Promise bao bọc toàn bộ tiến trình fetch và xử lý data
  const tableProcessPromise = (async (): Promise<any> => {
    let json: any = {};

    try {
      const response = await fetch(`${wcUrl}/wp-json/tablepress/v1/table/${tblshort}`);
      if (!response.ok) return json;

      json = await response.json();
      const linkAPI = json.meta?.api;
      const isAPI = linkAPI?.length > 0;

      if (json.items && Array.isArray(json.items)) {
        for (const item of json.items) {
          let datasAPI: any = null;

          // Chạy vòng lặp qua các key của item
          for (const id of Object.keys(item)) {
            const value = String(item[id] ?? '');

            // FIX lỗi logic: Check responseAPI.ok thay vì response.ok
            if (isAPI && id === 'api-key') {
              const responseAPI = await fetch(`${wcUrl}${linkAPI.replaceAll(id, value)}`);
              if (responseAPI.ok) { // <-- Đã sửa từ `response.ok` thành `responseAPI.ok`
                datasAPI = await responseAPI.json();
                item['keyAPI'] = value;
              }
            } else {
              if (id.startsWith('api-') && datasAPI?.length > 0) {
                const val = getNestedValue(datasAPI[0], value);
                item[id.substring(4)] = val ?? value;
              }

              if (id.startsWith('lucide-')) {
                const key = id.substring(7);

                if (!item[key] || !item[key][value]) {
                  if (iconCache.has(value)) {
                    item[key] = iconCache.get(value)!;
                  } else {
                    // Tìm ra tên file chuẩn (ví dụ: "circle-2")
                    const kebabName = fixLucideIconName(value);

                    if (kebabName) {
                      try {
                        // Import chính xác file .js bằng tên kebab-case đã được sửa
                        const module = await import(
                          `lucide-react/dist/esm/icons/${kebabName}.js`
                        );
                        const IconComponent = module.default;

                        // Render sang SVG String gửi xuống Client
                        const svgString = ReactDOMServer.renderToString(
                          React.createElement(IconComponent, { size: 24 })
                        );

                        item[key] = svgString;
                        iconCache.set(value, svgString);
                      } catch (error) {
                        console.error(`Không thể import file: ${kebabName}.js`, error);
                        item[key] = '';
                      }
                    } else {
                      console.warn(`Icon nhập từ CMS không tồn tại: "${value}"`);
                      item[key] = '';
                    }
                  }
                }
              }

              if (value.match(imgRegex)) {
                const tblPressmatches_imgs = Array.from(value.matchAll(imgRegex));
                for (const match of tblPressmatches_imgs) {
                  const originalSrc = match[1];
                  if (originalSrc && !originalSrc.startsWith('data:')) {
                    const storedTblPressImage = await processAndStoreImage({
                      imageUrl: originalSrc,
                      wcUrl: wcUrl,
                      publicDirBase: 'images/pages',
                      isPreview: isPreview,
                    });
                    item[id] = storedTblPressImage;
                  }
                }
              } else {
                if (typeof item[id] === 'string') {
                  item[id] = replaceAllProperties(item[id], data_info, lang);
                }
              }
            }
          }
        }
      }

      return json;

    } catch (err) {
      // Nếu lỗi thì xóa khỏi cache để lần sau có thể request lại
      processedtblPressCache.delete(tblshort);
      throw new Error(`Lỗi xử lý API tablepress ${tblshort}: ${err instanceof Error ? err.message : err}`);
    }
  })();

  // 4. Set Promise vào Map NGAY LẬP TỨC
  processedtblPressCache.set(tblshort, tableProcessPromise);

  // Giới hạn cache tối đa 500 table trong RAM (Tùy chọn cho SSR)
  if (processedtblPressCache.size > 500) {
    const firstKey = processedtblPressCache.keys().next().value;
    if (firstKey) processedtblPressCache.delete(firstKey);
  }

  return tableProcessPromise;
}