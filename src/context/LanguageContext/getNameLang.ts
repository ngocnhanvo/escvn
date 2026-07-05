// Định nghĩa danh sách ngôn ngữ phổ biến
const languageMap: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語', // Sửa jp/ja thành Tiếng Nhật bản địa
  jp: '日本語', // Dự phòng nếu bạn vẫn truyền vào 'jp'
  ko: '한국어',  // Tiếng Hàn
  zh: '简体中文', // Tiếng Trung giản thể
  tw: '繁體中文', // Tiếng Trung phồn thể
  fr: 'Français', // Tiếng Pháp
  de: 'Deutsch',  // Tiếng Đức
  es: 'Español',  // Tiếng Tây Ban Nha
  it: 'Italiano', // Tiếng Ý
  ru: 'Русский',  // Tiếng Nga
  th: 'ไทย',      // Tiếng Thái
  id: 'Bahasa Indonesia', // Tiếng Indo
};

export const getNameLang = (code: string): string => {
  const lowerCode = code.toLowerCase();
  return languageMap[lowerCode] || '';
};