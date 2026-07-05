import { useState, useEffect } from "react";

export function usePageData(currentSlug: string) {
  const [commonData, setCommonData] = useState<any>(null);
  const [currentPageData, setCurrentPageData] = useState<any>(null);
  const [updatedPages, setUpdatedPages] = useState<any[]>([]);

  // Bùa chống cache trình duyệt giống như đã nói ở câu trước
  const cacheBuster = `?t=${new Date().getTime()}`;

  // Giai đoạn 1: Chỉ chạy 1 lần duy nhất khi F5 vào web
  useEffect(() => {
    fetch(`/data/cms-common.json${cacheBuster}`)
      .then((res) => res.json())
      .then((data) => setCommonData(data))
      .catch((err) => console.error("Lỗi fetch common:", err));
  }, []);

  // Giai đoạn 2: Tự động chạy lại bất cứ khi nào đổi URL/Slug (Cả F5 lẫn Click AJAX)
  useEffect(() => {
    if (!currentSlug) return;

    fetch(`/data/page-${currentSlug}.json${cacheBuster}`)
      .then((res) => res.json())
      .then((pageData) => setCurrentPageData(pageData))
      .catch((err) => console.error("Lỗi fetch trang chi tiết:", err));
  }, [currentSlug]);

  // Giai đoạn 3: Gộp dữ liệu (Chạy lại khi commonData hoặc currentPageData thay đổi)
  useEffect(() => {
    if (!commonData?.pages) return;

    const merged = commonData.pages.map((p: any) => {
      // So sánh trùng key và trùng cả ngôn ngữ (nếu hệ thống của bạn có đa ngôn ngữ)
      if (p.key === currentPageData?.key && p.lang === currentPageData?.lang) {
        return { ...p, ...currentPageData };
      }
      return p;
    });

    setUpdatedPages(merged);
  }, [commonData, currentPageData]);

  // Trả về dữ liệu sạch sau khi gộp để component bên ngoài sử dụng
  return {
    commonData,
    currentPageData,
    pages: updatedPages,
  };
}