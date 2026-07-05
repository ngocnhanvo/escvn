import { pageService } from "@/services/pageService";
import { globalStore } from "@/services/globalStore";
import { registerPageComponents } from "@/lib/componentsReg/componentRegistry";

export const handlePageLink = async (
  e: React.MouseEvent,
  page: any,
  path: string,
  navigate: any
) => {
  if(e)
    e.preventDefault();
  
  if (path.startsWith('/#')) return;
  if (path.startsWith('/http://') || path.startsWith('/https://')) {
    window.open(path.substring(1), '_blank');
    return;
  }

  if (window.location.pathname !== path) {
    window.dispatchEvent(new Event('app:nav-start'));
  }

  // 1. Tải dữ liệu JSON mới nhất từ Backend về
  const pageData = await pageService.getPageData(path);
  if (pageData) {
    await registerPageComponents(pageData);
    // 2. Ghi đè thẳng vào biến toàn cục - Ăn ngay lập tức trong RAM
    globalStore.setCurrentPageData(pageData);
  }

  // 3. Chuyển hướng trang. Lúc này các component ở trang mới render ra 
  // sẽ tự động vào globalStore lấy data mới nhất để vẽ giao diện.
  setTimeout(() => {
    navigate(path);
  }, 50);
};