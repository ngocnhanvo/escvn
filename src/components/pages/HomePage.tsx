// WI-HPI
import { AppRouterProps } from '@/entities';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { returnCurrentPage, useLanguage } from '@/lib/LanguageContext';
import { extractHTML } from '@/lib/components';
// --- Main Page Component ---
export default function HomePage(props: AppRouterProps) {
  
  const { language } = useLanguage();
  const page = returnCurrentPage(props, language);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />
      <main id="main-content">
        {extractHTML(page, props)}

        {/* BLOCK 10 (CONTACTS) */}
        <FooterSection {...props} />
      </main>
      <Footer {...props} />
    </div>
  );
}