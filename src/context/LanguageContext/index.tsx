import React, { createContext, useContext, useMemo, useCallback } from 'react'; // Thêm useMemo, useCallback
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { returnLang } from './returnLang';
import { returnCurrentPath } from './returnCurrentPath';
import { handlePageLink } from '@/components/PageTransition/handlePageLink';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, ...props }: { children: React.ReactNode } & AppRouterProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Bọc việc tính toán ngôn ngữ vào useMemo để tránh chạy lại vô ích
  const language: string = useMemo(() => {
    return returnLang(props.pages, location.pathname);
  }, [props.pages, location.pathname]);

  // 2. Bọc hàm setLanguage vào useCallback để giữ nguyên định danh hàm qua các lượt render
  const setLanguage = useCallback((newLang: string) => {
    let currentPath = returnCurrentPath(props.basename);
    const currentPage = props.pages.find(p => p.slug === currentPath);
    
    const event = new CustomEvent('language-changed', { detail: { lang: newLang } });
    window.dispatchEvent(event);

    if (currentPage) {
      let targetPage: any;
      if (currentPage.id) {
        targetPage = props.pages.find(p => p.key === currentPage.key
          && p.lang === newLang
          && p.id === currentPage.id
        );
      }

      if (!targetPage)
        targetPage = props.pages.find(p => p.key === currentPage.key && p.lang === newLang);

      if (targetPage) {
        handlePageLink(null, targetPage, `/${targetPage.slug}${location.search}${location.hash}`, navigate);
        //navigate();
        return;
      }
    }
  }, [navigate, location.pathname, location.search, location.hash, props.basename, props.pages]);

  // 3. QUAN TRỌNG NHẤT: Memoize object value của Context
  const contextValue = useMemo(() => ({
    language,
    setLanguage
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}