// src/lib/wordpress/pages/getDataFromLogs.ts
import { Pages } from "@/entities/Pages";
import { getData } from "./getData";
import { WPInfo } from "@/entities/WPInfo";

export async function getDataFromLogs(
  allWPPages_old: any[],
  allWPPages: any[],
  WC_URL: string,
  data_info: WPInfo,
  isPreview: boolean = false
) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    // 1. Phân loại Log từ API gộp dựa trên action
    const deleteIds = new Set<string>();
    const rawModifyPages: any[] = [];
    allWPPages.forEach((logItem: any) => {
      const stringId = String(logItem.id);

      if (logItem.action === "del") {
        deleteIds.add(stringId);
      } else if (logItem.action === "modify") {
        // Đẩy phần data sản phẩm thô vào mảng để xử lý ngôn ngữ/hình ảnh
        if(logItem.page) {
          logItem.page.reload = true;
          rawModifyPages.push(logItem.page);
        }
        else
          deleteIds.add(stringId);
      }
    });

    // Thực hiện XÓA các product có action 'del' khỏi danh sách cũ
    let pageMap = new Map(
      allWPPages_old
        .filter((oldProd) => !deleteIds.has(String(oldProd.id)))
        .map((prod) => [String(prod.id), prod])
    );

    // Duyệt qua danh sách sản phẩm mới để cập nhật đè hoặc thêm mới vào Map
    rawModifyPages.forEach((newProd) => {
      pageMap.set(String(newProd.id), newProd);
    });

    // 3. CHUYỂN ĐỔI các product có action 'modify' qua hàm định dạng chuẩn đa ngôn ngữ
    let updatedPages = Array.from(pageMap.values());
    let pages: Pages[] = [];
    if (updatedPages.length > 0) {
      
      pages = await getData(updatedPages, WC_URL, data_info, isPreview);
    }

    // Chuyển Map ngược lại thành mảng phẳng để trả về kết quả cuối cùng
    return {
      allWPPages: updatedPages,
      pages
    };
  }
  catch (err) {
    throw new Error(`Lỗi tại getDataFromLogs.ts: ${err instanceof Error ? err.message : err}`);
  }
}