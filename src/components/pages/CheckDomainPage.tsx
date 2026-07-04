import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FooterSection from '@/components/FooterSection';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { useLanguage } from '@/lib/LanguageContext';

import { getTranslation } from '@/lib/i18n/getTranslation';
import {FocusTrap} from 'focus-trap-react';
import { extractHTML } from '@/lib/components';
import { useMemo } from 'react';
import { returnCurrentPage } from '@/lib/LanguageContext/returnCurrentPage';

// Kiểm tra xem User Agent có chứa các từ khóa của thiết bị di động không

export default function CheckDomainPage(props: AppRouterProps) {
  
  const { language, setLanguage } = useLanguage();
  const page = returnCurrentPage(props, language);
  const inputRef = useRef<HTMLInputElement>(null);
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
  
  const content = useMemo(() => {
    return extractHTML(page, props, { handleWhois, inputRef });
  }, [page]);
  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props} />

      <main id="main-content">

        {/* Content Section */}
        {content}

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



