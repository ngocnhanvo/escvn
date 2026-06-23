import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export const handlePageLink = (e: React.MouseEvent, path: string, navigate: any) => {
    e.preventDefault();
    if(path.startsWith('/#'))
      return;
    if(path.startsWith('/http://') || path.startsWith('/https://')) {
      window.open(path.substring(1), '_blank');
      return;
    }

    if(window.location.pathname != path)
      window.dispatchEvent(new Event('app:nav-start'));
    
    // Chờ 50ms để hiệu ứng bắt đầu trước khi trình duyệt bận xử lý render trang mới
    setTimeout(() => {
      navigate(path);
    }, 0);
};

export const PageTransition = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let startTime = 0;
    const MIN_DURATION = 300; 

    const start = () => {
      startTime = Date.now();
      setIsAnimating(true);
    };

    const stop = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      
      // Đợi cho đến khi đủ thời gian tối thiểu mới tắt hiệu ứng
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
          initial={{ width: "0%", opacity: 1 }}
          animate={{ 
            width: ["0%", "30%", "70%", "90%"],
            transition: { 
              width: { duration: 5, times: [0, 0.05, 0.2, 1], ease: "linear" }
            }
          }}
          exit={{ 
            width: "100%",
            opacity: [1, 1, 0],
            transition: { 
              width: { duration: 0.3, ease: "easeOut" },
              opacity: { times: [0, 0.7, 1], duration: 0.4 }
            }
          }}
          className="fixed top-0 left-0 h-[3px] bg-yellow-400 z-[9999] shadow-[0_0_12px_rgba(250,204,21,0.6)]"
          style={{ originX: 0 }}
        />
      )}
    </AnimatePresence>
  );
}
