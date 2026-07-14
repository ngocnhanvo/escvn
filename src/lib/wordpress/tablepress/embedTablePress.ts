// src/lib/wordpress/tablepress/embedTablePress.ts
import { Pages } from "@/entities/Pages";
import { tablePress } from "@/entities/tablePress";
import { WPInfo } from "@/entities/WPInfo";

/**
 * Hàm nhúng dữ liệu TablePress (tất cả đã được dịch sạch từ trước) vào cấu trúc trang.
 * Nhiệm vụ 1: Embed toàn bộ bảng 'pub_' vào page.tablePress của tất cả các trang.
 * Nhiệm vụ 2: Duyệt mảng page.contents, map dữ liệu tương ứng vào block có type 'shortcode'.
 */
export async function embedTablePress(
    page: Pages,
    data_tablePress: tablePress[],
    data_info: WPInfo,     // Giữ lại để không làm gãy interface gọi hàm cũ của bạn
    products: any[],      // Giữ lại để không làm gãy interface gọi hàm cũ của bạn
    isPreview: boolean = false
): Promise<any> {

    if (!page) return page;

    // ==========================================
    // NHIỆM VỤ 1: Luôn gom toàn bộ bảng toàn cục 'pub_' vào page.tablePress
    // ==========================================
    page.tablePress = page.tablePress || [];

    const pubTables = data_tablePress.filter(t => t.shortcode && t.shortcode.startsWith('pub_'));
    for (const table of pubTables) {
        const matchTable = page.tablePress?.find(t => t.shortcode === table.shortcode);
        if(matchTable)
            matchTable.json = table.json;
        else
            page.tablePress.push(table);
    }

    // Nếu trang không có cấu trúc mảng nội dung chi tiết, dừng xử lý Nhiệm vụ 2
    if (!page.contents || !Array.isArray(page.contents)) return page;

    // ==========================================
    // NHIỆM VỤ 2: Khớp dữ liệu đã tinh vào page.contents theo shortcode
    // ==========================================
    for (const content of page.contents) {
        if (content.type !== "shortcode" || !content.shortcode) continue;

        const shortcode = content.shortcode;

        // 1. Nếu là bảng pub_, lấy phao từ page.tablePress ra xài luôn cho nhanh
        if (shortcode.startsWith('pub_')) {
            if (page.tablePress[shortcode]) {
                content.data = page.tablePress[shortcode];
            }
            continue;
        }

        // 2. Với các bảng thường (contextual): Tìm bảng đã được xử lý tinh trong mảng cache
        const matchTable = data_tablePress.find(t => t.shortcode === shortcode);
        if (matchTable) {
            content.data = matchTable.json;
        } else {
            console.warn(`⚠️ Không tìm thấy dữ liệu sạch trong cache cho shortcode: ${shortcode}`);
        }
    }

    return page;
}