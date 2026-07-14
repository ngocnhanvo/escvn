// src/lib/wordpress/tablepress/index.ts
import { Products } from "@/entities/Products";
import { WPInfo } from "@/entities/WPInfo";
import { Pages } from "@/entities/Pages";
import { tablePress } from "@/entities/tablePress";
import { getDataFromLogs } from "./getDataFromLogs";
import { getData } from "./getData";
import { embedTablePress } from "./embedTablePress";

export async function getTablePress(tablePress: any[], WC_URL: string, pages: Pages[], data_info: WPInfo, products: Products[], isPreview: boolean = false) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    let allWPTablePress: any[] = [];
    let page = 1;
    let totalPages = 1;
    const perPage = 100; // Tối đa số lượng sản phẩm mỗi lần fetch theo quy định của WP API

    const coTablePress = tablePress.length > 0;
    let link = `${WC_URL}/wp-json/astro/v1/get-tablepress-logs`;
    do {
      if (!coTablePress)
        link = `${WC_URL}/wp-json/tablepress/v1/tables/prefix/all?per_page=${perPage}&page=${page}`;

      const response = await fetch(link);
      if (!response.ok) break;

      const data = await response.json();
      allWPTablePress = [...allWPTablePress, ...data];
      // Chỉ khi fetch full tất cả các bảng mới cần phân trang, link log thường trả về 1 mảng trọn vẹn
      if (!coTablePress) {
        totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);
        page++;
      } else {
        break; // Lấy xong log thì ngắt luồng luôn, không lặp lại link log
      }
    } while (page <= totalPages);

    let tablepressFN: tablePress[] = [];
    //Nếu có tablepress cache rồi thì không làm theo quy trình cũ nữa mà sẽ kiểm tra log để cập nhật
    if (coTablePress) {
      tablepressFN = await getDataFromLogs(tablePress, allWPTablePress, WC_URL, data_info, products, isPreview);
    }
    else {
      tablepressFN = await getData(allWPTablePress, WC_URL, data_info, products, isPreview);
    }

    // 1. Lấy toàn bộ mảng dữ liệu TablePress đã được làm sạch từ cache/logs
    if (!tablepressFN || tablepressFN.length === 0) {
      console.warn("⚠️ Không tìm thấy hoặc mảng data_tablePress đang rỗng.");
      return pages;
    }

    // 2. Chạy vòng lặp song song xử lý embed dữ liệu cho từng page
    const processedPages = await Promise.all(
      pages.map(async (page) => {
        try {
          // Hàm embedTablePress sẽ chỉnh sửa trực tiếp hoặc trả về page đã nhúng đủ data
          return await embedTablePress(page, tablepressFN, data_info, products, isPreview);
        } catch (error) {
          console.error(`❌ Lỗi khi nhúng TablePress cho trang [${page?.slug || 'Unknown'}]:`, error);
          return page; // Trả về trang nguyên bản nếu lỗi để không làm gãy toàn bộ tiến trình build
        }
      })
    );
    return tablepressFN;
  }
  catch (error) {
    console.error(`❌ LỖI fetch Info:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}