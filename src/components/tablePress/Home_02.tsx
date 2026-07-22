import { useEffect, useRef, useState } from 'react';
import { Pages } from '@/entities/Pages';
import { formatCurrencyValue } from '@/lib/stringUtils/formatCurrencyValue';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
import { chevronRightSvg, checkCircleSvg } from '@/lib/icons';
import { handlePageLink } from '../PageTransition';
import { useNavigate } from 'react-router-dom';

interface home_02 {
    page: Pages;
    data: any;
}

// Sub-component riêng xử lý Observer chuẩn mượt như Home_04
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (ref.current) observer.unobserve(ref.current); // Animation chỉ kích hoạt 1 lần
                }
            },
            { rootMargin: '-100px' }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{
                transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Cubic-bezier mượt chuẩn Framer Motion
            }}
            className={`transition-all duration-700 transform ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function Home_02(props: home_02) {
    let language = props.page.lang;
    let data = props.data;
    if (!data || !data.items) return null;

    let currency = getCurrencyByKey('vi');
    const navigate = useNavigate();

    return (
        <>
            {data.items.map((item: any, index: number) => {
                if (!item) return null;

                const tags = item?.tags?.trim().split('\n').filter((i: string) => i.trim() !== '') ?? [];
                const list = item?.list?.trim().split('\n').filter((i: string) => i.trim() !== '') ?? [];

                const imageOrder = index % 2 === 0
                    ? "order-1 lg:order-2"
                    : "order-1";

                const contentOrder = index % 2 === 0
                    ? "order-2 lg:order-1"
                    : "order-2";

                return (
                    <section
                        key={item?.id || index}
                        className={`${index % 2 === 0 ? "bg-surface-container-low" : ""} py-section-gap`}
                    >
                        <AnimatedSection className="max-w-container-max mx-auto px-margin-desktop">
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
                                            alt={item.image?.alt || 'Section Image'}
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
                                        <div className="hidden md:flex w-16 h-16 bg-blue-50 rounded-2xl items-center justify-center text-primary">
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
                                            {list.map((li: string, i: number) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span
                                                        className="w-5 h-5 text-primary [&>svg]:!w-full [&>svg]:!h-full flex-shrink-0"
                                                        dangerouslySetInnerHTML={{
                                                            __html: checkCircleSvg,
                                                        }}
                                                    />
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

                                    {item.button && (
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
                                            <span
                                                className="w-5 h-5 [&>svg]:!w-full [&>svg]:!h-full"
                                                dangerouslySetInnerHTML={{
                                                    __html: chevronRightSvg,
                                                }}
                                            />
                                        </button>
                                    )}

                                </div>
                            </div>
                        </AnimatedSection>
                    </section>
                );
            })}
        </>
    );
}