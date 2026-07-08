import { Pages } from '@/entities/Pages';
import { motion, fadeInUp } from '@/lib/effects/motion';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
interface home_03 {
    page: Pages;
    data: any;
}
export default function Home_03(props: home_03) {
    let language = props.page.lang;
    let data = props.data;
    if (!data)
        return null;
    if(!data.items)
        return null;
    let currency = getCurrencyByKey('vi');

    return (
        <section className="bg-surface-container-low py-section-gap">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="max-w-container-max mx-auto px-margin-desktop"
            >
                <div className="text-center mb-16">
                    <h2 className="font-headline-lg text-3xl text-primary uppercase font-bold">
                        {data.title}
                    </h2>
                    <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {data.items.map(item => {
                        const IconMap: any = Object.values(item.icon)[0];
                        return (
                            <div className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center">
                                {item?.icon && (
                                    <span
                                        className="w-12 h-12 text-primary mb-4 [&>svg]:!w-full [&>svg]:!h-full"
                                        dangerouslySetInnerHTML={{ __html: item.icon }}
                                    />
                                )}
                                <h3 className="font-bold text-lg">{item?.label}</h3>
                                <p className="text-sm text-on-surface-variant mt-2">
                                    {item?.description}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </section>
    );
}
