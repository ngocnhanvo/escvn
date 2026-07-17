import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useParams, useLocation, ScrollRestoration } from 'react-router-dom';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { LanguageProvider } from '@/context/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import { PageLoader } from './PageTransition/PageLoader';
//import PageBootstrap from '@/lib/componentsReg/PageBootstrap';
import ErrorPage500 from '@/integrations/errorHandlers/ErrorPage500';
import ErrorPage404 from '@/integrations/errorHandlers/ErrorPage404';
// Import kho lưu trữ toàn cục và thư viện fetch dữ liệu
import { globalStore } from '@/services/globalStore';
import { pageService } from '@/services/pageService';
import { registerPageComponents } from '@/lib/componentsReg/componentRegistry';

const isClient = typeof window !== 'undefined';

function LayoutWithLanguage(props: AppRouterProps) {
  const location = useLocation();

  useEffect(() => {
    window.dispatchEvent(new Event('app:nav-end'));
  }, [location.pathname]);

  return (
    <>
      <ScrollRestoration />
      <LanguageProvider {...props}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </LanguageProvider>
    </>
  );
}

function LanguageGuard({ children, ...props }: { children: React.ReactNode } & AppRouterProps) {
  let { lang } = useParams<{ lang: string }>();

  // Đọc trực tiếp data mới nhất từ RAM biến toàn cục ra để kiểm tra ngôn ngữ
  const latestCommonData = globalStore.getCommonData();
  const activePages = latestCommonData?.pages || props.pages || [];

  if (!lang && isClient) {
    const pathParts = window.location.pathname.split(props.basename || '/');
    let dynamicLang = pathParts[1];
    if (dynamicLang.startsWith('/')) dynamicLang = dynamicLang.substring(1);

    lang = activePages?.find((a: any) => (a.slug ?? '') === (dynamicLang ?? ''))?.lang;
  }

  if (!lang) {
    return <ErrorPage404 {...props} />;
  }

  return <>{children}</>;
}

const lazyCache = new Map();

function getLazy(importFunc) {
    if (!lazyCache.has(importFunc)) {
        lazyCache.set(importFunc, lazy(importFunc));
    }
    return lazyCache.get(importFunc);
}
const getRouterConfig = (props: AppRouterProps) => {
  let children: any[] = [];
  const pageModules = import.meta.glob('@/components/pages/*.tsx');

  if (props.pages && Array.isArray(props.pages)) {
    props.pages.forEach((page) => {
      const modulePath = `/src/components/pages/${page.action}.tsx`;
      const importFunc = pageModules[modulePath];
      if (!importFunc) return;

      const PageComponent = getLazy(importFunc as () => Promise<any>);

      children.push({
        index: false,
        path: page.slug,
        element: (
          // <PageBootstrap page={page}>
          <LanguageGuard {...props}>
            <PageComponent {...props} />
          </LanguageGuard>
          //</PageBootstrap>
        )
      });
    });
  }

  //if (props.status == 404) {
  children.push({
    index: false, path: "*", element: (
      <ErrorPage404 {...props} />
    )
  });
  //}

  //Đừng đổi path này
  return [{
    id: "root",
    path: '/',
    element: <LayoutWithLanguage {...props} />,
    errorElement: <ErrorPage500 {...props} />,
    children: children
  }];
};

export default function AppRouter(props: AppRouterProps) {
  globalStore.setBaseName(props.basename);
  const [isInitialized, setIsInitialized] = useState(false);
  const [router, setRouter] = useState<any>(null);

  // Khởi tạo dữ liệu gốc duy nhất 1 lần lúc F5
  useEffect(() => {
    async function initSystem() {
      if (!isClient) return;

      // 1. Phân tích slug hiện tại từ URL thanh địa chỉ
      let pathname = window.location.pathname;
      pathname = pathname.substring(0, 1) + pathname.substring(props.basename.length);
      const cleanPath = pathname.split('?')[0].split('#')[0];
      const currentSlug = cleanPath === '/' ? "default" : cleanPath.replace(/^\/|\/$/g, "");

      let data_info, menus, pages;
      if (props.basename == '/preview') {
        data_info = props.data_info;
        menus = props.menus;
        pages = props.pages;
        //const pageDetail = props.pages.find(s => s.slug == cleanPath);
        globalStore.setCommonData({ menus, pages, data_info });
        globalStore.setProductData(props.data_products);
        //globalStore.setCurrentPageData(pageDetail);
      }
      else {
        const [common, pageDetail] = await Promise.all([
          pageService.getCommonData(),
          pageService.getPageData(currentSlug)
        ]);

        // 3. Đập thẳng vào biến toàn cục tĩnh trong RAM
        if (common) globalStore.setCommonData(common);
        if (pageDetail) {
          globalStore.setCurrentPageData(pageDetail);
          await registerPageComponents(pageDetail);
        }
        data_info = common?.data_info || props.data_info;
        menus = common?.menus || props.menus;
        pages = common?.pages || props.pages || [];
      }
      const routerConfig = getRouterConfig({
        ...props,
        data_info,
        menus,
        pages
      });

      if (routerConfig) {
        setRouter(createBrowserRouter(routerConfig, {
          basename: props.basename || import.meta.env.BASE_NAME || '/',
        }));
      }

      setIsInitialized(true);
    }

    initSystem();
  }, []);

  // Thay vì chặn bằng 'return <PageLoader />', ta để React render song song cả 2 và điều khiển bằng CSS
  return (
    <HelmetProvider>
      {/* 1. Màn hình Loader: Tự động fade-out giảm opacity xuống 0 và ẩn đi khi hệ thống đã init xong */}
      <div
        className={`fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out pointer-events-none ${!isInitialized ? 'opacity-100' : 'opacity-0 visibility-hidden'
          }`}
      >
        <PageLoader />
      </div>

      {/* 2. Khung chứa Router: Fade-in hiện lên mượt mà sau khi dữ liệu đã nạp xong vào RAM toàn cục */}
      <div className={`transition-opacity duration-500 ${isInitialized ? 'opacity-100' : 'opacity-0'}`}>
        {router && <RouterProvider router={router} />}
      </div>
    </HelmetProvider>
  );
}