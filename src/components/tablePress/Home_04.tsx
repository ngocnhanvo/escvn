import { useEffect, useRef, useState } from 'react';
import { Pages } from '@/entities/Pages';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';

interface home_04 {
    page: Pages;
    data: any;
}

// Custom hook IntersectionObserver mô phỏng mượt mà hiệu ứng whileInView
function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                if (ref.current) observer.unobserve(ref.current); // Chỉ chạy 1 lần (once: true)
            }
        }, options);

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options]);

    return { ref, isInView };
}

export default function Home_04(props: home_04) {
    let language = props.page.lang;
    let data = props.data;

    const { ref, isInView } = useInView({ rootMargin: '-100px' });

    if (!data || !data?.items) return null;

    let currency = getCurrencyByKey('vi');
    let image = data?.items[0]?.image;

    return (
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
            <div
                ref={ref}
                style={{
                    transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Cubic bezier chuẩn giúp chuyển động siêu mượt
                }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center transition-all duration-700 transform ${
                    isInView
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-[30px]'
                }`}
            >
                <div className="lg:col-span-5">
                    <picture className="w-full h-auto rounded-3xl shadow-2xl">
                        <source
                            srcSet={image?.srcSet}
                            type="image/webp"
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
                        {data.items?.map((item: any, index: number) => {
                            let list = item?.list
                                ?.trim()
                                .split('\n')
                                .filter((i: string) => i.trim() !== '') ?? [];

                            return (
                                <div key={item?.id || index} className="space-y-3">
                                    {item?.icon && (
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                                            <span
                                                className="w-6 h-6 text-primary [&>svg]:w-full [&>svg]:h-full"
                                                dangerouslySetInnerHTML={{ __html: item.icon }}
                                            />
                                        </div>
                                    )}
                                    <h3 className="font-bold text-xl">{item?.label}</h3>
                                    <ul className="space-y-2 text-md text-on-surface-variant">
                                        {list.map((li: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                {li}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}