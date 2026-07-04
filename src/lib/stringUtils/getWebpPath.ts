export const getWebpPath = (url: string) => {
  if (!url) return "";

  // 1. Kiểm tra nếu đang chạy trên trình duyệt và đường dẫn hiện tại bắt đầu bằng /preview
  const isPreviewPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/preview');
  
  // 2. Nếu là đường dẫn tuyệt đối (bắt đầu bằng http), thường là ảnh từ WP chưa được xử lý local
  if (isPreviewPath || url.startsWith('http')) {
    return url;
  }

  return url.replace(/\.[^/.]+$/, "") + ".webp";
};