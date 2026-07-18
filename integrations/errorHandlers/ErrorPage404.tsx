import Header from '@/components/Header';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { useLanguage } from '@/context/LanguageContext';

export default function ErrorPage404(props: AppRouterProps) {
  const { language } = useLanguage();
  const homepage = props.pages.find(s=>s.key == 'home' && s.lang == language);

  const t = language === 'en' ? {
    title: "PAGE NOT FOUND",
    desc: "The requested page was not found on the server. The connection might be unstable or the resource has been relocated.",
    btn: "BACK TO HOME",
  } : {
    title: "TRANG KHÔNG TỒN TẠI",
    desc: "Trang bạn yêu cầu không tìm thấy trên máy chủ. Kết nối có thể không ổn định hoặc tài nguyên đã được di chuyển.",
    btn: "VỀ TRANG CHỦ",
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-paragraph overflow-clip">
      <Header {...props} />
      
      <main className="flex flex-col items-center justify-center min-h-[75vh] text-center p-8 pt-48">
        <div className="relative mb-12 flex items-center justify-center w-full">
          {/* Số 404 mờ ảo phía sau */}
          <span style={{fontSize: "10rem", opacity: 0.1}} className="font-bold select-none leading-none tracking-tighter inline-block">
            404
          </span>
          {/* Thông báo lỗi chính */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-bold text-primary tracking-tighter uppercase animate-pulse" style={{ textShadow: '0 0 20px rgba(0, 255, 204, 0.5)' }}>
              {t.title}
            </h2>
          </div>
        </div>
        
        <div className="space-y-8 max-w-2xl mx-auto">
          <p className="text-lg md:text-xl text-foreground/60 font-mono italic leading-relaxed">
            {`// system_status: ERROR_NOT_FOUND`} <br />
            {`// log: ${t.desc}`}
          </p>
          
          {/* Dùng thẻ <a> để reload app, đảm bảo data trang chủ được nạp đúng chuẩn */}
          <a 
            href={`/${homepage.slug}`} 
            className="inline-block px-10 py-5 bg-primary text-primary-foreground font-bold text-lg transition-all hover:shadow-[0_0_30px_rgba(0,255,204,0.4)]" 
          >
            {t.btn}
          </a>
        </div>
      </main>
    </div>
  );
};