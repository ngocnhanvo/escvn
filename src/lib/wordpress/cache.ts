// src/lib/wordpress/cache.ts
import { Pages } from "@/entities/Pages";
import { WPInfo } from "@/entities/WPInfo";
import { mergeJSON, } from "../stringUtils/mergeJSON";
import { mergeJSONReverse } from "../stringUtils/mergeJSONReverse";
import { getInfo } from "./info";
import { getPages } from "./pages";
import { getTablePress } from "./tablepress_pub";
import menu_json from "@/data/menu.json";
import { replaceAllProperties } from "../i18n/replaceAllProperties";
import { processAndGetData } from "./tablePressProcessor";
import { getAvas } from "../avas_env";
import fs from "node:fs";
import path from "node:path";

// Biến lưu trữ tạm thời trong quá trình build
let cachedData: { data_info: WPInfo; pages: Pages[]; menus: any } | null = null;

export async function getSharedWordPressData(avas: any, preview: boolean = false) {
    let WC_URL;
    if (avas)
        WC_URL = avas.WC_URL;
    else {
        avas = getAvas(null);
        WC_URL = avas.WC_URL;
    }
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
        let tblPressLang = data_tablePress.filter((a) => { return a.shortcode.endsWith(`_${page.lang}`) });
        for (const table of tblPressLang) {
            table.json = await processAndGetData({
                tblshort: table.shortcode,
                wcUrl: WC_URL,
                data_info: data_info,
                lang: page.lang,
                isPreview: preview
            });
            if (!table.json?.items) continue;
            page.tablePress.push(table);
        }
    }
    // Lưu vào cache
    cachedData = { data_info, pages, menus };

    // 🌟 [BƯỚC THẦN THÁNH]: Ghi trực tiếp ra file public JSON phục vụ Client Hydrate tại đây.
    // Vì nằm sau lệnh check cachedData, khối lệnh này cam kết chỉ thực thi DUY NHẤT 1 LẦN khi build.
    // 1. Ghi file cấu hình chung (Giữ data_info, menus; hút mỡ pages)
    const minimalPages = pages.map(({ key, lang, slug, slugP, action, title, label }) => ({
        key, lang, slug, slugP, action, title, label
    }));

    const dirPath = "./public/data";
    const filePath = path.join(dirPath, "cms-common.json");

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        filePath,
        JSON.stringify({ data_info, menus, pages: minimalPages }) // thêm null, 2 để format JSON cho đẹp
    );

    // 2. Ghi các file nội dung riêng lẻ cho từng trang theo slug
    for (const page of pages) {
        const fileSlug = page.slug === "/" || page.slug === "" ? "default" : page.slug.replace(/^\/|\/$/g, "");
        fs.writeFileSync(
            `./public/data/page-${fileSlug}.json`,
            JSON.stringify(page)
        );
    }
    console.log("✅ [Astro Build] Tách file JSON thành công!");
    return cachedData;
}