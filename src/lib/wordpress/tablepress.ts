import { Products, WPInfo } from "@/entities";
import { Pages } from "@/entities/Pages";
import { tablePress } from "@/entities/tablePress";
import { processAndGetData } from "./tablePressProcessor";

export async function getTablePress(WC_URL: string, pages: Pages[], data_info: WPInfo, products: Products[], isPreview: boolean = false) {
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    const response = await fetch(
      `${WC_URL}/wp-json/tablepress/v1/tables/prefix/pub_`
    );

    const data = await response.json();
    const tbls: tablePress[] = Array.isArray(data)
      ? data.map(item => ({
        shortcode: item.id.toString(), // Chuyển sang string nếu cần
        json: null // hoặc fetch dữ liệu chi tiết tại đây nếu muốn
      }))
      : [];

    const tasks = [];

    for (let i = 0, lenPages = pages.length; i < lenPages; i++) {
      const page = pages[i];
      const contents = page?.contents;

      // Kiểm tra an toàn xem contents có phải là mảng không
      if (!Array.isArray(contents)) continue;

      for (let i2 = 0, lenContents = contents.length; i2 < lenContents; i2++) {
        const contentItem = contents[i2]; // Sửa lỗi i thành i2 ở đây

        if (contentItem?.shortcode) {
          // Thay vì await trực tiếp, ta tạo một hàm xử lý async rồi đẩy vào mảng tasks
          const task = (async () => {
            const json = await processAndGetData({
              tblshort: contentItem.shortcode,
              wcUrl: WC_URL,
              data_info: data_info,
              products,
              lang: page?.lang,
              isPreview: isPreview
            });

            if (json) {
              contentItem.data = json; // Cập nhật data trực tiếp
            }
          })();

          tasks.push(task);
        }
      }
    }
    // Kích hoạt tất cả các API chạy song song cùng lúc và đợi toàn bộ hoàn thành
    await Promise.all(tasks);
    return tbls;
  }
  catch (error) {
    console.error(`❌ LỖI fetch Info:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}