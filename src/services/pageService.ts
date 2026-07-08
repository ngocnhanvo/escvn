import { globalStore } from "./globalStore";

export const pageService = {
  // Lấy bùa chống cache
  getCacheBuster() {
    const buildTime = import.meta.env.VITE_BUILD_TIME || '';
    return buildTime ? `?v=${buildTime}` : '';
  },

  // 1. GIỮ NGUYÊN: Fetch cấu hình chung lúc F5 / vào trang lần đầu
  async getCommonData(): Promise<any> {
    try {
      const res = await fetch(`/data/cms-common.json${this.getCacheBuster()}`);
      if (!res.ok) throw new Error("Không thể tải cấu hình chung");
      
      const data = await res.json();
      
      // Đẩy vào store để lưu trữ làm gốc
      globalStore.setCommonData(data);
      
      return data;
    } catch (error) {
      console.error("Lỗi getCommonData:", error);
      return null;
    }
  },

  // 3. Fetch trang chi tiết (Đã tích hợp check cache từ globalStore)
  async getPageData(identifier: string): Promise<any> {
    try {
      let slug = identifier;
      if(!slug)
        slug = '/';
      console.log(`slug`, slug);
      if (slug.includes("/")) {
        const cleanPath = slug.split('?')[0].split('#')[0];
        slug = cleanPath === "/" ? "default" : cleanPath.replace(/^\/|\/$/g, "");
      }

      // --- BƯỚC 1: CHECK CACHE TỪ STORE ---
      const cachedPage = globalStore.getCachedPage(slug);
      if (cachedPage) {
        console.log(`[⚡ Store Cache Hit] Lấy data từ store cho: ${slug}`);
        globalStore.currentPageData = cachedPage; 
        return cachedPage;
      }

      // --- BƯỚC 2: FETCH NẾU CHƯA CÓ TRONG CACHE ---
      console.log(`[🌐 Cache Miss] Fetch data mới từ server cho: ${slug}`);
      const res = await fetch(`/data/page-${slug}.json${this.getCacheBuster()}`);
      if (!res.ok) throw new Error(`Không thể tải trang: ${slug}`);
      
      const data = await res.json();

      // --- BƯỚC 3: ĐẨY VÀO STORE (Tự động merge vào commonData.pages)
      globalStore.setCurrentPageData(data); 

      return data;
    } catch (error) {
      console.error("Lỗi getPageData:", error);
      return null;
    }
  }
};