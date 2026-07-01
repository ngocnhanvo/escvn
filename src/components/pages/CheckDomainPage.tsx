import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { AppRouterProps } from '@/entities';
import { useLanguage, returnCurrentPage } from '@/lib/LanguageContext';
import { motion, Search } from '@/lib/effects'
import { useSearchParams } from 'react-router-dom';
import domain from '@/data/domains.json';
import { formatCurrency, formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
import { getTranslation } from '@/lib/i18n';
import {FocusTrap} from 'focus-trap-react';
// Kiểm tra xem User Agent có chứa các từ khóa của thiết bị di động không
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function CheckDomainPage(props: AppRouterProps) {
  const { language, setLanguage } = useLanguage();
  const page = returnCurrentPage(props, language);
  let currency = getCurrencyByKey('vi');
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Dữ liệu giả lập cấu trúc các TLDs và trạng thái
  let VN_DOMAINS = [];
  let INTL_DOMAINS = [];
  page.contents.map((block, index) => {
    if (block.type === 'shortcode') {
      let data = block.data;
    if (!data)
        return;

     VN_DOMAINS = data.items.filter((item: any) => item?.tld && item?.tld?.endsWith('.vn')) || [];
     INTL_DOMAINS = data.items.filter((item: any) => item?.tld && !item?.tld?.endsWith('.vn')) || [];
    }
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const idFromUrl = searchParams.get('id');
  const [searchName, setSearchName] = useState('');
  const handleSearch = (newName: string) => {
    const cleanInput = newName.replaceAll(' ', '').replace(/^(https?:\/\/)?(www\.)?/, '');

    const allSupportedDomains = [...domain.vi, ...domain.en];
    const sortedDomains = [...allSupportedDomains].sort((a, b) => b.tld.length - a.tld.length);

    // Kiểm tra nếu người dùng có nhập đuôi (có chứa dấu chấm)
    if (cleanInput.includes('.')) {
      const foundDomain = sortedDomains.find(d => cleanInput.endsWith(d.tld));

      if (foundDomain) {
        const domainName = cleanInput.substring(0, cleanInput.length - foundDomain.tld.length);

        // Tên miền không được chứa dấu chấm ở phần tên (ví dụ: test.abc.com)
        if (domainName.includes('.')) {
          const mess = getTranslation("checkdomain.tenmienKhongHopLe", language);
          handleWhois(mess, true);
          return;
        }

        setSearchName(domainName);
        setSearchParams({ id: cleanInput });
      } else {
        // Có dấu chấm nhưng không khớp TLD nào trong danh sách -> Báo lỗi
        const mess = getTranslation("checkdomain.tenmienKhongHopLe", language);
        handleWhois(mess, true);
        return;
      }
    } else {
      // Không có dấu chấm -> chỉ là tên, không cần kiểm tra đuôi
      setSearchName(cleanInput);
      setSearchParams({ id: cleanInput });
    }
  };

  useEffect(() => {
    if (idFromUrl && idFromUrl.trim()) {
      handleSearch(idFromUrl.trim().toLowerCase());
    }
  }, [idFromUrl]);

  const popupRef = useRef<HTMLDivElement>(null);
  const closePopup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setWhoisData(prev => ({ ...prev, isOpen: false }));
  };
  const [whoisData, setWhoisData] = useState<{ isOpen: boolean; content: string; loading: boolean, title?: string }>({
    isOpen: false,
    content: '',
    title: '',
    loading: false
  });
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        closePopup();
      }
    };
    if (whoisData.isOpen) {
      const closeButton = document.getElementById('whois-close-btn');
      closeButton?.focus();
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [whoisData.isOpen]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const handleWhois = async (domainFull: string, mess: boolean = false) => {
    if (mess) {
      setWhoisData({ isOpen: true, content: domainFull, loading: false, title: getTranslation("checkdomain.ketquatimkiem", language) });
      return;
    }

    // Hủy request cũ nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Khởi tạo controller mới cho request này
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setWhoisData({ isOpen: true, content: '', loading: true });
    try {
      const res = await fetch('/api/checkdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainFull, act: 'getwhois' }),
        signal: controller.signal
      });
      const data = await res.json();
      setWhoisData({
        isOpen: true,
        content: data.whois || getTranslation("checkdomain.khongTimThayThongTin", language),
        loading: false
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request đã bị hủy');
        return; // Không set state nếu user cố tình hủy
      }
      setWhoisData({ isOpen: true, content: 'Lỗi khi tải dữ liệu', loading: false });
    }
  };



  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />

      <main id="main-content">

        {/* Content Section */}
        <section className="max-w-[1300px] mx-auto px-margin-desktop">
          <div className="space-y-12 article-content" ref={contentRef}>
            <div className="max-w-none text-foreground leading-relaxed">
              <div className="mt-12 mb-14">
                <SearchBar
                  initialValue={idFromUrl || ""}
                  onSearch={handleSearch}
                  language={language}
                  inputRef={inputRef}
                />
              </div>

              {/* Hiển thị kết quả cho chính tên miền vừa tìm kiếm nếu có đuôi */}
              {idFromUrl && (() => {
                const allSupportedDomains = [...domain.vi, ...domain.en];
                const sortedDomains = [...allSupportedDomains].sort((a, b) => b.tld.length - a.tld.length);
                const domainInfo = sortedDomains.find(d => idFromUrl.endsWith(d.tld));

                // Nếu không tìm thấy TLD hoặc phần tên chứa dấu chấm thì không hiển thị kết quả đặc biệt
                if (!domainInfo) return null;
                const domainName = idFromUrl.substring(0, idFromUrl.length - domainInfo.tld.length);
                if (domainName.includes('.')) return null;

                return (
                  <div className="mb-12 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <h3 className="text-indigo-900 font-bold mb-4">{getTranslation("checkdomain.ketquatimkiem", language)}</h3>
                    <DomainItem
                      name={domainName}
                      tld={domainInfo.tld}
                      priceReg={domainInfo.priceReg}
                      priceRenew={domainInfo.priceRenew}
                      onWhois={handleWhois}
                      currency={currency}
                      language={language}
                      isSpecialView={true}
                    />
                  </div>
                );
              })()}

              {/* Khu vực Grid 2 Khối danh sách song song */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <DomainBlock
                  title={getTranslation("checkdomain.tenmienVietNam", language)}
                  domains={VN_DOMAINS}
                  currency={currency}
                  currentSearch={searchName}
                  onWhois={handleWhois}
                  language={language}
                />
                <DomainBlock
                  title={getTranslation("checkdomain.tenmienQuocTe", language)}
                  domains={INTL_DOMAINS}
                  currency={currency}
                  currentSearch={searchName}
                  onWhois={handleWhois}
                  language={language}
                />
              </div>
            </div>
          </div>
        </section>
        <FooterSection {...props} />

        {/* Popup Whois */}
        {whoisData.isOpen && (
          <FocusTrap>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              ref={popupRef}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">{whoisData.title || getTranslation("checkdomain.thongtinwhois", language)}</h3>
                <button
                  id="whois-close-btn" 
                  onClick={() => {
                    setWhoisData(prev => ({ ...prev, isOpen: false }));
                    if(whoisData.title)
                      setTimeout(() => inputRef.current?.focus(), 0);
                  }}>
                    {getTranslation("checkdomain.dongwhois", language)}
                </button>
              </div>
              {whoisData.loading ? (
                <div className="flex justify-center p-10 text-slate-500">{getTranslation("checkdomain.loadwhois", language)}</div>
              ) : (
                <div
                  className="[&>pre]:whitespace-pre-wrap [&>pre]:text-xs [&>pre]:md:text-sm [&>pre]:text-slate-600 [&>pre]:bg-slate-50 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:border [&>pre]:border-slate-200 leading-10"
                  dangerouslySetInnerHTML={{ __html: whoisData.content }}
                />
              )}
            </div>
          </div>
          </FocusTrap>
        )}
      </main>
      <Footer {...props} />
    </div>
  );
}

function SearchBar({ initialValue, onSearch, language, inputRef }) {
  const [inputValue, setInputValue] = useState(initialValue || "");
  useEffect(() => {
    if (!isMobile)
      inputRef.current?.focus();
  }, []);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim().toLowerCase());
      if (!isMobile)
        inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex shadow-lg rounded-2xl overflow-hidden border border-slate-200 bg-white max-w-3xl mx-auto mb-16 p-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={getTranslation('checkdomain.NhapTenMienBanMuon', language)}
        aria-label={getTranslation('checkdomain.NhapTenMienBanMuon', language)}
        className="flex-1 px-6 py-3 text-lg outline-none text-slate-700 placeholder-slate-400 bg-transparent"
      />
      <button
        type="submit"
        aria-label={getTranslation('checkdomain.KiemTra', language)}
        className="bg-primary hover:bg-primary/90 text-white px-4 font-bold rounded-xl transition-all shadow-md active:scale-95"
      >
        {/* Chữ "Kiểm tra" chỉ hiện từ md trở lên */}
        <span className="hidden md:inline">{getTranslation('checkdomain.KiemTra', language)}</span>

        {/* Icon Search luôn hiện, nhưng chỉ hiển thị trên mobile nếu bạn muốn */}
        <span className="md:hidden">
          <Search size={20} />
        </span>
      </button>
    </form>
  );
}

