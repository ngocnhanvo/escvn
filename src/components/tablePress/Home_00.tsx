import { useState, useRef } from 'react';
import { AppRouterProps, Pages, tablePress } from '@/entities';
import { Search } from '@/lib/effects';
import { formatCurrencyValue, getCurrencyByKey } from '@/lib/stringUtils';
import { handlePageLink } from '../PageTransition';
import { useNavigate } from 'react-router-dom';
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
                        {data.items[0].title1} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{data.items[0].title2}</span>
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
                <div className="hidden md:flex justify-end z-10 relative mr-[10%]"
                >
                    {/* Flying lights around mascot */}
                    <div className="absolute top-[25%] left-[35%] w-3 h-3 bg-yellow-400 rounded-full blur-[1px] shadow-[0_0_5px_#facc15] animate-float-sparkle" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-[45%] right-[5%] w-2 h-2 bg-blue-400 rounded-full blur-[1px] shadow-[0_0_5px_#60a5fa] animate-float-sparkle" style={{ animationDuration: '6s', animationDelay: '1s' }} />
                    <div className="absolute bottom-[35%] left-[37%] w-4 h-4 bg-indigo-400 rounded-full blur-[1px] shadow-[0_0_5px_#818cf8] animate-float-sparkle" style={{ animationDuration: '8s', animationDelay: '2s' }} />
                    <div className="absolute top-[0%] right-[40%] w-2 h-2 bg-red-400 rounded-full blur-[1px] shadow-[0_0_5px_#ef4444] animate-float-sparkle" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
                    <picture className="max-w-[400px] h-auto object-contain animate-float relative z-10">
                        <source
                            srcSet={data.items[0]?.image?.srcSet} type="image/webp"
                            sizes="251px"
                        />
                        <img
                            width={251}
                            height={300}
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                            alt={data.items[0]?.image?.alt}
                            src={data.items[0]?.image?.src}
                        />
                    </picture>
                </div>
            </div>
        </section>
    );
}
