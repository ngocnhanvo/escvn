import currencies from '@/data/currencies.json';

export interface CurrencyItem {
  key: string;
  code: string;
  symbol: string;
  name_vi: string;
  name_en: string;
}

export function getCurrencyByKey(key: string): CurrencyItem | undefined {
  return currencies.find(c => c.key === key.toLowerCase());
}