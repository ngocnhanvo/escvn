//HomePage.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { useLanguage } from '@/context/LanguageContext/index';
import { extractHTML } from '@/lib/componentsReg/extractHTML';
import { useMemo } from 'react';
import { returnCurrentPage, returnCurrentPageAsync } from '@/context/LanguageContext/returnCurrentPage';
import { globalStore } from '@/services/globalStore';
// --- Main Page Component ---
let page = await returnCurrentPageAsync();
export default function HomePage(props: AppRouterProps) {
  props = globalStore.getCommonData();
  const { language } = useLanguage();
  page = returnCurrentPage(props, language);

  const content = useMemo(() => {
    return extractHTML(page, props);
  }, [page, language]);
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