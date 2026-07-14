// src/lib/wordpress/products/getDataFromLogs.ts
import { Products } from "@/entities/Products";
import { getData } from "./getData";
import { tablePress, WPInfo } from "@/entities";

export async function getDataFromLogs(
  tablepress_old: tablePress[], 
  allWPTablePress: any[], 
  WC_URL: string, 
  data_info: WPInfo, 
  products: Products[],
  isPreview: boolean = false
) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    // 1. Phân loại Log từ API gộp dựa trên action
    const deleteIds = new Set<string>();
    const rawModifyProducts: any[] = [];
    allWPTablePress.forEach((logItem: any) => {
      const stringId = String(logItem.table?.id);
      
      if (logItem.action === "del") {
        deleteIds.add(stringId);
      } else if (logItem.action === "modify" && logItem.table) {
        // Đẩy phần data sản phẩm thô vào mảng để xử lý ngôn ngữ/hình ảnh
        rawModifyProducts.push(logItem.table);
      }
    });

    // 2. Thực hiện XÓA các product có action 'del' khỏi danh sách cũ
    let updatedTablePress = tablepress_old.filter(
      (oldProd) => !deleteIds.has(String(oldProd.shortcode))
    );

    // 3. CHUYỂN ĐỔI các product có action 'modify' qua hàm định dạng chuẩn đa ngôn ngữ
    console.log(`allWPTablePress`, allWPTablePress);
    let tablepress_new: tablePress[] = [];
    if (rawModifyProducts.length > 0) {
      tablepress_new = await getData(rawModifyProducts, WC_URL, data_info, products, isPreview);
    }

    // 4. SO SÁNH và CẬP NHẬT (Merge) danh sách product cũ
    // Sử dụng Map để tăng tốc độ tra cứu (O(1)) thay vì dùng song song nested loop
    const productMap = new Map<string, tablePress>();
    
    // Nạp toàn bộ danh sách đã được lọc bỏ các phần tử xóa vào Map
    updatedTablePress.forEach((prod) => productMap.set(String(prod.shortcode), prod));

    // Duyệt qua danh sách sản phẩm mới để cập nhật đè hoặc thêm mới vào Map
    tablepress_new.forEach((newProd) => {
      productMap.set(String(newProd.shortcode), newProd);
    });

    // Chuyển Map ngược lại thành mảng phẳng để trả về kết quả cuối cùng
    return Array.from(productMap.values());
  }
  catch (err) {
    throw new Error(`Lỗi tại getDataFromLogs.ts: ${err instanceof Error ? err.message : err}`);
  }
}