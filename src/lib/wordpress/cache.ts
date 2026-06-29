// src/lib/wordpress/cache.ts
import { Pages, tablePress, WPInfo } from "@/entities";
import { mergeJSON, mergeJSONReverse, replacePlaceholders } from "../stringUtils";
import { getInfo } from "./info";
import { getPages } from "./pages";
import { getTablePress } from "./tablepress_pub";
import menu_json from "@/data/menu.json";
import { replaceAllProperties } from "../i18n";
import { processAndGetData } from "./tablePressProcessor";
import { getAvas } from "../avas_env";

const avas = getAvas(null);
export const WC_URL = avas.WC_URL; 
// Biến lưu trữ tạm thời trong quá trình build
let cachedData: { data_info: WPInfo; pages: Pages[]; menus: any } | null = null;

export async function getSharedWordPressData(preview: boolean = false) {
    // Nếu đã có dữ liệu trong bộ nhớ rồi thì trả về luôn, không fetch lại nữa
    if (cachedData) {
        return cachedData;
    }

    // Nếu chưa có (lần gọi đầu tiên), tiến hành fetch từ WordPress API
    console.log("🚀 [Astro Build] Fetching data from WordPress API (Only Once)...");
    const data_info = (await getInfo(WC_URL, preview))[0];
    const data_tablePress = await getTablePress(WC_URL, preview);
    let pages = await getPages(WC_URL, data_info, preview);
    pages = mergeJSONReverse(pages, menu_json);
    let menus = mergeJSON(pages, menu_json);
    for (const page of pages) {
        page.title = replaceAllProperties(page.title, data_info, page.lang);
        page.description = replaceAllProperties(page.description, data_info, page.lang);
        let tblPressLang = data_tablePress.filter((a) => {return a.shortcode.endsWith(`_${page.lang}`)});
        for (const table of tblPressLang) {
            table.json = await processAndGetData({
                tblshort: table.shortcode,
                wcUrl: WC_URL,
                data_info: data_info,
                lang: page.lang
            });
            if (!table.json?.items) continue;
            page.tablePress.push(table);
        }
    }
    // Lưu vào cache
    cachedData = { data_info, pages, menus };

    return cachedData;
}