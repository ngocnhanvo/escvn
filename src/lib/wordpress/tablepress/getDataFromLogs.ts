// src/lib/wordpress/products/getDataFromLogs.ts
import { Products } from "@/entities/Products";
import { getData } from "./getData";
import { tablePress } from "@/entities/tablePress";
import { WPInfo } from "@/entities/WPInfo";

export async function getDataFromLogs(
  allWPTablePress_old: any[],
  allWPTablePress: any[],
  WC_URL: string,
  data_info: WPInfo,
  products: Products[],
  isPreview: boolean = false,
  icons: Record<string, string>
) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return {};
  }

  try {
    // 1. Phân loại Log từ API gộp dựa trên action
    const deleteIds = new Set<string>();
    const rawModifyTablePress: any[] = [];
    allWPTablePress.forEach((logItem: any) => {
      const stringId = String(logItem.table?.id);

      if (logItem.action === "del") {
        deleteIds.add(stringId);
      } else if (logItem.action === "modify") {
        if (logItem.table) {
          logItem.table.reload = true;
          rawModifyTablePress.push(logItem.table);
        }
        else
          deleteIds.add(stringId);
      }
    });

    // Thực hiện XÓA các tablepress có action 'del' khỏi danh sách cũ
    let tablePressMap = new Map(
      allWPTablePress_old
        .filter((oldProd) => !deleteIds.has(String(oldProd.id)))
        .map((prod) => [String(prod.id), prod])
    );

    // Duyệt qua danh sách tablepress mới để cập nhật đè hoặc thêm mới vào Map
    rawModifyTablePress.forEach((newProd) => {
      tablePressMap.set(String(newProd.id), newProd);
    });

    // 3. CHUYỂN ĐỔI các product có action 'modify' qua hàm định dạng chuẩn đa ngôn ngữ
    let updatedTablePress = Array.from(tablePressMap.values());
    let tablePresses: tablePress[] = [];
    if (updatedTablePress.length > 0) {
      tablePresses = await getData(updatedTablePress, WC_URL, data_info, products, isPreview, icons);
    }

    // Chuyển Map ngược lại thành mảng phẳng để trả về kết quả cuối cùng
    return {
      allWPTablePress: updatedTablePress,
      tablePresses
    };
  }
  catch (err) {
    throw new Error(`Lỗi tại getDataFromLogs.ts TablePress: ${err instanceof Error ? err.message : err}`);
  }
}