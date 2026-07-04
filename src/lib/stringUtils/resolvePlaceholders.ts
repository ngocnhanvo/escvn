import { escapeHtml } from "./escapeHtml";

/**
 * Thay thế các placeholder {key} bằng giá trị thực tế từ một object dữ liệu
 */
export const resolvePlaceholders = (text: string, data: any): string => {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = data[key];
    // Trước khi trả về, chúng ta escape giá trị để an toàn khi đưa vào HTML
    return value !== undefined ? escapeHtml(String(value)) : match;
  });
};