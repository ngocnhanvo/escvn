import { Pages } from '@/entities/Pages';
import { motion, fadeInUp } from '@/lib/effects/motion';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
interface home_05 {
    page: Pages;
    data: any;
}
export default function Home_05(props: home_05) {
    let language = props.page.lang;
    let data = props.data;
    if(!data && !data.items)
        return null;
    let currency = getCurrencyByKey('vi');
    return (
        <section className="bg-surface-container-low py-12 border-y border-border-subtle">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeInUp}
                className="max-w-container-max mx-auto px-margin-desktop"
            >
                <div className="text-center mb-12">
                    <h2 className="font-headline-lg text-4xl text-primary uppercase font-bold">
                        {data?.title}
                    </h2>
                    <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
                </div>
                <div className="flex items-center justify-between gap-8">
                    <button
                        className="opacity-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border-subtle text-on-surface-variant hover:text-primary"
                        aria-label={language === 'vi' ? 'Đối tác trước' : 'Previous partners'}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-wrap justify-center gap-12">
                        {data.items?.map(item => (
                            <picture
                                className="h-20 w-auto object-contain">
                                <source
                                    srcSet={item.image?.srcSet} type="image/webp"
                                    sizes="(max-width: 640px) 100vw, 400px"
                                />
                                <img
                                    className="h-20 w-auto object-contain"
                                    height={80}
                                    alt={item.label}
                                    src={item.image?.src}
                                />
                            </picture>
                        ))}
                    </div>
                    <button
                        className="opacity-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border-subtle text-on-surface-variant hover:text-primary"
                        aria-label={language === 'vi' ? 'Đối tác tiếp theo' : 'Next partners'}
                    >
                        <ChevronRight size={20} />
                    </button>

                </div>
            </motion.div>
        </section>
    );
}