function DomainBlock({ title, domains, currentSearch, onWhois, currency, language }) {
  const [visibleCount, setVisibleCount] = useState(6);
  useEffect(() => {
    setVisibleCount(6);
  }, [currentSearch]);
  const visibleDomains = domains.slice(0, visibleCount);
  const hasMore = visibleCount < domains.length;

  return (
    // 1. Container chính là flex-col
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
      <div className="bg-gradient-to-r from-primary to-indigo-900 text-white px-6 py-5 font-bold text-xl tracking-tight">
        {title}
      </div>

      {/* 2. Phần danh sách: flex-grow-1 để nó chiếm hết không gian khả dụng */}
      <div className="flex-grow divide-y divide-slate-100 p-2">
        {visibleDomains.map((item, index) => (
          <DomainItem
            key={index}
            name={currentSearch}
            {...item}
            onWhois={onWhois}
            currency={currency}
            language={language}
          />
        ))}
      </div>

      {/* 3. Phần button: mt-auto sẽ đẩy nó xuống dưới cùng của khối bất kể danh sách ngắn hay dài */}
      <div className="mt-auto">
        {hasMore && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="text-sm text-primary hover:text-indigo-700 font-bold transition-all w-full"
            >
              {getTranslation('checkdomain.xemthem', language).replaceAll('{so}', Math.min(6, domains.length - visibleCount).toString())}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DomainItem({ name, tld, priceReg, priceRenew, onWhois, currency, language, isSpecialView = false }) {
  const [isAvailable, setIsAvailable] = useState<boolean | null | 'timeout'>(null);
  const [retryCount, setRetryCount] = useState(0);
  const domainName = name ? `${name}${tld}` : `example${tld}`;
  useEffect(() => {
    if (!name) return;
    setIsAvailable(null); // Reset trạng thái khi bắt đầu fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/checkdomain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: `${name}${tld}` }),
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        setIsAvailable(data.status === "0");
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          setIsAvailable('timeout');
        }
        else {
          setIsAvailable(false);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [name, tld, retryCount]);

  const ariaLabel = isAvailable === null ?
    getTranslation("checkdomain.loading", language) :
    isAvailable === 'timeout' ?
      getTranslation("checkdomain.btnTimeout", language) :
      isAvailable ?
        getTranslation("checkdomain.btnChon", language) :
        getTranslation("checkdomain.btnwhois", language);

  return (
    <div className={`flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors rounded-xl group gap-4 ${isSpecialView ? 'bg-white shadow-sm border border-indigo-200' : ''}`}>
      {/* Cột tên miền: thêm 'min-w-0' để flex không bị đẩy vỡ */}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span
          className={`text-base font-bold break-all 
            ${isAvailable == null ? 'text-slate-400' :
              isAvailable === true ? 'text-emerald-600' : 'text-slate-400 line-through'
            }`}
          title={domainName} // Hiển thị full tên khi rê chuột vào
        >
          {domainName}
        </span>
        <div className="text-slate-400 font-medium break-all">
          {priceReg !== null && priceReg !== undefined && (
            <>{getTranslation("checkdomain.dangky", language)}: <span className="text-slate-600">{formatCurrency(priceReg, currency.code)}</span> / </>
          )}
          {priceRenew !== null && priceRenew !== undefined && (
            <>{getTranslation("checkdomain.giahan", language)}: <span className="text-slate-600">{formatCurrency(priceRenew, currency.code)}</span></>
          )}
        </div>
      </div>

      {/* Cột nút: thêm 'flex-shrink-0' để nút không bị co lại khi tên miền quá dài */}
      <div className="flex-shrink-0">
        <button
          onClick={() => {
            if (isAvailable === 'timeout') {
              setRetryCount(prev => prev + 1);
            } else if (!isAvailable) {
              onWhois(`${name}${tld}`);
            }
          }}
          aria-label={ariaLabel}
          className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all 
            ${isAvailable === null ? "bg-slate-50 text-slate-400 cursor-wait" :
              isAvailable === 'timeout' ? "bg-orange-50 text-orange-600" :
                isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}
        >
          {ariaLabel}
        </button>
      </div>
    </div>
  );
}

