//useDynamicHtml.tsx
import { useState, useEffect } from 'react';
import { extractHTML } from '@/lib/componentsReg/extractHTML'; // Đường dẫn tới file extractHTML của bạn

export function useDynamicHtml(page: any, props: any, more: any = {}) {
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadContent = async () => {
      try {
        const html = await extractHTML(page, props, more);
        if (isMounted) {
          setContent(html);
        }
      } catch (error) {
        console.error("Lỗi khi parse HTML:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
    // Sử dụng JSON.stringify hoặc bóc tách dependency chuẩn để tránh re-run vô tận nếu `more` là object mới
  }, [page, props, more.handleWhois]); 

  return { content, isLoading };
}