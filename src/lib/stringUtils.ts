/**
 * Escape các ký tự đặc biệt trong HTML để tránh lỗi định dạng và bảo vệ XSS
 */
import he from 'he';
import currencies from '@/data/currencies.json';

export interface CurrencyItem {
  key: string;
  code: string;
  symbol: string;
  name_vi: string;
  name_en: string;
}

// Giả sử mảng JSON trên được lưu vào biến currencies
export function getCurrencyByKey(key: string): CurrencyItem | undefined {
  return currencies.find(c => c.key === key.toLowerCase());
}

export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return he.encode(unsafe);
};

export const removeUnicode = (decodedStr: string) => {
  return decodedStr
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

export const replacePlaceholders = (templateStr: string, dataObj: any) => {
  if (!templateStr) return '';
  
  // Sử dụng Regex để tìm các chuỗi nằm trong cặp dấu ngoặc nhọn {key}
  return templateStr.replace(/{(\w+)}/g, (match, key) => {
    // Nếu tìm thấy key trong dataObj thì lấy giá trị, ngược lại giữ nguyên text cũ (hoặc trả về chuỗi rỗng)
    return dataObj[key] !== undefined ? dataObj[key] : match;
  });
};

export const getWebpPath = (url: string) => {
  if (!url) return "";

  // 1. Kiểm tra nếu đang chạy trên trình duyệt và đường dẫn hiện tại bắt đầu bằng /preview
  const isPreviewPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/preview');
  
  // 2. Nếu là đường dẫn tuyệt đối (bắt đầu bằng http), thường là ảnh từ WP chưa được xử lý local
  if (isPreviewPath || url.startsWith('http')) {
    return url;
  }

  return url.replace(/\.[^/.]+$/, "") + ".webp";
};

export const stripHtmlAndUnescape = (html: string): string => {
  if (!html) return '';
  // 1. Loại bỏ các thẻ HTML bằng Regex
  const regexStripHtml = /<[^>]*>?/gm;
  const plainText = html.replace(regexStripHtml, '');

  // 2. Giải mã các kí tự đặc biệt (entities) như &#34;, &nbsp;...
  return he.decode(plainText).replace(/\s+/g, ' ').trim();
};

/**
 * Thay thế các placeholder {key} bằng giá trị thực tế từ một object dữ liệu
 */
export const resolvePlaceholders = (text: string, data: any): string => {
  if (!text) return '';
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = data[key];
    // Trước khi trả về, chúng ta escape giá trị để an toàn khi đưa vào HTML
    return value !== undefined ? escapeHtml(String(value)) : match;
  });
};

/**
 * Định dạng số thành chuỗi tiền tệ VNĐ.
 * @param amount Số tiền cần định dạng.
 * @returns Chuỗi tiền tệ đã định dạng (ví dụ: "1.000.000 VNĐ").
 */
export const formatCurrency = (amount: number | string, currency: string = 'VND'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return ''; // Trả về chuỗi rỗng nếu không phải là số hợp lệ
  }
  currency = removeUnicode(currency);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency }).format(num);
};

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

export const mergeJSON = (pages:any, menu:any) => {
  // Bước 1: Tạo Map từ pages.json để tra cứu nhanh theo định dạng "key_lang"
  const pagesMap = {};
  pages.forEach(page => {
      const uniqueKey = `${page.key}_${page.lang}`;
      pagesMap[uniqueKey] = page;
  });

  // Hàm hỗ trợ gộp dữ liệu: Chỉ thêm vào nếu target chưa có thuộc tính đó
  function mergeData(targetItem) {
      const uniqueKey = `${targetItem.key}_${targetItem.lang}`;
      const sourceItem = pagesMap[uniqueKey];

      if (sourceItem) {
          // Lặp qua các thuộc tính của page
          for (const prop in sourceItem) {
              // Nếu menu chưa có thuộc tính này (undefined) thì mới thêm vào
              if (targetItem[prop] === undefined) {
                  targetItem[prop] = sourceItem[prop];
              }
          }
      }
  }

  // Bước 2 & 3: Duyệt qua menu.json và bổ sung dữ liệu
  const updatedMenu = menu.map(menuItem => {
      // Tạo một bản sao để tránh thay đổi trực tiếp dữ liệu gốc
      let newItem = { ...menuItem };

      // Bổ sung dữ liệu cho cấp ngoài cùng của menu
      mergeData(newItem);

      // Bước 4: Xử lý mảng con 'mega' nếu có
      if (newItem.mega && Array.isArray(newItem.mega)) {
          newItem.mega = newItem.mega.map(megaItem => {
              let newMegaItem = { ...megaItem };
              mergeData(newMegaItem);
              return newMegaItem;
          });
      }

      return newItem;
  });

  return updatedMenu;
}

export const mergeJSONReverse = (pages: any, menu: any) => {
  // Bước 1: Tạo Map từ menu.json, bao gồm cả các mục cha và mục con trong 'mega'
  const menuMap = {};

  menu.forEach(menuItem => {
    // Lưu các thuộc tính của mục cha
    const uniqueKey = `${menuItem.key}_${menuItem.lang}`;
    menuMap[uniqueKey] = menuItem;

    // Nếu có mảng con 'mega', lặp qua và lưu luôn các mục con đó vào Map
    if (menuItem.mega && Array.isArray(menuItem.mega)) {
      menuItem.mega.forEach(megaItem => {
        const megaUniqueKey = `${megaItem.key}_${megaItem.lang}`;
        menuMap[megaUniqueKey] = megaItem;
      });
    }
  });

  // Bước 2: Duyệt qua pages.json và bổ sung thuộc tính từ menuMap
  const updatedPages = pages.map(page => {
    let newPage = { ...page };
    const uniqueKey = `${newPage.key}_${newPage.lang}`;
    const matchedMenu = menuMap[uniqueKey];

    if (matchedMenu) {
      // Lặp qua các thuộc tính bên menu
      for (const prop in matchedMenu) {
        // Nếu thuộc tính bên pages chưa có, thì thêm từ menu sang
        if (newPage[prop] === undefined) {
          newPage[prop] = matchedMenu[prop];
        }
      }
    }

    return newPage;
  });

  return updatedPages;
}