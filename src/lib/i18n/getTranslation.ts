import { replaceAllProperties } from "./replaceAllProperties";
import translations from "@/data/i18n.json";
import { AppRouterProps } from "@/entities/AppRouterProps";

export const getTranslation = (key: string, language: string, props?: AppRouterProps): string => {
  let text: string | undefined = translations[language][key as keyof typeof translations['vi']] || key;
  if (props) {
    text = replaceAllProperties(text, props.data_info, language);
  }

  return text;
};