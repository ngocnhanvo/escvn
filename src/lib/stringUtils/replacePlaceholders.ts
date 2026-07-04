export const replacePlaceholders = (templateStr: string, dataObj: any) => {
  if (!templateStr) return '';
  
  // Sử dụng Regex để tìm các chuỗi nằm trong cặp dấu ngoặc nhọn {key}
  return templateStr.replace(/{(\w+)}/g, (match, key) => {
    // Nếu tìm thấy key trong dataObj thì lấy giá trị, ngược lại giữ nguyên text cũ (hoặc trả về chuỗi rỗng)
    return dataObj[key] !== undefined ? dataObj[key] : match;
  });
};