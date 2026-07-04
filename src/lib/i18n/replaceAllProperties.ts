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