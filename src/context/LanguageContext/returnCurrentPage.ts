import { AppRouterProps } from "@/entities/AppRouterProps";
import { returnCurrentPath } from "./returnCurrentPath";
import { Pages } from "@/entities/Pages";
import { pageService } from "@/services/pageService";
import { registerPageComponents } from "@/lib/componentsReg/componentRegistry";

export const returnCurrentPageAsync = async(props?: AppRouterProps, language?: string) => {
  const currentPath = returnCurrentPath();
  const page = await pageService.getPageData(currentPath);
  await registerPageComponents(page);
  return page;
};

export const returnCurrentPage = (props: AppRouterProps, language: string) => {
  const currentPath = returnCurrentPath(props.basename);
  const page = props.pages.find((a: Pages) => a.slug === currentPath && a.lang === language);
  return page;
};