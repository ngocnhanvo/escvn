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

        if (json.items) {
            for (const item of json.items) {
                for (const id of Object.keys(item)) {
                    const value = String(item[id]);
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

        processedtblPressCache.add({
            shortcode: tblshort,
            json: json
        });
    } catch (err) {
        throw new Error(`Lỗi xử lý API tablepress ${tblshort}:`, err);
    }

    return json;
}