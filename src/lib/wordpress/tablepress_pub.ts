import { tablePress } from "@/entities";

export async function getTablePress(WC_URL: string, isPreview: boolean = false) {
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
    return tbls;
  } catch (error) {
    console.error(`❌ LỖI fetch Info:`, error);
    // Trả về đối tượng rỗng để tránh lỗi undefined trong các component React
    return [];
  }
}