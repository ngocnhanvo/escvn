// src/lib/wordpress/cache.ts
import { Pages } from "@/entities/Pages";
import { WPInfo } from "@/entities/WPInfo";
import { mergeJSON, } from "../stringUtils/mergeJSON";
import { mergeJSONReverse } from "../stringUtils/mergeJSONReverse";
import { getInfo } from "./info";
import { getPages } from "./pages";
import { getTablePress } from "./tablepress";
import menu_json from "@/data/menu.json";
import { replaceAllProperties } from "../i18n/replaceAllProperties";
import { clearTablePressCache, processAndGetData } from "./tablePressProcessor";
import { getAvas } from "../avas_env";
import fs from "node:fs";
import path from "node:path";
import { getProducts } from "./products";
import { Products } from "@/entities/Products";
import { copyDirectory } from '@/lib/effects/copyDirectory';
import { clearProcessedImagesCache } from "./imageProcessor";
// Biến lưu trữ tạm thời trong quá trình build
let cachedData: { data_info: WPInfo; pages: Pages[]; menus: any, data_products: Products[] } | null = null;

/**
 * Hàm ghi dữ liệu JSON vào file, tự động tạo thư mục nếu chưa tồn tại.
 * @param fileDest - Có thể là một chuỗi đường dẫn ("./public/data/file.json") hoặc mảng các thành phần (["./public", "data", "file.json"])
 * @param data - Dữ liệu cần ghi vào file (Object, Array, v.v.)
 */
export function writeJsonFile(fileDest: string | string[], data: any): void {
    try {
        // 1. Chuẩn hóa đường dẫn file thành một chuỗi duy nhất
        const resolvedPath = Array.isArray(fileDest)
            ? path.join(...fileDest)
            : fileDest;

        // 2. Lấy ra đường dẫn thư mục cha chứa file đó
        const dirPath = path.dirname(resolvedPath);

        // 3. Kiểm tra và tự động tạo thư mục (recursive) nếu chưa có
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // 4. Ghi file
        fs.writeFileSync(
            resolvedPath,
            JSON.stringify(data),
            'utf-8'
        );

        console.log(`[Success] Đã ghi file thành công tại: ${resolvedPath}`);
    } catch (error) {
        console.error(`[Error] Thất bại khi ghi file JSON:`, error);
        throw error; // Ném lỗi ra ngoài nếu cần xử lý tiếp ở tầng gọi hàm
    }
}

export async function getSharedWordPressData(avas: any, preview: boolean = false) {
    let WC_URL;
    if (avas)
        WC_URL = avas.WC_URL;
    else {
        avas = getAvas(null);
        WC_URL = avas.WC_URL;
    }
    clearTablePressCache();
    clearProcessedImagesCache();
    // Nếu đã có dữ liệu trong bộ nhớ rồi thì trả về luôn, không fetch lại nữa
    let enableCache = String(avas.cache).toLowerCase() === 'true';
    let folder = "./public/data", folderIMG = "./public/images", isLoaded = false;
    if (preview) {
        enableCache = false;
        cachedData = undefined;
        isLoaded = true;
    }
    else if (cachedData) {
        return cachedData;
    }

    const CACHE_DIR = path.join(process.cwd(), ".cache");
    const filePathCache = path.join(CACHE_DIR, "data.json");
    const filePathCacheIMG = path.join(CACHE_DIR, "images");
    const filePathCacheProducts = path.join(CACHE_DIR, "products.json");
    console.log(`enableCache`, enableCache);
    if (enableCache) {
        try {
            if (fs.existsSync(filePathCache)) {
                const fileContent = fs.readFileSync(filePathCache, 'utf-8');
                cachedData = JSON.parse(fileContent);
            }
        } catch (error) {
            console.log("❌ file cache lỗi:", error);
        }
    }

    let skipFetch = false;
    if (cachedData?.pages?.length > 0) {
        skipFetch = true;
        const srcDir = filePathCacheIMG;
        const destDir = path.join(folderIMG);
        copyDirectory(srcDir, destDir);
    }

    if (!skipFetch) {
        // Nếu chưa có (lần gọi đầu tiên), tiến hành fetch từ WordPress API
        console.log("🚀 [Astro Build] Fetching data from WordPress API (Only Once)...");
        let startTime = Date.now();
        const data_info = (await getInfo(WC_URL, preview))[0];
        let endTime = Date.now();
        console.log(`✅ Info.ts xong trong ${(endTime - startTime) / 1000} giây.`);

        startTime = Date.now();
        let pages = await getPages(WC_URL, data_info, preview);
        endTime = Date.now();
        console.log(`✅ Pages.ts xong trong ${(endTime - startTime) / 1000} giây.`);

        startTime = Date.now();
        let data_products = [];
        if (fs.existsSync(filePathCacheProducts)) {
            const fileContentProduct = fs.readFileSync(filePathCacheProducts, 'utf-8');
            if (fileContentProduct)
                data_products = JSON.parse(fileContentProduct);
        }
        data_products = await getProducts(data_products, WC_URL, pages, preview);
        writeJsonFile(filePathCacheProducts, data_products);

        endTime = Date.now();
        console.log(`✅ Products.ts xong trong ${(endTime - startTime) / 1000} giây.`);
        startTime = Date.now();
        const pagestblPress = pages.filter(page => page.contents?.length > 0);
        const data_tablePress = await getTablePress(WC_URL, pagestblPress, data_info, data_products, preview);
        endTime = Date.now();
        console.log(`✅ Tablepress.ts xong trong ${(endTime - startTime) / 1000} giây.`);

        pages = mergeJSONReverse(pages, menu_json);
        let menus = mergeJSON(pages, menu_json);
        for (const page of pages) {
            page.isLoaded = isLoaded;
            page.title = replaceAllProperties(page.title, data_info, page.lang);
            page.description = replaceAllProperties(page.description, data_info, page.lang);
            let tblPressLang = data_tablePress.filter((a) => { return a.shortcode.endsWith(`_${page.lang}`) });
            for (const table of tblPressLang) {
                table.json = await processAndGetData({
                    tblshort: table.shortcode,
                    wcUrl: WC_URL,
                    data_info: data_info,
                    products: data_products,
                    lang: page.lang,
                    isPreview: preview
                });
                if (!table.json?.items) continue;
                page.tablePress.push(table);
            }
        }
        cachedData = { data_info, pages, menus, data_products };

        if (!preview) {
            writeJsonFile(filePathCache, cachedData);
            const srcDir = path.join(folderIMG);
            const destDir = filePathCacheIMG;
            copyDirectory(srcDir, destDir);
        }
    }

    if (!preview) {
        const minimalPages = cachedData.pages.map(({ key, lang, slug, slugP, action, title, label }) => ({
            key, lang, slug, slugP, action, title, label
        }));

        let filePath = path.join(folder, "cms-common.json");
        const jsonData = { data_info: cachedData.data_info, menus: cachedData.menus, pages: minimalPages };
        writeJsonFile(filePath, jsonData);

        filePath = path.join(folder, "cms-products.json");
        writeJsonFile(filePath, cachedData.data_products);

        // 2. Ghi các file nội dung riêng lẻ cho từng trang theo slug
        for (const page of cachedData.pages) {
            const fileSlug = page.slug === "/" || page.slug === "" ? "default" : page.slug.replace(/^\/|\/$/g, "");
            fs.writeFileSync(
                `${folder}/page-${fileSlug}.json`,
                JSON.stringify(page)
            );
        }
        console.log("✅ [Astro Build] Tách file JSON thành công!");
    }

    return cachedData;
}