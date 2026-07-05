import { Pages } from '@/entities/Pages';
import { motion, fadeInUp } from '@/lib/effects/motion';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
interface home_04 {
    page: Pages;
    data: any;
}
export default function Home_04(props: home_04) {
    let language = props.page.lang;
    let data = props.data;
    if (!data)
        return null;
    let currency = getCurrencyByKey('vi');
    let image = data?.items[0]?.image;
    return (
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
                <div className="lg:col-span-5">
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
                </div>
                <div className="lg:col-span-7 space-y-8">
                    <div>
                        <h2 className="font-headline-lg text-4xl text-primary font-bold mb-4">
                            {data.title}
                        </h2>
                        <p className="text-lg text-on-surface-variant">
                            {data.description}
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {data.items?.map(item => {
                            let list = item?.list?.trim().split('\n').filter(i => i.trim() !== '');
                            return (
                                <div className="space-y-3">
                                    {item?.icon && (
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                                            <span
                                                className="w-6 h-6 text-primary mb-4 [&>svg]:w-full [&>svg]:h-full"
                                                dangerouslySetInnerHTML={{ __html: item.icon }}
                                            />
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
                                </div>
                            )
                        })}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
