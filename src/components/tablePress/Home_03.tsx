import { useEffect, useRef, useState } from 'react';
import { Pages } from '@/entities/Pages';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';

interface home_03 {
    page: Pages;
    data: any;
}

// Hook nhỏ gọn thay thế cho whileInView của framer-motion
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

export default function Home_03(props: home_03) {
    let language = props.page.lang;
    let data = props.data;
    
    // Gọi hook ở đầu component
    const { ref, isInView } = useInView({ rootMargin: '-100px' });

    if (!data || !data.items) return null;

    let currency = getCurrencyByKey('vi');

    return (
        <section className="bg-surface-container-low py-section-gap">
            <div
                ref={ref}
                className={`max-w-container-max mx-auto px-margin-desktop transition-all duration-600 ease-out transform ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
                }`}
            >
                <div className="text-center mb-16">
                    <h2 className="font-headline-lg text-4xl text-primary uppercase font-bold">
                        {data.title}
                    </h2>
                    <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {data.items.map((item: any, index: number) => {
                        return (
                            <div 
                                key={item.id || index}
                                className="bg-white p-8 rounded-2xl text-center border border-border-subtle shadow-sm flex flex-col items-center"
                            >
                                {item?.icon && (
                                    <span
                                        className="w-12 h-12 text-primary mb-4 [&>svg]:!w-full [&>svg]:!h-full"
                                        dangerouslySetInnerHTML={{ __html: item.icon }}
                                    />
                                )}
                                <h3 className="font-bold text-lg">{item?.label}</h3>
                                <p className="text-md text-on-surface-variant mt-2">
                                    {item?.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}