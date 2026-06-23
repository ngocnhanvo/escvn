import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import NotFoundPage from '@/integrations/errorHandlers/ErrorPage404';
import { AppRouterProps } from '@/entities';

export default function ErrorPage500(props: AppRouterProps) {
  const error = useRouteError();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      {/* Tiêu đề lỗi */}
      <h1 className="text-4xl font-bold text-primary mb-3">Oops!</h1>
      
      {/* Thông báo lỗi bằng tiếng Anh */}
      <p className="text-lg text-on-surface-variant font-medium">
        An unexpected error has occurred.
      </p>
      
      {/* Dòng sub-text bổ sung chi tiết nhỏ */}
      <p className="text-sm text-gray-400 mt-1 mb-6 italic">
        Please try again later or return to the homepage.
      </p>

      {/* Nút quay lại trang chủ bằng tiếng Anh */}
      <a 
        href="/" 
        className="px-5 py-2.5 bg-primary text-white font-medium rounded-lg shadow-md hover:opacity-90 transition-all duration-200 text-sm"
      >
        Back to Homepage
      </a>
    </div>
  );
}