import { AppRouterProps } from "@/entities";
import { replacePlaceholders } from "@/lib/stringUtils";
import translations from "@/data/i18n.json";
export type Language = 'vi' | 'en';

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

export const getTranslation = (key: string, language: Language, props?: AppRouterProps): string => {
  let text: string | undefined = translations[language][key as keyof typeof translations['vi']] || key;
  if (props) {
    text = replaceAllProperties(text, props.data_info, language);
  }

  return text;
};

export const getContent = (pages: any, key: string, language: string, id?: number) => {
  let link: string | undefined = pages.filter((a) => {
    if (!a.slug) return false;
    return a.key === key && a.lang === language && (id ? a.id === id.toString() : true);
  })[0]?.slug;
  if (link)
    link = "/" + link;
  return link;
}
