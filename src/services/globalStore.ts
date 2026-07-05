// src/services/globalStore.ts
export const globalStore = {
  commonData: null as any,
  currentPageData: null as any,

  setCommonData(data: any) {
    this.commonData = data;
  },

  setCurrentPageData(data: any) {
    this.currentPageData = data;
    
    // Đồng bộ ngược vào mảng pages
    if (this.commonData?.pages && data) {
      this.commonData.pages = this.commonData.pages.map((p: any) =>
        // Dùng slug hoặc key/lang tùy thuộc vào cấu trúc của bạn để map
        (p.slug === data.slug) 
          ? { ...p, ...data, isLoaded: true } // Đánh dấu là đã fetch full data
          : p
      );
    }
  },

  // HÀM MỚI: Kiểm tra xem trang này đã được fetch full data và lưu trong commonData chưa
  getCachedPage(slug: string) {
    if (!this.commonData?.pages) return null;
    
    // Tìm trang trong mảng pages dựa vào slug
    const page = this.commonData.pages.find((p: any) => p.slug === slug);
    
    // Nếu tìm thấy và trang đó đã có dấu hiệu của full data (ví dụ có flag isLoaded hoặc có content)
    if (page && page.isLoaded) {
      return page;
    }
    return null;
  },

  getCommonData() {
    return this.commonData;
  },

  getCurrentPageData() {
    return this.currentPageData;
  }
};