import React, { createContext, useContext, useState } from "react";
import { pageService } from "@/services/pageService";

interface AppContextType {
  commonData: any;
  currentPageData: any;
  isReady: boolean;
  initData: (currentSlug: string) => Promise<void>;
  updatePageDataFromAjax: (pageDetail: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [commonData, setCommonData] = useState<any>(null);
  const [currentPageData, setCurrentPageData] = useState<any>(null);

  // Xử lý nạp dữ liệu lúc F5
  const initData = async (currentSlug: string) => {
    const common = await pageService.getCommonData();
    const pageDetail = await pageService.getPageData(currentSlug);

    if (common) {
      if (pageDetail && common.pages) {
        common.pages = common.pages.map((p: any) => {
          if (p.key === pageDetail.key && p.lang === pageDetail.lang) {
            return { ...p, ...pageDetail };
          }
          return p;
        });
      }
      setCommonData(common);
    }
    if (pageDetail) setCurrentPageData(pageDetail);
  };

  // Hàm cập nhật trạng thái khi click AJAX (Biến toàn cục ai cũng gọi được)
  const updatePageDataFromAjax = (pageDetail: any) => {
    setCurrentPageData(pageDetail);
    setCommonData((prevCommon: any) => {
      if (!prevCommon?.pages) return prevCommon;
      const updatedPages = prevCommon.pages.map((p: any) => {
        if (p.key === pageDetail.key && p.lang === pageDetail.lang) {
          return { ...p, ...pageDetail };
        }
        return p;
      });
      return { ...prevCommon, pages: updatedPages };
    });
  };

  const isReady = !!(commonData && currentPageData);

  return (
    <AppContext.Provider value={{ commonData, currentPageData, isReady, initData, updatePageDataFromAjax }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook để các component con bốc dữ liệu ra xài nhanh
export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppStore must be used within an AppProvider");
  return context;
};