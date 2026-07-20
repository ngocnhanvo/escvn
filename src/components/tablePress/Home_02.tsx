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
                if (!item) return null;

                const tags = item?.tags?.trim().split('\n').filter(i => i.trim() !== '') ?? [];
                const list = item?.list?.trim().split('\n').filter(i => i.trim() !== '') ?? [];

                const imageOrder = index % 2 === 0
                    ? "order-1 lg:order-2"
                    : "order-1";

                const contentOrder = index % 2 === 0
                    ? "order-2 lg:order-1"
                    : "order-2";

                return (
                    <section
                        key={index}
                        className={`${index % 2 === 0
                            ? "bg-surface-container-low"
                            : ""
                            } py-section-gap`}
                    >
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="max-w-container-max mx-auto px-margin-desktop"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                                {/* Image */}
                                <div className={imageOrder}>
                                    <picture className="w-full h-auto rounded-2xl shadow-lg object-cover bg-gray-100">
                                        <source
                                            srcSet={item.image?.srcSet}
                                            type="image/webp"
                                            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                                        />
                                        <img
                                            width={768}
                                            height={603}
                                            src={item.image?.src}
                                            alt={item.image?.alt}
                                        />
                                    </picture>
                                </div>

                                {/* Content */}
                                <div className={`${contentOrder} space-y-6`}>

                                    {tags.length >= 2 && (
                                        <div className="flex flex-wrap gap-4">
                                            <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {tags[0]}
                                            </span>

                                            <span className="bg-red-100 text-signal-red px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {tags[1]}
                                            </span>
                                        </div>
                                    )}

                                    {item.icon && (
                                        <div className="hidden md:flex w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                                            <span
                                                className="w-8 h-8 [&>svg]:!w-full [&>svg]:!h-full"
                                                dangerouslySetInnerHTML={{
                                                    __html: item.icon,
                                                }}
                                            />
                                        </div>
                                    )}

                                    <h2 className="font-headline-lg text-[32px] text-primary font-bold">
                                        {item.label}
                                    </h2>

                                    <p className="text-on-surface-variant text-lg leading-relaxed">
                                        {item.description}
                                    </p>

                                    {list.length > 0 && (
                                        <ul className="space-y-4">
                                            {list.map((li, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-3"
                                                >
                                                    <CheckCircle className="text-primary w-5 h-5" />
                                                    <span className="font-semibold text-on-surface">
                                                        {li}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {item.price && (
                                        <div className="text-3xl font-black text-signal-red">
                                            {formatCurrencyValue(item.price, currency.code, 3)}
                                            <span className="text-base font-normal text-on-surface-variant">
                                                /{item.period}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) =>
                                            handlePageLink(
                                                e,
                                                null,
                                                item.button_link,
                                                navigate
                                            )
                                        }
                                        className="bg-primary text-white text-xl font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-95 flex items-center gap-2 w-fit"
                                    >
                                        {item.button}
                                        <ChevronRight size={18} />
                                    </button>

                                </div>
                            </div>
                        </motion.div>
                    </section>
                );
            })}
        </>
    );
}
