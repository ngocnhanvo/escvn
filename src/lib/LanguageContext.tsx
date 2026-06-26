import React, { createContext, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Language } from './i18n';
import { AppRouterProps } from '@/entities';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Định nghĩa danh sách ngôn ngữ phổ biến
const languageMap: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  ja: '日本語', // Sửa jp/ja thành Tiếng Nhật bản địa
  jp: '日本語', // Dự phòng nếu bạn vẫn truyền vào 'jp'
  ko: '한국어',  // Tiếng Hàn
  zh: '简体中文', // Tiếng Trung giản thể
  tw: '繁體中文', // Tiếng Trung phồn thể
  fr: 'Français', // Tiếng Pháp
  de: 'Deutsch',  // Tiếng Đức
  es: 'Español',  // Tiếng Tây Ban Nha
  it: 'Italiano', // Tiếng Ý
  ru: 'Русский',  // Tiếng Nga
  th: 'ไทย',      // Tiếng Thái
  id: 'Bahasa Indonesia', // Tiếng Indo
};

export const getNameLang = (code: string): string => {
  const lowerCode = code.toLowerCase();
  return languageMap[lowerCode] || '';
};

export const returnLang = (pages: any, pathname: string, basename?: string) => {
  // Lấy slug từ URL hiện tại (ví dụ: /en/home -> en/home)
  const currentSlug = pathname.split('/').filter(Boolean).join('/');
  const exactPage = pages.find(p => p.slug === currentSlug);
  if (exactPage) {
    return exactPage.lang;
  }

  const pathSegments = currentSlug.split('/');
  if (pathSegments.length > 1) {
    const parentSlug = pathSegments[0]; // Lấy segment đầu tiên
    const parentPage = pages.find(p => p.slug === parentSlug);
    if (parentPage) {
      return parentPage.lang;
    }
  }

  if (pathSegments[0] === 'en') {
    return 'en';
  }

  return 'vi';
};

export const returnCurrentPath = (baseName?: string) => {
  let currentPath = location.pathname.startsWith(baseName) ? location.pathname.substring(baseName.length) : location.pathname;
  currentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
  currentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
  return currentPath;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, ...props }: { children: React.ReactNode } & AppRouterProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const language: Language = (() => {
    return returnLang(props.pages, location.pathname);
  })();

  const setLanguage = (newLang: Language) => {
    let currentPath = returnCurrentPath(props.basename);
    // 1. Tìm mapping trang hiện tại để chuyển đổi slug chính xác dựa trên 'key' (nếu có)
    const currentPage = props.pages.find(p => p.slug === currentPath);
    if (currentPage) {
      // Tìm trang có cùng key nhưng thuộc ngôn ngữ đích
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
        navigate(`/${targetPage.slug}${location.search}${location.hash}`);
        return;
      }
    }

    // 2. Fallback: Nếu không tìm thấy mapping trong pages, thực hiện thay thế segment đầu tiên
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'vi' || pathSegments[0] === 'en') {
      pathSegments[0] = newLang;
    } else {
      pathSegments.unshift(newLang);
    }

    const newPath = `/${pathSegments.join('/')}${location.search}${location.hash}`;
    navigate(newPath);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
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
