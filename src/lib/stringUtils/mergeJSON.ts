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