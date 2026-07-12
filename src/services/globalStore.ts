// src/services/globalStore.ts
export const globalStore = {
  commonData: null as any,
  productData: null as any,
  currentPageData: null as any,
  baseName: '/' as string,
  getCacheBuster() {
    const buildTime = import.meta.env.VITE_BUILD_TIME || '';
    return buildTime ? `?v=${buildTime}` : '';
  },
  setBaseName(data: string) {
    this.baseName = data;
  },
  setCommonData(data: any) {
    this.commonData = data;
  },
  setProductData(data: any) {
    this.productData = data;
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

  getBaseName() {
    return this.baseName;
  },
  getCommonData() {
    return this.commonData;
  },
  async getProductData(WC_URL_CLIENT: string = '') {
    if(this.productData)
      return this.productData;

    try {
      const res = await fetch(`${WC_URL_CLIENT}/data/cms-products.json${this.getCacheBuster()}`);
      if (!res.ok) throw new Error("Không thể tải cấu hình sản phẩm");
      
      const data = await res.json();
      
      // Đẩy vào store để lưu trữ làm gốc
      globalStore.setProductData(data);
      return data;
    } catch (error) {
      console.error("Lỗi getProductData:", error);
      return null;
    }
  },
  getCurrentPageData() {
    return this.currentPageData;
  }
};