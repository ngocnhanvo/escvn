// src/lib/wordpress/info/getDataFromLogs.ts
import { getData } from "./getData";
import { WPInfo } from "@/entities/WPInfo";

export async function getDataFromLogs(
  allWPInfo_old: any[],
  allWPInfo: any[],
  WC_URL: string,
  isPreview: boolean = false
) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    // 1. Phân loại Log từ API gộp dựa trên action
    const deleteIds = new Set<string>();
    const rawModifyInfo: any[] = [];
    allWPInfo.forEach((logItem: any) => {
      const stringId = String(logItem.id);

      if (logItem.action === "del") {
        deleteIds.add(stringId);
      } else if (logItem.action === "modify") {
        // Đẩy phần data info thô vào mảng để xử lý ngôn ngữ/hình ảnh
        if(logItem?.info) {
          logItem.info.reload = true;
          rawModifyInfo.push(logItem.info);
        }
        else
          deleteIds.add(stringId);
      }
    });

    // Thực hiện XÓA các info có action 'del' khỏi danh sách cũ
    let infoMap = new Map(
      allWPInfo_old
        .filter((oldProd) => !deleteIds.has(String(oldProd.id)))
        .map((prod) => [String(prod.id), prod])
    );

    // Duyệt qua danh sách info mới để cập nhật đè hoặc thêm mới vào Map
    rawModifyInfo.forEach((newProd) => {
      infoMap.set(String(newProd.id), newProd);
    });

    // 3. CHUYỂN ĐỔI các info có action 'modify' qua hàm định dạng chuẩn đa ngôn ngữ
    let updatedInfo = Array.from(infoMap.values());
    let info: WPInfo[] = [];
    if (updatedInfo.length > 0) {
      info = await getData(updatedInfo, WC_URL, isPreview);
    }

    // Chuyển Map ngược lại thành mảng phẳng để trả về kết quả cuối cùng
    return {
      allWPInfo: updatedInfo,
      info
    };
  }
  catch (err) {
    throw new Error(`Lỗi tại info/getDataFromLogs.ts: ${err instanceof Error ? err.message : err}`);
  }
}