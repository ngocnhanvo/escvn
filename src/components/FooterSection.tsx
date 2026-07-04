import { AppRouterProps } from '@/entities/AppRouterProps';
import { useLanguage } from '@/lib/LanguageContext';
import { returnCurrentPage } from '@/lib/LanguageContext/returnCurrentPage';
import { motion } from 'framer-motion';
import Map from 'lucide-react/dist/esm/icons/award';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
export default function FooterSection(props: AppRouterProps) {
  const { language } = useLanguage();
  const page = returnCurrentPage(props, language);
  let data = page?.tablePress?.find(a => a.shortcode == `pub_footer_01_${page.lang}`);
  if (!data)
    return null;
  let dataMain = data.json;
  let image = dataMain?.items[0]?.image;
  let label = dataMain?.items[0]?.label;

  return (
    <section className="bg-white py-16 border-b border-border-subtle [content-visibility:auto] [contain-intrinsic-size:0_500px]">
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
        <div className="space-y-4">
          <picture className="relative z-10 w-full h-full">
            <source
              srcSet={image.srcSet} type="image/webp"
              sizes="400px"
            />
            <img
              width={150}
              height={80}
              alt={image.alt}
              src={image.src}
            />
          </picture>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {label}
          </p>
        </div>
        {dataMain.items.map(item => (
          <div className="space-y-4">
            <h3 className="font-bold text-primary text-lg flex items-center gap-2">
              <MapPin className="text-signal-red w-5 h-5" />
              {item.office}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {item.address}
              <br />
              {item.tel}
              <br />
              {item.email}
            </p>
            <a
              className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              href={item.map}
              target='mapESC'
            >
              <Map size={16} /> {item.btn}
            </a>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
