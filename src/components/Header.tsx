import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/integrations/cms/cms-ecom/cart/useCartStore';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { handlePageLink } from '@/components/PageTransition/handlePageLink';
import { getTranslation } from '@/lib/i18n/getTranslation';
import { useLanguage } from '@/context/LanguageContext/index';
import { Button } from './ui/button';
import { Desktop } from './Menu/Desktop';
import { Mobile } from './Menu/Mobile';
import { getAvas } from '@/lib/avas_env';
import { awardSvg, flagSvg, globeSvg, mapPinSvg, menuSvg, shoppingCartSvg, xSvg } from '@/lib/icons';
export default function Header(props: AppRouterProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { itemCount, cartKey } = useCart(language);
  const data_info = props.data_info;
  const avas = getAvas(null);

  let navItems = props.menus.filter((a: Pages) => {
    if (!a.slug) return false;
    return a.lang === language && (a.header ?? true) == true;
  });

  const page_home = props.pages.find((a: Pages) => a.key === 'home' && a.lang === language && a.slug != undefined);
  const page_about = props.pages.find((a: Pages) => a.key === 'about' && a.lang === language && a.slug != undefined);
  const page_cart = props.pages.find((a: Pages) => a.key === 'cart' && a.lang === language && a.slug != undefined);
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

  return (
    <>
      <div className="relative overflow-hidden bg-[#b00c3b] text-white py-1 shadow-inner">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span
                className="w-[18px] h-[18px] [&>svg]:!w-full [&>svg]:!h-full [&>svg]:[stroke-width:2.5] text-yellow-400 relative z-10 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]"
                dangerouslySetInnerHTML={{
                  __html: awardSvg,
                }}
              />
              <span className="absolute inset-0 bg-yellow-400/60 blur-sm rounded-full animate-ping"></span>
            </div>
            <span className="text-[11px] font-bold uppercase">
              {getTranslation('header.top.description', language)}
            </span>
          </div>
          <div className="flex items-center gap-5 text-[11px] font-bold">
            {/* Ẩn link phụ dưới 800px, hiện khi từ 800px trở lên */}
            <div className="hidden mn-mb:flex items-center gap-4 border-r border-white/20 pr-5">
              <Link onClick={(e) => handlePageLink(e, page_about, `/${page_about.slug}`, navigate)} to={`/${page_about.slug}`} className="hover:text-yellow-400 transition-colors uppercase tracking-tight">
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
                <span
                  className="w-[14px] h-[14px] [&>svg]:!w-full [&>svg]:!h-full text-white"
                  dangerouslySetInnerHTML={{
                    __html: flagSvg
                  }}
                />
                <span className="">VN</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border ${language === 'en' ? 'bg-white/10 border-white/10 opacity-100' : 'bg-white/5 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/10'}`}
              >
                <span
                  className="w-[14px] h-[14px] [&>svg]:!w-full [&>svg]:!h-full text-white"
                  dangerouslySetInnerHTML={{
                    __html: globeSvg
                  }}
                />
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
          <a href={`/${page_home.slug}`} className="flex items-center">
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
          </a>

          {/* 1. MENU DESKTOP: Ẩn mặc định, chỉ block khi màn hình >= 800px */}
          <Desktop isActive={isActive} navItems={navItems} navigate={navigate} />

          <div className="flex items-center gap-2">
            <Button
              aria-label="Navigate Cart"
              variant="ghost"
              size="default"
              className="relative hover:bg-accent/10 transition-colors duration-200 [&_svg]:size-auto"
              onClick={(e) => {
                handlePageLink(e, page_cart, `/${page_cart.slug}`, navigate);
              }}
            >
              <span
                className="h-6 w-6 text-primary [&>svg]:!w-full [&>svg]:!h-full"
                dangerouslySetInnerHTML={{
                  __html: shoppingCartSvg
                }}
              />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b00c3b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* 2. NÚT TOGGLE MENU MOBILE: Hiện ở mobile, ẩn hoàn toàn khi màn hình >= 800px */}
            <button
              className="p-2 text-primary hover:bg-gray-100 rounded-lg transition-colors block mn-mb:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ?
                <span
                  className="h-5 w-5 text-primary [&>svg]:!w-full [&>svg]:!h-full"
                  dangerouslySetInnerHTML={{
                    __html: xSvg
                  }}
                /> :
                <span
                  className="h-5 w-5 text-primary [&>svg]:!w-full [&>svg]:!h-full"
                  dangerouslySetInnerHTML={{
                    __html: menuSvg
                  }}
                />
              }
            </button>
          </div>
        </div>

        <Mobile
          navItems={navItems}
          navigate={navigate}
          isActive={isActive}
          setMobileMenuOpen={setMobileMenuOpen}
          language={language}
          page_about={page_about}
          link_member={link_member}
          mobileMenuOpen={mobileMenuOpen}
          getTranslation={getTranslation}
        />
      </header>

      {/* BLOCK 2 (HOTLINE) */}
      <div className="bg-[#0D47A1] text-white py-3">
        <div className="menu-support max-w-container-max mx-auto px-margin-desktop flex flex-wrap justify-between items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 [&>svg]:!w-full [&>svg]:!h-full"
              dangerouslySetInnerHTML={{
                __html: mapPinSvg,
              }}
            />
            <span className="font-bold">{getTranslation('header.top.hanoi', language)}:</span> {data_info.sodienthoaiHaNoi[language]}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 [&>svg]:!w-full [&>svg]:!h-full"
              dangerouslySetInnerHTML={{
                __html: mapPinSvg,
              }}
            />
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