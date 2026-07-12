// src/lib/wordpress/products/getDataFromLogs.ts
import { Pages } from "@/entities/Pages";
import { Products } from "@/entities/Products";
import { getData } from "./getData";

export async function getDataFromLogs(
  products_old: Products[], 
  allWPProducts: any[], 
  WC_URL: string, 
  pages: Pages[], 
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
    allWPProducts.forEach((logItem: any) => {
      const stringId = String(logItem.id);
      
      if (logItem.action === "del") {
        deleteIds.add(stringId);
      } else if (logItem.action === "modify" && logItem.product) {
        // Đẩy phần data sản phẩm thô vào mảng để xử lý ngôn ngữ/hình ảnh
        rawModifyProducts.push(logItem.product);
      }
    });

    // 2. Thực hiện XÓA các product có action 'del' khỏi danh sách cũ
    let updatedProducts = products_old.filter(
      (oldProd) => !deleteIds.has(String(oldProd._id))
    );

    // 3. CHUYỂN ĐỔI các product có action 'modify' qua hàm định dạng chuẩn đa ngôn ngữ
    let products_new: Products[] = [];
    if (rawModifyProducts.length > 0) {
      products_new = await getData(rawModifyProducts, WC_URL, pages, isPreview);
    }

    // 4. SO SÁNH và CẬP NHẬT (Merge) danh sách product cũ
    // Sử dụng Map để tăng tốc độ tra cứu (O(1)) thay vì dùng song song nested loop
    const productMap = new Map<string, Products>();
    
    // Nạp toàn bộ danh sách đã được lọc bỏ các phần tử xóa vào Map
    updatedProducts.forEach((prod) => productMap.set(String(prod._id), prod));

    // Duyệt qua danh sách sản phẩm mới để cập nhật đè hoặc thêm mới vào Map
    products_new.forEach((newProd) => {
      productMap.set(String(newProd._id), newProd);
    });

    // Chuyển Map ngược lại thành mảng phẳng để trả về kết quả cuối cùng
    return Array.from(productMap.values());
  }
  catch (err) {
    throw new Error(`Lỗi tại getDataFromLogs.ts: ${err instanceof Error ? err.message : err}`);
  }
}