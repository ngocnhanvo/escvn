import { Pages, tablePress, WPInfo } from '@/entities';
import { processAndStoreImage } from './imageProcessor';
import { replaceAllProperties } from '../i18n';

interface ProcessOptions {
    tblshort: string;
    wcUrl?: string;
    publicDirBase?: string;
    isPreview?: boolean;
    data_info: WPInfo;
    lang: string;
}
export const imgRegex = /<img[^>]+src="([^">]+)"/g;
export const getNestedValue = function(obj, pathString) {
    if (!obj || !pathString) return undefined;

    // 1. Dọn dẹp: Xóa tất cả dấu '?' (vì chúng ta sẽ tự handle an toàn)
    // 2. Chuẩn hóa mảng: Thay '[0]' thành '.0' để dễ dùng split('.')
    let cleanPath = pathString
        .replace(/\?/g, '')
        .replace(/\[(\d+)\]/g, '.$1');

    // 3. Tách chuỗi thành mảng các key bằng dấu chấm
    // Ví dụ: "_embedded.wp:featuredmedia.0.source_url" -> ["_embedded", "wp:featuredmedia", "0", "source_url"]
    const keys = cleanPath.split('.').filter(Boolean);

    // 4. Duyệt qua từng key một cách an toàn (tương tự optional chaining)
    return keys.reduce((current, key) => {
        return (current && current[key] !== undefined) ? current[key] : undefined;
    }, obj);
}

const processedtblPressCache = new Set<tablePress>();
export async function processAndGetData({
    tblshort,
    wcUrl,
    publicDirBase = 'tablepress',
    isPreview = false,
    data_info,
    lang,
}: ProcessOptions): Promise<any> {
    let json: any = {};
    try {
        const exist = Array.from(processedtblPressCache).find(item => item.shortcode === tblshort);
        if (exist) {
            return exist.json;
        }

        const response = await fetch(`${wcUrl}/wp-json/tablepress/v1/table/${tblshort}`);
        if (!response.ok) return json;
        json = await response.json();
        const linkAPI =  json.meta?.api;
        const isAPI = linkAPI?.length > 0 ? true : false;
        if (json.items) {
            for (const item of json.items) {
                let datasAPI:any;
                for (const id of Object.keys(item)) {
                    const value = String(item[id]);
                    if(isAPI && id == 'api-key') {
                        const responseAPI = await fetch(`${wcUrl}${linkAPI.replaceAll(id, value)}`);
                        if (response.ok) {
                            datasAPI = await responseAPI.json();
                        }
                    }
                    else {
                        if(id.startsWith('api-') && datasAPI?.length > 0) {
                            const val = getNestedValue(datasAPI[0], value);
                            item[id.substring(4)] = val ?? value;
                        }

                        if (value.match(imgRegex)) {
                            const tblPressmatches_imgs = Array.from(value.matchAll(imgRegex));
                            for (const match of tblPressmatches_imgs) {
                                const originalSrc = match[1];
                                // Bỏ qua các ảnh dạng base64
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
                        }
                        else {
                            if (typeof item[id] === 'string')
                                item[id] = replaceAllProperties(item[id], data_info, lang);
                        }
                    }
                }
            }
        }

        processedtblPressCache.add({
            shortcode: tblshort,
            json: json
        });
    } catch (err) {
        throw new Error(`Lỗi xử lý API tablepress ${tblshort}:`, err);
    }

    return json;
}