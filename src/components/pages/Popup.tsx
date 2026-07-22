import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';
import { AppRouterProps } from '@/entities';
import { useLanguage } from '@/context/LanguageContext';
import NotFoundPage from '../../../integrations/errorHandlers/ErrorPage404';
import { motion, AnimatePresence } from 'framer-motion';
import { globalStore } from '@/services/globalStore';
import { returnCurrentPage, returnCurrentPageAsync } from '@/context/LanguageContext/returnCurrentPage';
import Footer from '../Footer';

let page = await returnCurrentPageAsync();

// Dữ liệu nội dung chi tiết tương ứng cho từng loại popup
const popupContentMap: Record<string, { title: string; content: string }> = {
  phishing: {
    title: "Chi tiết: Phishing",
    content: `
      <h3 style="margin-top: 0; font-size: 1.1rem; color: #004b93; font-weight: 700; margin-bottom: 12px;">Tác động ảnh hưởng của phishing:</h3>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Thiệt hại cho người dùng cá nhân:</strong> Khi thông tin cá nhân bị lộ, người dùng có thể trở thành nạn nhân của gian lận, sự lạm dụng tài khoản và thậm chí là trộm danh tính, giả mạo, rao bán các thông tin trên diễn đàn tin tặc.</p>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Thiệt hại cho tổ chức:</strong> Tổ chức có thể mất uy tín và tiền bạc nếu tên miền của họ bị lạm dụng để tạo ra các trang web giả mạo. Họ cũng có thể phải chịu trách nhiệm pháp lý nếu dữ liệu của khách hàng bị đánh cắp do sự lạm dụng DNS.</p>
      <p style="text-align: justify; margin: 0;"><strong>Tổn thất về an ninh mạng:</strong> Khi các kẻ tấn công sử dụng phương pháp Phishing để lừa đảo người dùng, điều này có thể dẫn đến việc lây lan mã độc, phần mềm độc hại trên mạng và các vấn đề an toàn an ninh khác.</p>
    `
  },
  malware: {
    title: "Chi tiết: Malware",
    content: `
      <h3 style="margin-top: 0; font-size: 1.1rem; color: #004b93; font-weight: 700; margin-bottom: 12px;">Tác động ảnh hưởng của Malware:</h3>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Thay đổi thông tin cấu hình DNS:</strong> Malware có thể thay đổi cài đặt DNS trên máy tính của người dùng mà nó xâm nhập, dẫn đến việc kết nối đến máy chủ độc hại.</p>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Chuyển hướng trang Web:</strong> Dẫn người dùng đến các trang web giả mạo để đánh cắp thông tin tài khoản ngân hàng và dữ liệu cá nhân.</p>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Tấn công Man-in-the-Middle (MITM):</strong> Can thiệp vào giao tiếp giữa máy tính và máy chủ mục tiêu để đánh cắp tên đăng nhập và mật khẩu.</p>
      <p style="text-align: justify; margin: 0;"><strong>Phát tán mã độc và Botnets:</strong> Tạo ra các mạng bot phục vụ cho các cuộc tấn công diện rộng như DDoS.</p>
    `
  },
  botnet: {
    title: "Chi tiết: Botnets",
    content: `
      <h3 style="margin-top: 0; font-size: 1.1rem; color: #004b93; font-weight: 700; margin-bottom: 12px;">Tác động ảnh hưởng của Botnets:</h3>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Tấn công từ chối dịch vụ (DDoS):</strong> Nhiều máy tính cùng lúc gửi lượng truy cập khổng lồ làm tê liệt hệ thống mục tiêu.</p>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Phát tán Spam và Phishing:</strong> Gửi hàng loạt email lừa đảo với quy mô lớn.</p>
      <p style="text-align: justify; margin: 0;"><strong>Tải mã độc từ xa:</strong> Sử dụng DNS để tự động tải các tệp độc hại về máy tính trong mạng.</p>
    `
  },
  spam: {
    title: "Chi tiết: SPAM",
    content: `
      <h3 style="margin-top: 0; font-size: 1.1rem; color: #004b93; font-weight: 700; margin-bottom: 12px;">Tác động ảnh hưởng của SPAM:</h3>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Lừa đảo và phát tán mã độc:</strong> Chứa các liên kết độc hại dẫn đến các website giả mạo.</p>
      <p style="text-align: justify; margin-bottom: 12px;"><strong>Quá tải hệ thống:</strong> Tạo lượng lớn yêu cầu phân giải DNS và email rác làm nghẽn hệ thống.</p>
      <p style="text-align: justify; margin: 0;"><strong>Tốn kém tài nguyên:</strong> Gây phiền phức, mất thời gian và đội chi phí xử lý bảo mật cho doanh nghiệp.</p>
    `
  }
};

export default function Popup(props: AppRouterProps) {
  props = globalStore.getCommonData();
  const { language } = useLanguage();
  page = returnCurrentPage(props, language);

  // State quản lý Popup chi tiết
  const [activePopup, setActivePopup] = useState<{ title: string; content: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && page?.content) {
      // Xử lý Popup cho các thẻ a có class 'detail'
      const detailLinks = contentRef.current.querySelectorAll('a.detail');
      detailLinks.forEach((link: any) => {
        link.onclick = (e: MouseEvent) => {
          e.preventDefault();
          const dataType = link.getAttribute('data-type');
          if (dataType && popupContentMap[dataType]) {
            setActivePopup(popupContentMap[dataType]);
          }
        };
      });
    }
  }, [page?.content, language]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Đóng popup khi bấm phím Escape
      if (e.key === 'Escape' && activePopup) {
        setActivePopup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePopup]);

  if(page == null)
    return <NotFoundPage {...props}/>;

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      <Header {...props}/>

      <main id="main-content">

      {/* Content Section */}
      <section className="bg-white border-b border-border-subtle py-12">
        <div className="max-w-[1300px] mx-auto px-6">
          <div className="space-y-12 article-content" ref={contentRef}>
            <div className="prose max-w-none text-foreground/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </div>
      </section>

      <FooterSection {...props} />
      </main>
      <Footer {...props} />

      {/* Detail Popup Modal */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActivePopup(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-[650px] rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Popup */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="m-0 text-xl font-bold text-[#004b93] uppercase">
                  {activePopup.title}
                </h3>
                <button
                  onClick={() => setActivePopup(null)}
                  className="bg-transparent border-none text-2xl text-slate-400 hover:text-black cursor-pointer leading-none p-1 transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Body Popup */}
              <div 
                className="p-6 max-h-[70vh] overflow-y-auto text-slate-600 text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activePopup.content }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}