// WI-HPI
import { AppRouterProps } from '@/entities';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { returnCurrentPage, useLanguage } from '@/lib/LanguageContext';
import { ComponentMap } from '@/lib/components';
// --- Main Page Component ---
export default function HomePage(props: AppRouterProps) {
  
  const { language } = useLanguage();
  const page = returnCurrentPage(props, language);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />
      <main id="main-content">
        {page.contents.map((block, index) => {
          if (block.type === 'html') {
            return <div dangerouslySetInnerHTML={{ __html: block.content }} />;
          }
          
          // Render Dynamic Component dựa trên shortcode
          if (block.type === 'shortcode') {
            const Component = ComponentMap[block.shortcode!]; // Định nghĩa một Map: { home_01: Home_01, ... }
            return Component ? <Component page={page} data={block.data} props={props} /> : null;
          }
          return null;
        })}

        {/* BLOCK 10 (CONTACTS) */}
        <FooterSection {...props} />
      </main>
      <Footer {...props} />
    </div>
  );
}