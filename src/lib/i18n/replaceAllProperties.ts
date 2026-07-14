import { replacePlaceholders } from "../stringUtils/replacePlaceholders";

export const replaceAllProperties = (text: string, data: any, lang: string) => {
  const dictionary = Object.keys(data || {}).reduce((acc, key) => {
    const value = data[key];

    // Nếu giá trị là một object và có chứa key ngôn ngữ hiện tại
    if (value && typeof value === 'object' && lang in value) {
      acc[key] = value[lang] || '';
    } else {
      // Nếu là string/number bình thường (email, sodienthoai, domain...)
      acc[key] = value || '';
    }

    return acc;
  }, {});

  text = replacePlaceholders(text, dictionary);
  return text;
};

export const replaceAllPropertiesNoLang = (sourceString: string, dataInfo: any) => {
  if (typeof sourceString !== 'string') return sourceString;

  // Bản thân Regex đã tự bóc: Nhóm 1 (property) và Nhóm 2 (currentLang)
  const regex = /\$info\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g;

  return sourceString.replace(regex, (match, property, currentLang) => {
    // Nếu tồn tại dataInfo.vi.tencongty hoặc dataInfo.en.tencongty
    if (dataInfo && dataInfo[property] && dataInfo[property][currentLang] !== undefined) {
      return dataInfo[property][currentLang];
    }
    
    // Nếu không tìm thấy cấu trúc data tương ứng, giữ nguyên text gốc ($info.tencongty.vi)
    return match; 
  });
}