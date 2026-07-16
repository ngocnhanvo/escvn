// src/lib/wordpress/tablepress/tablePressProcessor.ts
import { WPInfo } from '@/entities/WPInfo';
import { Products } from '@/entities/Products';
import { getData } from './getData';



interface ProcessOptions {
  tblshort: string;
  WC_URL: string;
  publicDirBase?: string;
  isPreview?: boolean;
  data_info: WPInfo;
  products: Products[];
  lang: string;
}

export const removeTargetImgRegex = /<img[^>]*class="[^"]*tablepress-attached-image[^"]*"[^>]*>/g;
export const imgRegex = /<img[^>]+src="([^">]+)"/g;
export const imgRegexFull = /<img([\s\S]*?)src="([^"]+)"([\s\S]*?)>/gi;
export const tblPressRegex = /\[table id=\s*([a-zA-Z0-9_-]+)\s*\/]/g;
export const tablepressRegex = /<div[^>]*class="tablepress-preview-wrap"[^>]*>[\s\S]*?data-table-id="([^"]+)"[\s\S]*?<\/div>/gi;