import { Variants, motion as motion0 } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export const motion = motion0;
export type { Variants };
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

  // Ánh xạ chuỗi icon từ JSON sang các component Lucide
export const IconMap: Record<string, React.ElementType> = { ...LucideIcons as any };

export {
  ChevronRight,
  ChevronLeft,
  Search,
  Cloud,
  LayoutGrid,
  Server,
  Lock,
  Settings,
  Code,
  Mail,
  AtSign,
  Database,
  CheckCircle,
  ShieldCheck,
  Heart,
  Cpu,
  Headset,
  Palette,
  MousePointerClick,
  Puzzle,
  Award,
  HelpCircle
} from 'lucide-react';