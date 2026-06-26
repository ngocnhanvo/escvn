import { Link } from 'react-router-dom';
import { Phone, Mail, Truck, CreditCard, RefreshCw, Facebook, Youtube, MapPin, Map } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { AppRouterProps } from '@/entities';
import { getTranslation } from '@/lib/i18n';
import { useLanguage } from '@/lib/LanguageContext';
import { motion } from 'framer-motion';

export default function FooterSection(props: AppRouterProps) {
  const { language } = useLanguage();
  
  return (
      <section className="bg-white py-16 border-b border-border-subtle">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          <motion.div className="space-y-4">
            <picture className="relative z-10 w-full h-full">
              <source
                srcSet={props.data_info?.logo[language].srcSet} type="image/webp"
                sizes="100px"
              />
              <img
                width={150}
                height={80}
                alt={props.data_info?.logo[language].alt}
                src={props.data_info?.logo[language].src}
              />
            </picture>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {getTranslation('home.contact.description', language)}
            </p>
          </motion.div>
          <motion.div className="space-y-4">
            <h3 className="font-bold text-primary text-lg flex items-center gap-2">
              <MapPin className="text-signal-red w-5 h-5" />
              {getTranslation('home.contact.hanoi_title', language)}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {props.data_info?.diachiHaNoi[language]}
              <br />
              {getTranslation('home.contact.tel', language)}: {props.data_info?.sodienthoaiHaNoi[language]}
              <br />
              {getTranslation('home.contact.email', language)}: {props.data_info?.emailHaNoi[language]}
            </p>
            <a
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              href={props.data_info?.googlemapHaNoi[language]}
              target='mapESC_Hanoi'
            >
              <Map size={16} /> {getTranslation('home.contact.view_map', language)}
            </a>
          </motion.div>
          <motion.div className="space-y-4">
            <h3 className="font-bold text-primary text-lg flex items-center gap-2">
              <MapPin className="text-signal-red w-5 h-5" />
              {getTranslation('home.contact.hcm_title', language)}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {props.data_info?.diachiHCM[language]}
              <br />
              {getTranslation('home.contact.tel', language)}: {props.data_info?.sodienthoaiHCM[language]}
              <br />
              {getTranslation('home.contact.email', language)}: {props.data_info?.emailHCM[language]}
            </p>
            <a
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              href={props.data_info?.googlemapHCM[language]}
              target='mapESC_HCM'
            >
              <Map size={16}/> {getTranslation('home.contact.view_map', language)}
            </a>
          </motion.div>
        </motion.div>
      </section>
  );
}
