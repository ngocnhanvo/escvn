// WI-HPI
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Variants, motion } from 'framer-motion';
import { AppRouterProps } from '@/entities';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Cloud,
  LayoutGrid,
  Server,
  Lock,
  Settings,
  Code,
  Mail,
  AtSign,
  Database,
  CheckCircle,
  ShieldCheck,
  Heart,
  Cpu,
  Headset,
  Palette,
  MousePointerClick,
  Puzzle,
  Award,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { getTranslation, getContent } from '@/lib/i18n';
import promotion_json from '@/data/promotion.json';
import domainFeature_json from '@/data/domain-feature.json';
import { useLanguage } from '@/lib/LanguageContext';

// --- Main Page Component ---
export default function HomePage(props: AppRouterProps) {

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Lấy dữ liệu khuyến mại dựa trên ngôn ngữ hiện tại
  const promoData = (promotion_json.promotionSection as any)[language] || promotion_json.promotionSection.vi;

  // Ánh xạ chuỗi icon từ JSON sang các component Lucide
  const IconMap: Record<string, React.ElementType> = {
    Cloud,
    LayoutGrid,
    Server,
    Lock,
    Settings,
    Code,
    Mail,
    AtSign,
    Database,
  };

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />

      <main id="main-content">
        {/* BLOCK 3 (HERO) */}
        <section
          ref={heroRef}
          className="relative py-20"
          style={{
            backgroundColor: "#f7f9fb", // Base background color
            position: "relative",
            overflow: "hidden",
            // Interactive radial gradient for spotlight effect
            backgroundImage: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.6) 0%, transparent 100%)`,
            backgroundBlendMode: 'soft-light', // Makes the mirror effect more pronounced
          }}
        >
          {/* Animated Background Blobs */}
          <div className="absolute hidden md:block top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/40 rounded-full blur-[70px] animate-blob animation-delay-2000" />
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-400/35 rounded-full blur-[60px] animate-blob animation-delay-4000" />

          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(rgb(0, 55, 122) 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 z-10">
              <h1 className="font-headline-xl text-[48px] leading-[56px] text-primary uppercase font-extrabold tracking-tight">
                {getTranslation('home.hero.title_1', language)} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{getTranslation('home.hero.title_2', language)}</span>
              </h1>
              <p className="text-lg italic text-on-surface-variant font-medium">
                {getTranslation('home.hero.subtitle', language)}
              </p>
              {/* Domain Search */}
              <div // Add focus-within for visual feedback
                className="p-2 rounded-2xl flex shadow-lg max-w-[600px] border border-border-subtle"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(12px)"
                }}
              >
                <input
                  className="flex-grow px-4 py-3 text-on-surface bg-transparent border-none focus:ring-0 text-base outline-none"
                  placeholder={getTranslation('home.hero.search_placeholder', language)} // Add focus-within for visual feedback
                  type="text"
                />
                <button
                  className="bg-primary text-white px-4 md:px-6 py-3 font-bold rounded-2xl hover:bg-blue-900 transition-all flex items-center gap-2 shadow-md z-10 active:scale-95"
                >
                  {getTranslation('home.hero.search_btn', language)}
                  <Search size={20} />
                </button>
              </div>
              {/* Pricing Marquee */}
              <div className="flex flex-wrap gap-3 mt-6">
                {(domainFeature_json as any[]).map((domain, index) => (
                  <div
                    key={index}
                    className={`bg-white px-4 py-4 border border-border-subtle text-center transition-all rounded-2xl`}
                  >
                    <span className="text-primary font-bold text-lg">{domain.name}</span>
                    <span className="text-signal-red font-bold text-lg ml-2">{domain.price[language]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-end z-10 relative mr-[10%]"
            >
              {/* Flying lights around mascot */}
              <div className="absolute top-[25%] left-[35%] w-3 h-3 bg-yellow-400 rounded-full blur-[1px] shadow-[0_0_5px_#facc15] animate-float-sparkle" style={{ animationDuration: '4s' }} />
              <div className="absolute top-[45%] right-[5%] w-2 h-2 bg-blue-400 rounded-full blur-[1px] shadow-[0_0_5px_#60a5fa] animate-float-sparkle" style={{ animationDuration: '6s', animationDelay: '1s' }} />
              <div className="absolute bottom-[35%] left-[37%] w-4 h-4 bg-indigo-400 rounded-full blur-[1px] shadow-[0_0_5px_#818cf8] animate-float-sparkle" style={{ animationDuration: '8s', animationDelay: '2s' }} />
              <div className="absolute top-[0%] right-[40%] w-2 h-2 bg-red-400 rounded-full blur-[1px] shadow-[0_0_5px_#ef4444] animate-float-sparkle" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
              <picture className="max-w-[400px] h-auto object-contain animate-float relative z-10">
                <source 
                  srcSet={props.data_info?.mascot[language].srcSet} type="image/webp" 
                  sizes="251px"
                />
                <img
                  width={251}
                  height={300}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  alt={props.data_info?.mascot[language].alt}
                  src={props.data_info?.mascot[language].src}
                />
              </picture>
            </div>
          </div>
        </section>

        {/* BLOCK 4 (PROMOTION) */}
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="font-headline-lg text-[32px] text-primary uppercase font-bold">
              {promoData.title}
            </h2>
            <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {promoData.services.map((service: any) => {
              const IconComponent = IconMap[service.icon] || Cloud;
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  className="bg-white p-6 rounded-xl border border-border-subtle text-center hover:shadow-lg transition-shadow group flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-4 flex-grow">
                    {service.description}
                  </p>
                  <div className="mt-auto">
                    <div className="text-sm text-on-surface-variant">
                      {language === 'vi' ? 'Chỉ từ' : 'Starting from'}
                    </div>
                    <div className="text-signal-red font-black text-2xl mb-4">
                      {service.startingPrice}
                      <span className="text-sm font-normal text-on-surface-variant">
                        {service.period}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* BLOCK 5 (.VN) */}
        <section className="bg-surface-container-low py-16">
          <div className="max-w-container-max mx-auto px-margin-desktop grid-cols-1 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <motion.div variants={fadeInUp} className="space-y-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {getTranslation('home.vn.badge_1', language)}
                  </span>
                  <span className="bg-red-100 text-signal-red px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {getTranslation('home.vn.badge_2', language)}
                  </span>
                </div>
                <h2 className="font-headline-lg text-[32px] text-primary font-bold">
                  {getTranslation('home.vn.title', language)}
                </h2>
                <p className="text-body-lg text-on-surface-variant">
                  {getTranslation('home.vn.desc', language)}
                </p>
                <ul className="space-y-4 my-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-primary w-5 h-5" />
                    <span className="font-semibold text-on-surface">
                      {getTranslation('home.vn.feat_1', language)}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-primary w-5 h-5" />
                    <span className="font-semibold text-on-surface">
                      {getTranslation('home.vn.feat_2', language)}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-primary w-5 h-5" />
                    <span className="font-semibold text-on-surface">
                      {getTranslation('home.vn.feat_3', language)}
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="text-primary w-5 h-5" />
                    <span className="font-semibold text-on-surface">
                      {getTranslation('home.vn.feat_4', language)}
                    </span>
                  </li>
                </ul>
                <button className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors shadow-md">
                  {getTranslation('home.vn.btn', language)}
                </button>
              </motion.div>
              <div className="flex flex-col gap-8">
                <div className="w-full overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src={"/home-first/banner/ten-mien-quoc-gia-vietnam.jpeg"}
                    alt="Tên miền quốc gia việt nam"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        {/* BLOCK 6 (ZIG-ZAG) */}
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop space-y-24">
          {/* Row 1 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                alt="eCloud Hosting"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
                src={"/home-first/banner/hosting-chat-luong-cao.jpeg"}
              />
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                <Cloud className="w-8 h-8" />
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-primary">
                {getTranslation('home.zigzag.row1.title', language)}
              </h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                {getTranslation('home.zigzag.row1.desc', language)}
              </p>
              <div className="text-3xl font-black text-signal-red">
                60k
                <span className="text-base font-normal text-on-surface-variant">
                  {getTranslation('home.zigzag.per_month', language)}
                </span>
              </div>
              <button className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit mt-4">
                {getTranslation('home.zigzag.btn', language)}
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
          {/* Row 2 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse"
          >
            <div className="space-y-6 lg:order-1">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-primary">
                {getTranslation('home.zigzag.row2.title', language)}
              </h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                {getTranslation('home.zigzag.row2.desc', language)}
              </p>
              <div className="text-3xl font-black text-signal-red">
                50k
                <span className="text-base font-normal text-on-surface-variant">
                  {getTranslation('home.zigzag.per_month', language)}
                </span>
              </div>
              <button className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit mt-4">
                {getTranslation('home.zigzag.btn', language)}
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="lg:order-2">
              <img
                alt="Email"
                className="w-full h-auto rounded-2xl shadow-lg object-cover bg-gray-100"
                src={"/home-first/banner/email-bao-mat.jpeg"}
              />
            </div>
          </motion.div>
          {/* Row 3 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <img
                alt="VPS"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
                src={"/home-first/banner/vps-ket-noi-toan-cau.jpeg"}
              />
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                <Server className="w-8 h-8" />
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-primary">
                {getTranslation('home.zigzag.row3.title', language)}
              </h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                {getTranslation('home.zigzag.row3.desc', language)}
              </p>
              <div className="text-3xl font-black text-signal-red">
                180k
                <span className="text-base font-normal text-on-surface-variant">
                  {getTranslation('home.zigzag.per_month', language)}
                </span>
              </div>
              <button className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit mt-4">
                {getTranslation('home.zigzag.btn', language)}
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
          {/* Row 4 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6 lg:order-1">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-headline-lg text-3xl font-bold text-primary">
                SSL Security
              </h3>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Chứng chỉ bảo mật SSL/TLS mã hóa dữ liệu an toàn tối đa. Tăng cường độ
                tin cậy và cải thiện thứ hạng SEO cho website.
              </p>
              <div className="text-3xl font-black text-signal-red">
                219k
                <span className="text-base font-normal text-on-surface-variant">
                  /năm
                </span>
              </div>
              <button className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit mt-4">
                Xem chi tiết
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="lg:order-2">
              <img
                alt="SSL"
                className="w-full h-auto rounded-2xl shadow-lg object-cover bg-gray-100"
                src={"/home-first/banner/ssl-bao-ve-website.jpeg"}
              />
            </div>
          </motion.div>
        </section>
        {/* BLOCK 7 (TRUST) */}
        <section className="bg-surface-container-low py-section-gap">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="font-headline-lg text-3xl text-primary uppercase font-bold">
                {getTranslation('home.trust.title', language)}
              </h2>
              <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-2 md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item1.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item1.desc', language)}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <Award className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item2.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item2.desc', language)}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <LayoutGrid className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item3.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item3.desc', language)}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <Heart className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item4.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item4.desc', language)}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <Cpu className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item5.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item5.desc', language)}
                </p>
              </motion.div>
              <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                <Headset className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-bold text-lg">{getTranslation('home.trust.item6.title', language)}</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  {getTranslation('home.trust.item6.desc', language)}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* BLOCK 8 (WEB DESIGN) */}
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            <motion.div className="lg:col-span-5">
              <img
                alt="Web Design Graphic"
                className="w-full h-auto rounded-3xl shadow-2xl"
                src={"/home-first/banner/website-chuyen-nghiep.png"}
              />
            </motion.div>
            <motion.div className="lg:col-span-7 space-y-8">
              <motion.div>
                <h2 className="font-headline-lg text-4xl text-primary font-bold mb-4">
                  {getTranslation('home.web.title', language)}
                </h2>
                <p className="text-lg text-on-surface-variant">
                  {getTranslation('home.web.subtitle', language)}
                </p>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-8"
              >
                <motion.div variants={fadeInUp} className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <Palette size={24} />
                  </div>
                  <h3 className="font-bold text-xl">{getTranslation('home.web.feat1.title', language)}</h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat1.item1', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat1.item2', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat1.item3', language)}
                    </li>
                  </ul>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <Search size={24} />
                  </div>
                  <h3 className="font-bold text-xl">{getTranslation('home.web.feat2.title', language)}</h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat2.item1', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat2.item2', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat2.item3', language)}
                    </li>
                  </ul>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <MousePointerClick size={24} />
                  </div>
                  <h3 className="font-bold text-xl">{getTranslation('home.web.feat3.title', language)}</h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat3.item1', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat3.item2', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat3.item3', language)}
                    </li>
                  </ul>
                </motion.div>
                <motion.div className="space-y-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                    <Puzzle size={24} />
                  </div>
                  <h3 className="font-bold text-xl">{getTranslation('home.web.feat4.title', language)}</h3>
                  <ul className="space-y-2 text-sm text-on-surface-variant">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat4.item1', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat4.item2', language)}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {getTranslation('home.web.feat4.item3', language)}
                    </li>
                  </ul>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
        {/* BLOCK 9 (PARTNERS) */}
        <section className="bg-surface-container-low py-12 border-y border-border-subtle">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="max-w-container-max mx-auto px-margin-desktop"
          >
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-[32px] text-primary uppercase font-bold">
                {getTranslation('home.partners.title', language)}
              </h2>
              <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
            </div>
            <div className="flex items-center justify-between gap-8">
              <button
                className="opacity-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border-subtle text-on-surface-variant hover:text-primary"
                aria-label={language === 'vi' ? 'Đối tác trước' : 'Previous partners'}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex flex-wrap justify-center gap-12">
                <img
                  alt="Viettel"
                  src="/home-first/partners/viettel.png"
                  className="h-20 w-auto object-contain"
                />
                <img
                  alt="Ánh sáng cuộc sống"
                  src="/home-first/partners/ascs.png"
                  className="h-20 w-auto object-contain"
                />
                <img
                  alt="Microsoft"
                  src="/home-first/partners/microsoft.png"
                  className="h-20 w-auto object-contain"
                />
                <img
                  alt="VNNIC"
                  src="/home-first/partners/vnnic.png"
                  className="h-20 w-auto object-contain"
                />
              </div>
              <button
                className="opacity-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border-subtle text-on-surface-variant hover:text-primary"
                aria-label={language === 'vi' ? 'Đối tác tiếp theo' : 'Next partners'}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        </section>
        {/* BLOCK 10 (CONTACTS) */}
        <FooterSection {...props} />
      </main>
      <Footer {...props} />
    </div>
  );
}