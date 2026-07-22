import { useEffect, useRef, useState } from 'react';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { useLanguage } from '@/context/LanguageContext';
import { returnCurrentPage } from '@/context/LanguageContext/returnCurrentPage';
import { awardSvg, mapPinSvg } from '@/lib/icons';

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

export default function FooterSection(props: AppRouterProps) {
    const { language } = useLanguage();
    const page = returnCurrentPage(props, language);
    let data = page?.tablePress?.find(
        (a) => a.shortcode === `pub_footer_01_${page.lang}`
    );

    const { ref, isInView } = useInView({ rootMargin: '-50px' });

    if (!data || !data?.json) return null;

    let dataMain = data.json;
    let image = dataMain?.items?.[0]?.image;
    let label = dataMain?.items?.[0]?.label;

    return (
        <section className="bg-white py-16 border-b border-border-subtle [content-visibility:auto] [contain-intrinsic-size:0_500px]">
            <div
                ref={ref}
                className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-12"
            >
                {/* Cột 1: Logo & Giới thiệu */}
                <div
                    style={{
                        transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
                        transitionDelay: '0ms', // Hiện đầu tiên
                    }}
                    className={`space-y-4 transition-all duration-700 transform ${
                        isInView
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-[30px]'
                    }`}
                >
                    {image && (
                        <picture className="relative z-10 w-full h-full">
                            <source
                                srcSet={image.srcSet}
                                type="image/webp"
                                sizes="400px"
                            />
                            <img
                                width={150}
                                height={80}
                                alt={image.alt || 'Footer Logo'}
                                src={image.src}
                            />
                        </picture>
                    )}
                    <p className="text-md text-on-surface-variant leading-relaxed">
                        {label}
                    </p>
                </div>

                {/* Các cột Văn phòng (với hiệu ứng staggerChildren qua transitionDelay) */}
                {dataMain.items?.map((item: any, index: number) => (
                    <div
                        key={item?.id || index}
                        style={{
                            transitionTimingFunction: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
                            transitionDelay: `${(index + 1) * 100}ms`, // Giống staggerChildren: 0.1s
                        }}
                        className={`space-y-4 transition-all duration-700 transform ${
                            isInView
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-[30px]'
                        }`}
                    >
                        <h3 className="font-bold text-primary text-lg flex items-center gap-2">
                            <span
                                className="text-signal-red w-5 h-5 [&>svg]:!w-full [&>svg]:!h-full"
                                dangerouslySetInnerHTML={{
                                    __html: mapPinSvg,
                                }}
                            />
                            {item.office}
                        </h3>
                        <p className="text-md text-on-surface-variant leading-relaxed">
                            {item.address}
                            <br />
                            {item.tel}
                            <br />
                            {item.email}
                        </p>
                        <a
                            className="text-primary text-md font-semibold hover:underline flex items-center gap-1"
                            href={item.map}
                            target="mapESC"
                            rel="noopener noreferrer"
                        >
                            <span
                                className="w-5 h-5 [&>svg]:!w-full [&>svg]:!h-full"
                                dangerouslySetInnerHTML={{
                                    __html: awardSvg,
                                }}
                            />{' '}
                            {item.btn}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}