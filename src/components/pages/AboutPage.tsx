import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import { AppRouterProps } from '@/entities';
import { useLanguage } from '@/lib/LanguageContext';
import NotFoundPage from '../../../integrations/errorHandlers/ErrorPage404';
import { motion, AnimatePresence } from 'framer-motion';

export default function AboutPage(props: AppRouterProps) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const page = props.pages.find((a: any) => a.key === 'about' && a.lang === language);

  // Lightbox State
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<{ src: string; alt: string }[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    if (contentRef.current && page?.content) {
      // Tìm tất cả ảnh có class openBox trong nội dung động
      const imgElements = contentRef.current.querySelectorAll('img.openBox');
      const imgs = Array.from(imgElements).map((img: any) => ({
        src: img.src,
        alt: img.alt || ''
      }));
      setImages(imgs);

      imgElements.forEach((img: any, index: number) => {
        img.style.cursor = 'zoom-in';
        img.onclick = (e: MouseEvent) => {
          e.preventDefault();
          setCurrentIndex(index);
          setIsOpen(true);
        };
      });
    }
  }, [page?.content, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') setIsOpen(false);
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length]);

  if(page == null)
    return <NotFoundPage {...props}/>;

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props}/>

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
      <section className="bg-white border-b border-border-subtle">
        <div className="space-y-12 article-content" ref={contentRef}>
          <div className="prose max-w-none text-foreground/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </section>

      <FooterSection {...props} />
      </main>

      <AnimatePresence>
        {isOpen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[1010]"
              onClick={() => setIsOpen(false)}
            >
              <X size={32} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-[1010]"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-[1010]"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <motion.img
              key={currentIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="max-w-full max-h-[90vh] object-contain select-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
