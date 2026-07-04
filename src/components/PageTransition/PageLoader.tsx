import { motion } from 'framer-motion';
// Hiệu ứng loading trang chuyên nghiệp hơn
export const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
    <div className="relative w-12 h-12">
      <div className="w-full h-full border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="font-mono text-[10px] tracking-[0.3em] text-primary/70 uppercase animate-pulse">
        Synchronizing Data...
      </span>
      <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-primary"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  </div>
);