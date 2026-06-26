// src/lib/wordpress/cache.ts
import { Pages, WPInfo } from "@/entities";
import { mergeJSON, mergeJSONReverse, replacePlaceholders } from "../stringUtils";
import { getInfo } from "./info";
import { getPages } from "./pages";
import menu_json from "@/data/menu.json";
import { replaceAllProperties } from "../i18n";

// Biến lưu trữ tạm thời trong quá trình build
let cachedData: { data_info: WPInfo; pages: Pages[]; menus: any } | null = null;

export async function getSharedWordPressData(preview: boolean = false) {
    // Nếu đã có dữ liệu trong bộ nhớ rồi thì trả về luôn, không fetch lại nữa
    if (cachedData) {
        return cachedData;
    }

    // Nếu chưa có (lần gọi đầu tiên), tiến hành fetch từ WordPress API
    console.log("🚀 [Astro Build] Fetching data from WordPress API (Only Once)...");
    const data_info = (await getInfo(preview))[0];
    let pages = await getPages(data_info, preview);
    pages = mergeJSONReverse(pages, menu_json);
    let menus = mergeJSON(pages, menu_json);
    pages.map(page => {
        page.title = replaceAllProperties(page.title, data_info, page.lang);
        page.description = replaceAllProperties(page.description, data_info, page.lang);
        return page;
    });
    // Lưu vào cache
    cachedData = { data_info, pages, menus };

    return cachedData;
}