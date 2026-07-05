import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const PageTransition = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let startTime = 0;
    const MIN_DURATION = 250; // Giảm xuống một chút để phản hồi nhanh hơn

    const start = () => {
      startTime = Date.now();
      setIsAnimating(true);
    };

    const stop = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, remaining);
    };

    window.addEventListener('app:nav-start', start);
    window.addEventListener('app:nav-end', stop);

    return () => {
      window.removeEventListener('app:nav-start', start);
      window.removeEventListener('app:nav-end', stop);
    };
  }, []);
  
  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          // 1. Trạng thái xuất phát
          initial={{ width: "0%", opacity: 1 }}
          
          // 2. Trạng thái chạy tự động (Khi đang fetch JSON ngầm)
          // Sử dụng hàm easeOut với duration dài để thanh loading tự trượt mượt mà, chậm dần về 95%
          animate={{ 
            width: "95%",
            transition: { 
              duration: 8, 
              ease: [0.1, 0.8, 0.25, 1] // Khởi đầu nhanh, càng về sau càng chậm lại
            }
          }}
          
          // 3. Trạng thái kết thúc (Khi navigate() chạy xong)
          // Bứt tốc vút qua 100% cực nhanh, sau đó mới mờ dần để tạo cảm giác "đã tải xong"
          exit={{ 
            width: "100%",
            opacity: 0,
            transition: { 
              width: { duration: 0.25, ease: "easeOut" },
              opacity: { delay: 0.15, duration: 0.2, ease: "linear" } 
            }
          }}
          
          // 4. Tăng hiệu ứng thị giác (Thêm vệt sáng neon ở đầu thanh loading)
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-amber-400 to-yellow-300 z-[99999]"
          style={{ 
            originX: 0,
            boxShadow: "0 0 10px #fbbf24, 0 0 5px #f59e0b"
          }}
        />
      )}
    </AnimatePresence>
  );
};