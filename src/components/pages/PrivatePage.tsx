import { useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext/index';
import { returnCurrentPage, returnCurrentPageAsync } from '@/context/LanguageContext/returnCurrentPage';
import { extractHTML } from '@/lib/componentsReg/extractHTML';
import { globalStore } from '@/services/globalStore';
let page = await returnCurrentPageAsync();
export default function PublicPage(props: AppRouterProps) {
  props = globalStore.getCommonData();
  const navigate = useNavigate();
  const { language } = useLanguage();
  page = returnCurrentPage(props, language);
  console.log(`page`, page);
  const contentRef = useRef<HTMLDivElement>(null);
  const content = useMemo(() => {
    return extractHTML(page, props);
  }, [page]);
  console.log(`content`, content);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />

      <main id="main-content">

        {/* Content Section */}
        <section className="max-w-[1300px] mx-auto px-margin-desktop">
          <div className="space-y-12 article-content" ref={contentRef}>
            {content}
          </div>
        </section>

        <FooterSection {...props} />
      </main>
      <Footer {...props} />
    </div>
  );
}
