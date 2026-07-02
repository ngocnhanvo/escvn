import { Pages, tablePress } from '@/entities';
import { motion, fadeInUp, IconMap, ChevronRight, CheckCircle, HelpCircle } from '@/lib/effects';
import { formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
interface home_03 {
    page: Pages;
    data: any;
}
export default function Home_03(props: home_03) {
    let language = props.page.lang;
    let data = props.data;
    if(!data)
        return null;
    let currency = getCurrencyByKey('vi');

    return (
        <section className="bg-surface-container-low py-section-gap [content-visibility:auto] [contain-intrinsic-size:0_500px]">
            <div className="max-w-container-max mx-auto px-margin-desktop">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="font-headline-lg text-3xl text-primary uppercase font-bold">
                        {data.title}
                    </h2>
                    <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
                </motion.div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-8"
                >
                    {data.items.map(item => {
                        const IconComponent = IconMap[item?.icon] || null;
                        return (
                            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                                {IconComponent == null ? null : (
                                    <IconComponent className="w-12 h-12 text-primary mb-4" />
                                )}
                                <h3 className="font-bold text-lg">{item?.label}</h3>
                                <p className="text-sm text-on-surface-variant mt-2">
                                    {item?.description}
                                </p>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    );
}
