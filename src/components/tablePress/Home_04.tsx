import { Pages, tablePress } from '@/entities';
import { motion, fadeInUp, IconMap, ChevronRight, CheckCircle, HelpCircle } from '@/lib/effects';
import { formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
interface home_04 {
    page: Pages;
    data: any;
}
export default function Home_04(props: home_04) {
    let language = props.page.lang;
    let data = props.data;
    if(!data)
        return null;
    let currency = getCurrencyByKey('vi');
    let image = data?.items[0]?.image;
    return (
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop [content-visibility:auto] [contain-intrinsic-size:0_500px]">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
                <motion.div className="lg:col-span-5">
                    <picture
                        className="w-full h-auto rounded-3xl shadow-2xl">
                        <source
                            srcSet={image?.srcSet} type="image/webp"
                            sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <img
                            width={651}
                            height={511}
                            alt={image?.alt}
                            src={image?.src}
                        />
                    </picture>
                </motion.div>
                <motion.div className="lg:col-span-7 space-y-8">
                    <motion.div>
                        <h2 className="font-headline-lg text-4xl text-primary font-bold mb-4">
                            {data.title}
                        </h2>
                        <p className="text-lg text-on-surface-variant">
                            {data.description}
                        </p>
                    </motion.div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                    >
                        {data.items?.map(item => {
                            const IconComponent = IconMap[item?.icon] || null;
                            let list = item?.list?.trim().split('\n').filter(i => i.trim() !== '');
                            return (
                                <motion.div variants={fadeInUp} className="space-y-3">
                                    {IconComponent == null ? null : (
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                                        <IconComponent size={24} />
                                    </div>
                                    )}
                                    <h3 className="font-bold text-xl">{item?.label}</h3>
                                    <ul className="space-y-2 text-sm text-on-surface-variant">
                                        {list.map(li => (
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            {li}
                                        </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}
