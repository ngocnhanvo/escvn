import { removeUnicode } from "./removeUnicode";

/**
 * Định dạng số thành chuỗi tiền tệ VNĐ.
 * @param amount Số tiền cần định dạng.
 * @returns Chuỗi tiền tệ đã định dạng (ví dụ: "1.000.000 VNĐ").
 */
export const formatCurrency = (amount: number | string, currency: string = 'VND'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return ''; // Trả về chuỗi rỗng nếu không phải là số hợp lệ
  }
  currency = removeUnicode(currency);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(num);
};