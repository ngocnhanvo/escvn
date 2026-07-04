import { ProcessedImageResult } from "./ProcessedImageResult";

export interface WPInfo {
  id: number;
  tencongty?: Record<string, string>;
  domain?: Record<string, string>;
  diachiHCM?: Record<string, string>;
  diachiHaNoi?: Record<string, string>;
  googlemapHCM?: Record<string, string>;
  googlemapHaNoi?: Record<string, string>;
  sodienthoaiHCM?: Record<string, string>;
  sodienthoaiHaNoi?: Record<string, string>;
  emailHCM?: Record<string, string>;
  emailHaNoi?: Record<string, string>;
  hotline?: Record<string, string>;
  facebook?: Record<string, string>;
  twitter?: Record<string, string>;
  tiktok?: Record<string, string>;
  youtube?: Record<string, string>;
  logo?: Record<string, ProcessedImageResult>;
  favicon?: Record<string, ProcessedImageResult>;
  image?: Record<string, ProcessedImageResult>;
  mascot?: Record<string, ProcessedImageResult>;
  motaSeo?: Record<string, string>;
}