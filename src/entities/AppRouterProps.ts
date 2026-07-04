import { Pages } from "./Pages";
import { Products } from "./Products";
import { WPInfo } from "./WPInfo";

export interface AppRouterProps {
  basename?: string;
  pages: Pages[];
  menus?: Pages[];
  data_info?: WPInfo;
  data_pages?: Pages[];
  data_products?: Products[];
  status?: number;
}