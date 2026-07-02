import { Pages, tablePress } from '@/entities';
import { motion, fadeInUp, IconMap, Cloud } from '@/lib/effects';
import { formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
interface home_01 {
    page: Pages;
    data: any; 
}
export default function Home_01(props: home_01) {
    let language = props.page.lang;
    let data = props.data;
    if(!data)
        return null;
    let currency = getCurrencyByKey('vi');

    return (
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="text-center mb-12"
            >
                <h2 className="font-headline-lg text-[32px] text-primary uppercase font-bold">
                    {data.title}
                </h2>
                <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
            </motion.div>
            <motion.div
                initial="hidden"
                whileInView="visible"
                
                variants={fadeInUp}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
            >
                {data.items.map((service: any, index: number) => {
                    const IconComponent = IconMap[service.icon] || Cloud;
                    return (
                        <div
                            key={data.id + index}
                            className="bg-white p-6 rounded-xl border border-border-subtle text-center hover:shadow-lg transition-shadow group flex flex-col items-center"
                        >
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                <IconComponent className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                            <p className="text-sm text-on-surface-variant mb-4 flex-grow">
                                {service.description}
                            </p>
                            <div className="mt-auto">
                                <div className="text-sm text-on-surface-variant">
                                    {data.fields[3]?.label}
                                </div>
                                <div className="text-signal-red font-black text-2xl mb-4">
                                    {formatCurrencyValue(service.price, currency.code, 3)}
                                    <span className="text-sm font-normal text-on-surface-variant">
                                        / {service.period}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </motion.div>
        </section>
    );
}
