import { ProcessedImageResult } from "./ProcessedImageResult";
import { tablePress } from "./tablePress";

export interface PageBlock {
  type: 'html' | 'shortcode';
  content?: string; // Nếu html
  shortcode?: string; // Nếu là shortcode
  data?: any; // Dữ liệu json đã fetch
}

export interface WPPage {
  id?: number;
  name?: string;
  slug?: Record<string, string>;
  title?: Record<string, string>;
  content?: Record<string, string>;
  image?: Record<string, ProcessedImageResult>;
  description?: Record<string, string>;
  order?: number;
}

export interface Pages {
  key: string,
  lang: string,
  id?: string, 
  idP?: string,
  slug?: string,
  slugP?: string,
  title?: string,
  label?: string,
  action?: string,
  description?: string,
  content?: string,
  contents?: PageBlock[],
  image?: Record<string, ProcessedImageResult>,
  ogImage?: string,
  mega?: Pages[],
  header?: boolean,
  tablePress?: tablePress[]
}
