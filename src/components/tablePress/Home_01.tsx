import { useEffect, useRef, useState } from 'react';
import { Pages } from '@/entities/Pages';
import { formatCurrencyValue } from '@/lib/stringUtils/formatCurrencyValue';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';

interface home_01 {
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
                if (ref.current) observer.unobserve(ref.current); // Chỉ chạy 1 lần (once: true)
            }
        }, options);

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, [options]);

    return { ref, isInView };
}

export default function Home_01(props: home_01) {
    let language = props.page.lang;
    let data = props.data;

    // Call hooks ở đầu component
    const headerAnim = useInView({ rootMargin: '-100px' });
    const gridAnim = useInView({ rootMargin: '-50px' });

    if (!data || !data.items) return null;

    let currency = getCurrencyByKey('vi');

    // Class giả lập hiệu ứng fadeInUp ({ opacity: 0, y: 30 } -> { opacity: 1, y: 0 })
    const fadeInUpClass = (inView: boolean) =>
        `transition-all duration-600 ease-out transform ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
        }`;

    return (
        <section className="py-section-gap max-w-container-max mx-auto px-margin-desktop">
            {/* Header Section */}
            <div
                ref={headerAnim.ref}
                className={`text-center mb-12 ${fadeInUpClass(headerAnim.isInView)}`}
            >
                <h2 className="font-headline-lg text-4xl text-primary uppercase font-bold">
                    {data.title}
                </h2>
                <div className="h-1 w-16 bg-signal-red mx-auto mt-4 rounded-full" />
            </div>

            {/* Grid Items */}
            <div
                ref={gridAnim.ref}
                className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 ${fadeInUpClass(gridAnim.isInView)}`}
            >
                {data.items.map((service: any, index: number) => {
                    return (
                        <div
                            key={data.id + index}
                            className="bg-white p-6 rounded-xl border border-border-subtle text-center hover:shadow-lg transition-shadow group flex flex-col items-center"
                        >
                            {service.icon && (
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span
                                        className="w-8 h-8 [&>svg]:!w-full [&>svg]:!h-full"
                                        dangerouslySetInnerHTML={{ __html: service.icon }}
                                    />
                                </div>
                            )}

                            <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                            <p className="text-on-surface-variant mb-4 flex-grow">
                                {service.description}
                            </p>
                            <div className="mt-auto">
                                <div className="text-on-surface-variant">
                                    {data.fields?.[3]?.label}
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
            </div>
        </section>
    );
}