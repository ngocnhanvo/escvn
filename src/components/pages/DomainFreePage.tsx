import { useRef, useMemo, useState, useEffect } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [tld, setTLD] = useState<string>(''); 

  const content = useMemo(() => {
    return extractHTML(page, props, {tld, setTLD});
  }, [tld, language]);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative bg-accent-yellow/10 py-20 overflow-hidden flex flex-col lg:flex-row items-center shadow-accent-yellow/20">
          <div className="absolute hidden md:block top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/40 rounded-full blur-[70px] animate-blob animation-delay-2000" />
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-400/35 rounded-full blur-[60px] animate-blob animation-delay-4000" />

          <div className="max-w-[100rem] mx-auto px-8 md:px-16 lg:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4"
            >
              <h1 className="text-5xl md:text-6xl text-primary font-bold">
                {page.label}
              </h1>
              <p className="font-paragraph text-xl text-foreground max-w-3xl mx-auto">
                {page.description}
              </p>
            </motion.div>
          </div>
        </section>

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
