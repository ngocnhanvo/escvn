import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useParams, useLocation, useNavigate, ScrollRestoration } from 'react-router-dom';
import ErrorPage500 from '@/integrations/errorHandlers/ErrorPage500';
import ErrorPage404 from '@/integrations/errorHandlers/ErrorPage404';
import { Loader2 } from 'lucide-react';
import { AppRouterProps } from '@/entities';
import { LanguageProvider } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
// Lazy load các trang để giảm kích thước bundle ban đầu
const modulePages = {
  HomePage: lazy(() => import('@/components/pages/HomePage')),
  AboutPage: lazy(() => import('@/components/pages/AboutPage')),
  ContactPage: lazy(() => import('@/components/pages/ContactPage')),
  DomainPage: lazy(() => import('@/components/pages/DomainPage')),
  HostingPage: lazy(() => import('@/components/pages/HostingPage')),
  EmailPage: lazy(() => import('@/components/pages/EmailPage')),
  ServerPage: lazy(() => import('@/components/pages/ServerPage')),
  SSLPage: lazy(() => import('@/components/pages/SSLPage')),
  ComboPage: lazy(() => import('@/components/pages/ComboPage')),
  WebsitePage: lazy(() => import('@/components/pages/WebsitePage')),
  ServicesPage: lazy(() => import('@/components/pages/ServicesPage')),
  PartnersPage: lazy(() => import('@/components/pages/PartnersPage')),
  SupportPage: lazy(() => import('@/components/pages/SupportPage')),
  PromotionPage: lazy(() => import('@/components/pages/PromotionPage')),
  MemberPage: lazy(() => import('@/components/pages/MemberPage')),
  PublicPage: lazy(() => import('@/components/pages/PublicPage'))
};

// Hiệu ứng loading trang chuyên nghiệp hơn
const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
    <div className="relative">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <div className="absolute inset-0 blur-xl bg-primary/30 animate-pulse rounded-full" />
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.3em] text-primary/70 uppercase animate-pulse">
        Synchronizing Data...
      </span>
      <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  </div>
);

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
  if(!lang) {
    const pathParts = window.location.pathname.split(props.basename);
    lang = pathParts[1];
    if(lang.startsWith('/')) lang = lang.substring(1);
    console.log(`lang`, lang, `props.pages?`, props.pages?.map((page: any) => page.slug));
    lang = props.pages?.filter((a: any) => {
      return (a.slug ?? '') === (lang ?? '');
    })[0]?.lang;
  }
  if (!lang) {
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
  props.pages.map(page => {
    //if(!page.slug) return;
    let item = { 
      index: false,
      path: page.slug, 
      element: (() => {
      const PageComponent = modulePages[page.action];
      return (
        <LanguageGuard {...props}>
          <PageComponent {...props} />
        </LanguageGuard>
      );
    })() };
    children.push(item);
  });

  if(props.status == 404) {
    children.push({
      index: false,
      path: "*",
      element: <ErrorPage404 {...props} />
    });
  }
  else if(props.status == 500) {
    children.push({
      index: false,
      path: "*",
      element: <ErrorPage500 {...props} />
    });
  }

  return ([
    { // Route configuration
      path: "/", 
      element: <LayoutWithLanguage {...props} />, // Use the new layout component
      errorElement: <ErrorPage500 {...props} />,
      children: children
    },
  ])
};

export default function AppRouter(props: AppRouterProps) {
  const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null);

  useEffect(() => {
    // Ưu tiên basename từ props (cho bản nháp), nếu không có mới dùng env
    const routerInstance = createBrowserRouter(getRouterConfig(props), {
      basename: props.basename || import.meta.env.BASE_NAME || '/',
    });
    setRouter(routerInstance);
  }, [props]); // `props` ở đây là dữ liệu tĩnh từ Astro, nên `useEffect` chỉ chạy 1 lần

  if (!router) {
    return <PageLoader/>;
  }

  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
