import { Coupons } from "./Coupons";
import { ProcessedImageResult } from "./ProcessedImageResult";
import { Variations } from "./Variations";

export interface Products {
  _id: string;
  variation_id?: string;
  _name: string;
  item_key?: string;
  coupons_dktm?: Coupons;
  _createdDate?: Date;
  _updatedDate?: Date;
  itemName?: Record<string, string>;
  slug?: Record<string, string>;
  slugP?: Record<string, string>;
  itemPrice?: Record<string, number>;
  itemPriceCart?: Record<string, number>;
  itemPriceRegister?: Record<string, number>;
  itemPriceRenew?: Record<string, number>;
  itemPriceRegisterSale?: Record<string, number>;
  itemPriceRenewSale?: Record<string, number>;
  itemInstallment?: Record<string, number>;
  itemCurrency?: Record<string, string>;
  itemImage?: Record<string, ProcessedImageResult>;
  itemDescription?: Record<string, string>;
  itemDescriptionShort?: Record<string, string>;
  category?: Record<string, string>;
  quantity?: number;
  collectionId?: string;
  isFeatured?: Record<string, boolean>;
  variations?: Record<string, Variations[]>, 
}