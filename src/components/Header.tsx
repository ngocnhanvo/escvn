import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Award,
  Flag,
  Globe,
  MapPin
} from 'lucide-react';
import { useCart } from '@/integrations';
import { AppRouterProps, Pages } from '@/entities';
import { handlePageLink } from '@/components/PageTransition';
import { getTranslation, getContent } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from './ui/button';

export default function Header(props: AppRouterProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [activeMobileMegaMenu, setActiveMobileMegaMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { itemCount, actions } = useCart(language);
  const data_info = props.data_info;
  let navItems = props.menus.filter((a: Pages) => {
    if (!a.slug) return false;
    return a.lang === language && (a.header ?? true) == true;
  });

  const link_home = '/' + props.pages.find((a: Pages) => a.key === 'home' && a.lang === language && a.slug != undefined).slug;
  const link_about = '/' + props.pages.find((a: Pages) => a.key === 'about' && a.lang === language && a.slug != undefined).slug;
  const link_member = 'https://member.esc.vn';

  const isActive = (page: Pages) => {
    let str: string = location.pathname.startsWith("/") ? location.pathname.substring(1) : location.pathname;
    str = str.endsWith("/") ? str.slice(0, -1) : str;
    let active = page.slug === str;
    if (!active) {
      const pageDT = props.pages.find((a: Pages) => a.slugP === page.slug && a.slug == str);
      active = pageDT != null;
    }

    if (!active) {
      if (page.mega) {
        const pageDT = page.mega.find((a: Pages) => a.slug == str);
        active = pageDT != null;
      }
    }
    return active;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
      }
    };

    if (activeMegaMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMegaMenu]);

  // 1. Khai báo object ánh xạ class rõ ràng ngoài hàm Render để Tailwind biên dịch tĩnh được class
  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4"
  };

  return (
    <>
      <div className="relative overflow-hidden bg-[#b00c3b] text-white py-1 shadow-inner">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <Award size={18} strokeWidth={2.5} className="text-yellow-400 relative z-10 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
              <span className="absolute inset-0 bg-yellow-400/60 blur-sm rounded-full animate-ping"></span>
            </div>
            <span className="text-[11px] font-bold uppercase">
              {getTranslation('header.top.description', language)}
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-bold">
            <div className="hidden md:flex items-center gap-4 border-r border-white/20 pr-5">
              <Link onClick={(e) => handlePageLink(e, link_about, navigate)} to={link_about} className="hover:text-yellow-400 transition-colors uppercase tracking-tight">
                {getTranslation('header.top.about', language)}
              </Link>
              <Link to={link_member} className="hover:text-yellow-400 transition-colors uppercase tracking-tight">
                {getTranslation('header.top.members', language)}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('vi')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border ${language === 'vi' ? 'bg-white/10 border-white/10 opacity-100' : 'bg-white/5 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/10'}`}
              >
                <Flag size={14} className="text-white" />
                <span className="">VN</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border ${language === 'en' ? 'bg-white/10 border-white/10 opacity-100' : 'bg-white/5 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/10'}`}
              >
                <Globe size={14} className="text-white" />
                <span className="">EN</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* BLOCK 1 (NAV) */}
      <header className={`w-full z-50 sticky top-0 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20'
        : 'bg-white border-b border-border-subtle'
        }`}>
        <div className={`max-w-container-max mx-auto px-margin-desktop transition-all duration-300 flex justify-between items-center relative ${isScrolled ? 'h-20 py-3' : 'h-24 py-4'
          }`}>
          <Link to={link_home} className="flex items-center">
            <picture className="relative z-10 w-full h-full">
              <source
                srcSet={props.data_info?.logo[language].srcSet} type="image/webp"
                sizes="100px"
              />
              <img
                width={100}
                height={53}
                alt={props.data_info?.logo[language].alt}
                className={`transition-all duration-300 ${isScrolled ? 'h-10 w-20' : ''}`}
                src={props.data_info?.logo[language].src}
                referrerPolicy="no-referrer"
              />
            </picture>
          </Link>
          <nav ref={menuRef} className="hidden lg:flex items-center text-sm font-bold h-full">
            {navItems.map((item: any) => {
              const hasMega = item.mega && item.mega.length > 0;
              const isOpen = activeMegaMenu === item.slug;
              // 2. Thay thế đoạn code hiển thị Menu của anh bằng cấu trúc chuẩn này:
              const totalCols = item.megaHeader?.length || 3;
              const gridClass = gridColsMap[totalCols] || "grid-cols-3";            
              return (
                <div 
                  key={item.slug} 
                  className={`h-full px-3 flex items-center ${hasMega ? 'group' : ''}`}
                >
                  <Link
                    className={`text-base py-4 text-center font-paragraph transition-colors duration-200 relative z-10 cursor-pointer flex items-center gap-1 ${isActive(item) || isOpen
                      ? "text-signal-red"
                      : "text-primary hover:text-signal-red group-hover:text-signal-red"
                      }`}
                    onClick={(e) => {
                      if (hasMega && activeMegaMenu !== item.slug) {
                        e.preventDefault();
                        setActiveMegaMenu(item.slug);
                      } else {
                        handlePageLink(e, `/${item.slug}`, navigate);
                        setActiveMegaMenu(null);
                      }
                    }}
                    to={`/${item.slug}`}
                  >
                    {item.label}
                    {hasMega && <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                  </Link>

                  {hasMega && (
                    <div className={`absolute top-[80%] left-0 w-full pt-2 z-[100] ${
                      isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}>
                      <div className={`bg-white border border-border-subtle shadow-2xl rounded-b-2xl p-8 grid ${gridClass} gap-6 overflow-y-auto max-h-[calc(100vh-100px)] relative custom-scrollbar`}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMegaMenu(null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-primary text-white shadow-lg hover:bg-signal-red hover:scale-110 rounded-full z-50 flex items-center justify-center group/close"
                          title="Đóng menu"
                        >
                          <X size={20} strokeWidth={3} className="transition-transform group-hover/close:rotate-90" />
                        </button>
                        {item.megaHeader.map((header: any, colIndex: number) => (
                          <div key={colIndex} className="flex flex-col gap-4">
                            {header.text && (
                              <h3 className="text-lg font-bold text-primary mb-2">{header.text}</h3>
                            )}
                            {header.img && (
                              <img 
                                srcSet={`data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 1w, ${header.img} 1024w`}
                                src={header.img} 
                                alt={header.text || "Mega menu image"} 
                                className="mb-2 object-contain" 
                                sizes="(max-width: 767px) 1px, 1024px"
                                />
                            )}
                            {item.mega
                              .filter((sub: any) => parseInt(sub.position) === colIndex)
                              .map((sub: any) => {
                                const isSubActive = isActive(sub);
                                return (
                                  <Link
                                    key={sub.slug}
                                    className={`group/sub p-4 rounded-xl transition-all flex flex-col gap-2 border text-left ${isSubActive
                                      ? "bg-slate-50 border-border-subtle shadow-sm"
                                      : "hover:bg-slate-50 border-transparent hover:border-border-subtle"
                                      }`}
                                    onClick={(e) => {
                                      handlePageLink(e, `/${sub.slug}`, navigate);
                                      setActiveMegaMenu(null);
                                    }}
                                    to={`/${sub.slug}`}
                                  >
                                    <div className={`font-bold transition-colors flex items-center justify-between ${isSubActive ? "text-signal-red" : "text-primary group-hover/sub:text-signal-red"
                                      }`}>
                                      <span className="text-lg">{sub.label}</span>
                                      <ChevronRight size={16} className={`transition-all ${isSubActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0"
                                        }`} />
                                    </div>
                                    {sub.description && (
                                      <p className="text-sm text-on-surface-variant line-clamp-2 font-normal leading-relaxed opacity-80">
                                        {sub.description}
                                      </p>
                                    )}
                                  </Link>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              aria-label="Toggle Cart"
              variant="ghost"
              size="default"
              className="relative hover:bg-accent/10 transition-colors duration-200 [&_svg]:size-auto"
              onClick={actions.toggleCart}
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b00c3b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Button>
            {/* Nút Toggle Menu Mobile */}
            <button
              className="lg:hidden p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Nội dung Menu cho Mobile */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-white border-t border-border-subtle shadow-2xl transition-all duration-300 ease-in-out z-[60] ${mobileMenuOpen ? 'max-h-[90vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'
            }`}
        >
          <nav className="flex flex-col p-4 max-h-[90vh] overflow-y-auto">
            {navItems.map((item: any) => {
              const hasMega = item.mega && item.mega.length > 0;
              const isMobileMegaOpen = activeMobileMegaMenu === item.slug;
              const isCurrentActive = isActive(item);

              return (
                <div key={item.slug} className="border-b border-gray-50 last:border-none">
                  {hasMega ? (
                    <>
                      <button
                        className={`flex items-center justify-between w-full py-4 px-4 text-sm font-bold uppercase transition-colors ${isMobileMegaOpen || isCurrentActive ? 'text-signal-red' : 'text-primary hover:text-signal-red'}`}
                        onClick={() => setActiveMobileMegaMenu(isMobileMegaOpen ? null : item.slug)}
                      >
                        {item.label}
                        <ChevronDown size={14} className={`transition-transform ${isMobileMegaOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileMegaOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col pl-8 pb-4 bg-slate-50/50">
                          {item.mega.map((subItem: any) => (
                            <Link
                              key={subItem.slug}
                              className={`py-3 text-sm font-medium transition-colors ${isActive(subItem) ? 'text-signal-red' : 'text-on-surface-variant hover:text-signal-red'}`}
                              onClick={(e) => {
                                setMobileMenuOpen(false);
                                setActiveMobileMegaMenu(null); // Close mobile mega menu as well
                                handlePageLink(e, `/${subItem.slug}`, navigate);
                              }}
                              to={`/${subItem.slug}`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      className={`flex items-center justify-between w-full py-4 px-4 text-sm font-bold uppercase transition-colors ${isCurrentActive ? 'text-signal-red' : 'text-primary hover:text-signal-red'
                        }`}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        handlePageLink(e, `/${item.slug}`, navigate);
                      }}
                      to={`/${item.slug}`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
            {/* Bổ sung các link phụ ở topbar vào menu mobile */}
            <div className="flex flex-col border-t border-border-subtle mt-2 pt-2 md:hidden">
              <Link
                to={link_about}
                className="py-4 px-4 text-sm font-bold text-on-surface-variant uppercase"
                onClick={(e) => { setMobileMenuOpen(false); handlePageLink(e, link_about, navigate); }}>
                {getTranslation('header.top.about', language)}
              </Link>
              <Link
                to={link_member}
                className="py-4 px-4 text-sm font-bold text-on-surface-variant uppercase"
                onClick={(e) => { setMobileMenuOpen(false); handlePageLink(e, link_member, navigate); }}>
                {getTranslation('header.top.members', language)}
              </Link>
            </div>
          </nav>
        </div>
      </header>
      {/* BLOCK 2 (HOTLINE) */}
      <div className="bg-[#0D47A1] text-white py-3">
        <div className="menu-support max-w-container-max mx-auto px-margin-desktop flex flex-wrap justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span className="font-bold">{getTranslation('header.top.hanoi', language)}:</span> {data_info.sodienthoaiHaNoi[language]}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span className="font-bold">{getTranslation('header.top.hochiminh', language)}:</span> {data_info.sodienthoaiHCM[language]}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase">{getTranslation('header.top.suport247', language)}:</span>
            <span className="text-2xl font-black text-yellow-400">{data_info.hotline[language]}</span>
          </div>
        </div>
      </div>
    </>
  );
}
