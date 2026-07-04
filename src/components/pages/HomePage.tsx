//HomePage.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { useLanguage } from '@/lib/LanguageContext';
import { extractHTML } from '@/lib/components';
import { useMemo } from 'react';
import { returnCurrentPage } from '@/lib/LanguageContext/returnCurrentPage';
// --- Main Page Component ---
export default function HomePage(props: AppRouterProps) {
  
  const { language } = useLanguage();
  const page = returnCurrentPage(props, language);

  const content = useMemo(() => {
    return extractHTML(page, props);
  }, [page]);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />
      <main id="main-content">
        {content}
        {/* BLOCK 10 (CONTACTS) */}
        <FooterSection {...props} />
      </main>
      <Footer {...props} />
    </div>
  );
}