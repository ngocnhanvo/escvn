import { Pages } from '@/entities/Pages';
import { motion, fadeInUp } from '@/lib/effects/motion';
import { formatCurrencyValue } from '@/lib/stringUtils/formatCurrencyValue';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import { handlePageLink } from '../PageTransition';
import { useNavigate } from 'react-router-dom';
interface home_02 {
    page: Pages;
    data: any;
}
export default function Home_02(props: home_02) {
    let language = props.page.lang;
    let data = props.data;
    if (!data)
        return null;
    if (!data.items)
        return null;
    let currency = getCurrencyByKey('vi');
    const navigate = useNavigate();
    
    return (
        <>
            {data.items.map((item, index) => {
                let tags = item?.tags?.trim().split('\n').filter(i => i.trim() !== '');
                let list = item?.list?.trim().split('\n').filter(i => i.trim() !== '');
                if (index % 2 == 0) {
                    return !item ? null : (
                        <section className="bg-surface-container-low py-16">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeInUp}
                                className="max-w-container-max mx-auto px-margin-desktop grid-cols-1 gap-16 items-center">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        {tags.length < 2 ? null : (
                                            <div className="flex flex-wrap gap-4 mb-4">
                                                <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    {tags[0]}
                                                </span>
                                                <span className="bg-red-100 text-signal-red px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                    {tags[1]}
                                                </span>
                                            </div>
                                        )}

                                        {item?.icon && (
                                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                                                <span
                                                    className="w-8 h-8 [&>svg]:!w-full [&>svg]:!h-full" // Bạn vẫn có thể ăn các class màu sắc của Tailwind ở đây
                                                    dangerouslySetInnerHTML={{ __html: item.icon }}
                                                />
                                            </div>
                                        )}
                                        <h2 className="font-headline-lg text-[32px] text-primary font-bold">
                                            {item.label}
                                        </h2>
                                        <p className="text-body-lg text-on-surface-variant">
                                            {item.description}
                                        </p>
                                        <ul className="space-y-4 my-8">
                                            {list.map(li => (
                                                <li className="flex items-center gap-3">
                                                    <CheckCircle className="text-primary w-5 h-5" />
                                                    <span className="font-semibold text-on-surface">
                                                        {li}
                                                    </span>
                                                </li>)
                                            )}
                                        </ul>
                                        {!item.price ? null : (
                                            <div className="text-3xl font-black text-signal-red">
                                                {formatCurrencyValue(item.price, currency.code, 3)}
                                                <span className="text-base font-normal text-on-surface-variant">
                                                    /{item.period}
                                                </span>
                                            </div>
                                        )}
                                        <button onClick={(e) => handlePageLink(e, null, item.button_link, navigate)} className="bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors shadow-md">
                                            {item.button}
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        <div className="w-full overflow-hidden rounded-2xl shadow-lg">
                                            <picture
                                                className="w-full h-auto rounded-2xl shadow-lg object-cover bg-gray-100">
                                                <source
                                                    srcSet={item.image?.srcSet} type="image/webp"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                                <img
                                                    width={768}
                                                    height={603}
                                                    alt={item.image?.alt}
                                                    src={item.image?.src}
                                                />
                                            </picture>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>
                    )
                }
                else {
                    return !item ? null : (
                        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop space-y-24">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={fadeInUp}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <picture
                                        className="w-full h-auto rounded-2xl shadow-lg object-cover bg-gray-100">
                                        <source
                                            srcSet={item.image?.srcSet} type="image/webp"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <img
                                            width={768}
                                            height={603}
                                            alt={item.image?.alt}
                                            src={item.image?.src}
                                        />
                                    </picture>
                                </div>
                                <div className="space-y-6">
                                    {item?.icon && (
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                                            <span
                                                className="w-8 h-8 [&>svg]:!w-full [&>svg]:!h-full"
                                                dangerouslySetInnerHTML={{ __html: item.icon }}
                                            />
                                        </div>
                                    )}

                                    <h3 className="font-headline-lg text-3xl font-bold text-primary">
                                        {item.label}
                                    </h3>
                                    <p className="text-on-surface-variant text-lg leading-relaxed">
                                        {item.description}
                                    </p>
                                    <div className="text-3xl font-black text-signal-red">
                                        {formatCurrencyValue(item.price, currency.code, 3)}
                                        <span className="text-base font-normal text-on-surface-variant">
                                            /{item.period}
                                        </span>
                                    </div>
                                    <button onClick={(e) => handlePageLink(e, null, item.button_link, navigate)} className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit mt-4">
                                        {item.button}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        </section>
                    )
                }
            })}
        </>
    );
}
