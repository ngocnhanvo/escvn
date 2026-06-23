/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

export interface ProcessedImageResult {
  alt?: string;
  src?: string;     // Đường dẫn ảnh mặc định (bản lớn nhất hoặc ảnh gốc)
  srcSet?: string;
  srcSets?: Record<string, string>;   // Chuỗi srcSet chứa nhiều kích thước phục vụ responsive
}

export interface Products {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  itemName?: Record<string, string>;
  slug?: Record<string, string>;
  slugP?: Record<string, string>;
  itemPrice?: Record<string, number>;
  itemInstallment?: Record<string, number>;
  itemCurrency?: Record<string, string>;
  itemImage?: Record<string, ProcessedImageResult>;
  itemDescription?: Record<string, string>;
  itemDescriptionShort?: Record<string, string>;
  category?: Record<string, string>;
  quantity?: number;
  collectionId?: string;
  isFeatured?: Record<string, boolean>;
}

export interface ContactSubmissions {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType text */
  emailAddress?: string;
  /** @wixFieldType text */
  phoneNumber?: string;
  /** @wixFieldType text */
  messageContent?: string;
  /** @wixFieldType datetime */
  submissionDate?: Date | string;
}

export interface Bivit {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  coverImage?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType text */
  author?: string;
  /** @wixFieldType datetime */
  publicationDate?: Date | string;
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
  image?: Record<string, ProcessedImageResult>,
  ogImage?: string,
  mega?: Pages[],
  header?: boolean
}

export interface AppRouterProps {
  basename?: string;
  pages: Pages[];
  menus?: Pages[];
  data_info?: WPInfo;
  data_pages?: Pages[];
  data_products?: Products[];
  status?: number;
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

/**
 * Collection ID: contactmessages
 * Interface for ContactMessages
 */
export interface ContactMessages {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  customerName?: string;
  /** @wixFieldType text */
  emailAddress?: string;
  /** @wixFieldType text */
  phoneNumber?: string;
  /** @wixFieldType text */
  messageContent?: string;
  /** @wixFieldType datetime */
  submissionDate?: Date | string;
}


/**
 * Collection ID: corevalues
 * Interface for CoreValues
 */
export interface CoreValues {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  valueTitle?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  valueImage?: string;
  /** @wixFieldType number */
  displayOrder?: number;
  /** @wixFieldType text */
  slogan?: string;
}