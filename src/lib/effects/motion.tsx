import { Variants, motion as motion0 } from 'framer-motion';
export const motion = motion0;
export type { Variants };
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

