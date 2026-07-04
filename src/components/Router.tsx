import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useParams, useLocation, ScrollRestoration } from 'react-router-dom';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { LanguageProvider } from '@/lib/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import { PageLoader } from './PageTransition/PageLoader';



// Layout component that includes ScrollToTop
function LayoutWithLanguage(props: AppRouterProps) {
  const location = useLocation();
  useEffect(() => {
    window.dispatchEvent(new Event('app:nav-end'));
  }, [location.pathname]);

  return (
    <>
      <ScrollRestoration />
      {/* Đưa Provider vào đây để nó có thể sử dụng hook của Router */}
      <LanguageProvider {...props}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </LanguageProvider>
    </>
  );
}

function LanguageGuard({ children, ...props }: { children: React.ReactNode } & AppRouterProps) {
  let { lang } = useParams<{ lang: string }>();
  if (!lang) {
    const pathParts = window.location.pathname.split(props.basename);
    lang = pathParts[1];
    if (lang.startsWith('/')) lang = lang.substring(1);
    lang = props.pages?.filter((a: any) => {
      return (a.slug ?? '') === (lang ?? '');
    })[0]?.lang;
  }
  if (!lang) {
    const ErrorPage404 = lazy(() => import('@/integrations/errorHandlers/ErrorPage404'));
    return <ErrorPage404 {...props} />;
  }
  // Nếu hợp lệ, cho phép hiển thị Component con (ở đây là HomePage)
  return <>{children}</>;
}

const getRouterConfig = (props: AppRouterProps) => {
  let children = [
    // {
    //   index: true,
    //   path: undefined,
    //   element: <Navigate to="/trang-chu" replace />, // Redirect root to default language
    // }
  ];

  const pageModules = import.meta.glob('@/components/pages/*.tsx');
  props.pages.forEach((page) => {
    const modulePath = `/src/components/pages/${page.action}.tsx`; // Sửa lại path tuyệt đối theo dự án của bạn
    const importFunc = pageModules[modulePath];
    if (!importFunc) {
      console.error(`Không tìm thấy file component cho action: ${page.action}`);
      return;
    }
    const PageComponent = lazy(importFunc as () => Promise<any>);
    //if(!page.slug) return;
    
    let item = {
      index: false,
      path: page.slug,
      element: (
        <LanguageGuard {...props}>
          <PageComponent {...props} />
        </LanguageGuard>
      )
    };
    children.push(item);
  });

  if (props.status == 404) {
    const ErrorPage404 = lazy(() => import('@/integrations/errorHandlers/ErrorPage404'));
    children.push({
      index: false,
      path: "*",
      element: <ErrorPage404 {...props} />
    });
  }
  else if (props.status == 500) {
    const ErrorPage500 = lazy(() => import('@/integrations/errorHandlers/ErrorPage500'));
    children.push({
      index: false,
      path: "*",
      element: <ErrorPage500 {...props} />
    });
  }

  return ([
    { // Route configuration
      path: "/",
      key: 'esc',
      element: <LayoutWithLanguage {...props} />,
      children: children
    },
  ])
};

export default function AppRouter(props: AppRouterProps) {
  // const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

  // useEffect(() => {
  //   // Ưu tiên basename từ props (cho bản nháp), nếu không có mới dùng env
  //   const routerInstance = createBrowserRouter(getRouterConfig(props), {
  //     basename: props.basename || import.meta.env.BASE_NAME || '/',
  //   });
  //   setRouter(routerInstance);
  // }, [props]); // `props` ở đây là dữ liệu tĩnh từ Astro, nên `useEffect` chỉ chạy 1 lần

  // State theo dõi xem component đã thực sự mount thành công ở Client chưa
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Chỉ chạy duy nhất 1 lần sau khi đặt chân lên trình duyệt
  }, []);

  const routerConfig = useMemo(() => {
    return getRouterConfig(props);
  }, [props.pages?.length, props.status]);

  const router = useMemo(() => {
    // Nếu ở Server HOẶC chưa mount xong ở Client, không tạo router
    if (import.meta.env.SSR || !isMounted) {
      return null;
    }

    return createBrowserRouter(routerConfig, {
      basename: props.basename || import.meta.env.BASE_NAME || '/',
    });
  }, [isMounted, props.basename]);

  // Server và Client (First Render) đều sẽ đi qua nhánh này -> Trả về HTML khớp nhau y hệt
  if (!router) {
    return <PageLoader />;
  }

  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
