import { useEffect, useRef, useState } from 'react';
import { Pages } from '@/entities/Pages';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
import { chevronLeftSvg, chevronRightSvg } from '@/lib/icons';

interface home_05 {
    page: Pages;
    data: any;
}

// Hook IntersectionObserver mô phỏng mượt mà hiệu ứng whileInView
function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                if (ref.current) observer.unobserve(ref.current); // Chỉ kích hoạt 1 lần (once: true)
            }
        }, options);

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options]);

    return { ref, isInView };
}

export default function Home_05(props: home_05) {
    let language = props.page.lang;
    let data = props.data;

    const { ref, isInView } = useInView({ rootMargin: '-50px' });

    if (!data || !data?.items) return null;

    let currency = getCurrencyByKey('vi');

    return (
        <section className="bg-surface-container-low py-12 border-y border-border-subtle overflow-hidden">
            <div
                ref={ref}
                style={{
                    transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Custom bezier giúp chuyển động lướt rất êm
                }}
                className={`max-w-container-max mx-auto px-margin-desktop transition-all duration-700 transform ${
                    isInView
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-[30px]'
                }`}
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
                        aria-label={
                            language === 'vi' ? 'Đối tác trước' : 'Previous partners'
                        }
                    >
                        <span
                            className="w-6 h-6 [&>svg]:!w-full [&>svg]:!h-full"
                            dangerouslySetInnerHTML={{
                                __html: chevronLeftSvg,
                            }}
                        />
                    </button>
                    <div className="flex flex-wrap justify-center gap-12">
                        {data.items?.map((item: any, index: number) => (
                            <picture
                                key={item?.id || index}
                                className="h-20 w-auto object-contain"
                            >
                                <source
                                    srcSet={item.image?.srcSet}
                                    type="image/webp"
                                    sizes="(max-width: 640px) 100vw, 400px"
                                />
                                <img
                                    className="h-20 w-auto object-contain"
                                    height={80}
                                    alt={item.label || 'Partner logo'}
                                    src={item.image?.src}
                                />
                            </picture>
                        ))}
                    </div>
                    <button
                        className="opacity-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border-subtle text-on-surface-variant hover:text-primary"
                        aria-label={
                            language === 'vi'
                                ? 'Đối tác tiếp theo'
                                : 'Next partners'
                        }
                    >
                        <span
                            className="w-6 h-6 [&>svg]:!w-full [&>svg]:!h-full"
                            dangerouslySetInnerHTML={{
                                __html: chevronRightSvg,
                            }}
                        />
                    </button>
                </div>
            </div>
        </section>
    );
}