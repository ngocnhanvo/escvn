import { useState, useRef, useEffect, useMemo } from 'react';
import { AppRouterProps, Pages, tablePress } from '@/entities';
import { Search } from '@/lib/effects';
import { formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
import { handlePageLink } from '../PageTransition';
import { useNavigate } from 'react-router-dom';
import { scale } from 'framer-motion';
interface home_00 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
}
export default function Home_00(props: home_00) {
    let language = props.page.lang;
    let data = props.data;
    if (!data)
        return null;
    let currency = getCurrencyByKey('vi');
    const heroRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const checkdomain = props.props?.pages?.find((a: Pages) => a.key === 'checkdomain' && a.lang === language);
    const handleSearch = (e) => {
        handlePageLink(e, `/${checkdomain?.slug}?id=${searchValue}`, navigate);
    };
    return (
        <section
            ref={heroRef}
            className="relative py-20"
            style={{
                backgroundColor: "#f7f9fb", // Base background color
                position: "relative",
                overflow: "hidden",
                // Interactive radial gradient for spotlight effect
                backgroundImage: `radial-gradient(circle 250px at 0px 0px, rgba(255, 255, 255, 0.6) 0%, transparent 100%)`,
                backgroundBlendMode: 'soft-light', // Makes the mirror effect more pronounced
            }}
        >
            {/* Animated Background Blobs */}
            <div className="absolute hidden md:block top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/25 rounded-full blur-[80px] animate-blob" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-400/40 rounded-full blur-[70px] animate-blob animation-delay-2000" />
            <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-indigo-400/35 rounded-full blur-[60px] animate-blob animation-delay-4000" />

            <div
                className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(rgb(0, 55, 122) 0.5px, transparent 0.5px)",
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-[55%_45%] gap-12 items-center">
                <div className="space-y-8 z-10">
                    <h1 className="font-headline-xl text-[48px] leading-[56px] text-primary uppercase font-extrabold tracking-tight">
                        {data.items[0].title1} <br /><span className="text-transparent bg-clip-text [-webkit-background-clip:text] bg-gradient-to-r from-primary to-blue-600">{data.items[0].title2}</span>
                    </h1>
                    <p className="text-lg italic text-on-surface-variant font-medium">
                        {data.description}
                    </p>
                    {/* Domain Search */}
                    <div // Add focus-within for visual feedback
                        className="p-2 rounded-2xl flex shadow-lg max-w-[600px] border border-border-subtle"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(12px)"
                        }}
                    >
                        <input
                            className="flex-grow px-4 py-3 text-on-surface bg-transparent border-none focus:ring-0 text-base outline-none"
                            placeholder={data.items[0].input} // Add focus-within for visual feedback
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(e); // Gọi hàm xử lý tìm kiếm của bạn tại đây
                                }
                            }}
                        />
                        <button
                            disabled={!searchValue.trim()}
                            onClick={(e) => {
                                handleSearch(e);
                            }}
                            className="bg-primary text-white px-4 md:px-6 py-3 font-bold rounded-2xl hover:bg-blue-900 transition-all flex items-center gap-2 shadow-md z-10 active:scale-95"
                        >
                            {data.items[0].btn}
                            <Search size={20} />
                        </button>
                    </div>
                    {/* Pricing Marquee */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {data.items.map((item, index) => (
                            <div
                                key={index}
                                className={`bg-white px-4 py-4 border border-border-subtle text-center transition-all rounded-2xl`}
                            >
                                <span className="text-primary font-bold text-lg">{item.domain}</span>
                                <span className="text-signal-red font-bold text-lg ml-2">{formatCurrencyValue(item.price, currency.code, 3)}</span>
                                {item.subprice?.length > 0 && (
                                    <span className="text-[10px] pl-1 md:text-xs text-slate-500 italic">{item.subprice}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hidden md:flex justify-end z-10 relative mr-[12%]">
                    <div className="absolute inset-0 -z-10">
                        <div
                            className="
                                absolute
                                left-1/2
                                top-1/2
                                -translate-x-1/2
                                -translate-y-1/2
                                w-[90%]
                                h-[90%]
                                rounded-full
                                bg-cyan-400/20
                                blur-3xl
                                animate-pulse
                                "
                        />
                    </div>

                    <div className="z-10 max-w-[586px] h-auto object-contain animate-float relative">
                        <picture>
                            {/* 1. Dành cho Mobile: Trình duyệt sẽ tải 1 pixel trong suốt siêu nhẹ thay vì ảnh gốc */}
                            <source
                                media="(max-width: 767px)"
                                srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                            />
                            {/* 2. Dành cho Tablet/Desktop: Chạy bình thường */}
                            <source
                                srcSet={data.items[0]?.image?.srcSet} type="image/webp"
                                sizes="586px"
                                media="(min-width: 768px)"
                            />
                            <img
                                className="drop-shadow-[0_0_25px_rgba(56,189,248,.6)]"
                                width={586}
                                height={391}
                                fetchPriority="high"
                                loading="eager"
                                decoding="async"
                                alt={data.items[0]?.image?.alt}
                                src={data.items[0]?.image?.src}
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </section>
    );
}

export const ElectricAura = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                preserveAspectRatio="none"
            >
                <path
                    d="M200 60 L180 95 L210 120 L175 155 L220 190"
                    className="stroke-cyan-300 animate-electric"
                    strokeWidth="3"
                    fill="none"
                />

                <path
                    d="M310 120 L280 150 L315 175 L275 205 L305 240"
                    className="stroke-cyan-300 animate-electric"
                    strokeWidth="2"
                    fill="none"
                    style={{ animationDelay: ".2s" }}
                />

                <path
                    d="M120 100 L150 130 L110 170 L145 200 L115 240"
                    className="stroke-cyan-300 animate-electric"
                    strokeWidth="2"
                    fill="none"
                    style={{ animationDelay: ".5s" }}
                />

                <path
                    d="M180 240 L210 270 L170 300 L220 330"
                    className="stroke-cyan-300 animate-electric"
                    strokeWidth="3"
                    fill="none"
                    style={{ animationDelay: ".8s" }}
                />
            </svg>

            <div className="absolute inset-0 rounded-full bg-cyan-300/10 blur-2xl animate-pulse" />
        </div>
    );
}