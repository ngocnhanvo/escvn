import { AppRouterProps } from "@/entities/AppRouterProps";
import { returnCurrentPath } from "./returnCurrentPath";
import { Pages } from "@/entities/Pages";

export const returnCurrentPage = (props: AppRouterProps, language: string) => {
  const currentPath = returnCurrentPath(props.basename);
  const page = props.pages.find((a: Pages) => a.slug === currentPath && a.lang === language);
  return page;
};