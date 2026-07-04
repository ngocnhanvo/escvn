import { removeUnicode } from "./removeUnicode";

export const formatCurrencyValue = (amount: number | string, currency: string = 'VND', numb: number = 1): string => {
  let num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return ''; // Trả về chuỗi rỗng nếu không phải là số hợp lệ
  }
  currency = removeUnicode(currency);
  let text = '';
  if(currency === 'VND') {
    if(numb === 3) {
      num = num / 1000;
      text = 'k';
    }
  }
  return new Intl.NumberFormat('vi-VN').format(num) + text;
};