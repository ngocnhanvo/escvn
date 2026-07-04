import { ProcessedImageResult } from "./ProcessedImageResult";

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