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