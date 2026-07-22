import { Pages } from "@/entities/Pages";
import { useEffect, useRef, useState } from "react";
import { Link, NavigateFunction } from "react-router-dom";
import { handlePageLink } from "../PageTransition/handlePageLink";
import { chevronDownSvg, chevronRightSvg, xSvg } from "@/lib/icons";

interface DesktopProps {
    navItems: Pages[];
    navigate: NavigateFunction;
    isActive: (page: Pages) => boolean;
}

export const Desktop = (props: DesktopProps) => {
    const menuRef = useRef<HTMLElement>(null);
    const navItems = props.navItems;
    const navigate = props.navigate;
    const isActive = props.isActive;

    const gridColsMap: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4"
    };

    const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMegaMenu(null);
            }
        };

        if (activeMegaMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMegaMenu]);

    {/* TÍCH HỢP CLASS: ẩn mặc định ở mobile, chỉ flex khi màn hình >= 800px (mn-mb) */ }
    return <nav ref={menuRef} className="hidden mn-mb:flex items-center text-sm font-bold h-full">
        {navItems.map((item: Pages) => {
            const hasMega = item.mega && item.mega.length > 0;
            const isOpen = activeMegaMenu === item.slug;
            const totalCols = item.megaHeader?.length || 3;
            const gridClass = gridColsMap[totalCols] || "grid-cols-3";

            return (
                <div
                    key={item.slug}
                    className={`h-full px-3 flex items-center ${hasMega ? 'group' : ''}`}
                >
                    <Link
                        className={`text-base py-4 text-center font-paragraph transition-colors duration-200 relative z-10 cursor-pointer flex items-center gap-1 ${isActive(item) || isOpen
                            ? "text-signal-red"
                            : "text-primary hover:text-signal-red group-hover:text-signal-red"
                            }`}
                        onClick={(e) => {
                            if (hasMega && activeMegaMenu !== item.slug) {
                                e.preventDefault();
                                setActiveMegaMenu(item.slug);
                            } else {
                                handlePageLink(e, item, `/${item.slug}`, navigate);
                                setActiveMegaMenu(null);
                            }
                        }}
                        to={`/${item.slug}`}
                    >
                        {item.label}
                        {hasMega &&
                            <span
                                className={`w-[14px] h-[14px] [&>svg]:!w-full [&>svg]:!h-full transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: chevronDownSvg,
                                }}
                            />
                        }
                    </Link>

                    {hasMega && (
                        <div className={`absolute top-[80%] left-0 w-full pt-2 z-[100] ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                            }`}>
                            <div className={`bg-white border border-border-subtle shadow-2xl rounded-b-2xl p-8 grid ${gridClass} gap-6 overflow-y-auto max-h-[calc(100vh-100px)] relative custom-scrollbar`}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveMegaMenu(null);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-primary text-white shadow-lg hover:bg-signal-red hover:scale-110 rounded-full z-50 flex items-center justify-center group/close"
                                    title="Đóng menu"
                                >
                                    <span
                                        className={`w-[20px] h-[20px] [&>svg]:!w-full [&>svg]:!h-full [&>svg]:[stroke-width:3] transition-transform group-hover/close:rotate-90`}
                                        dangerouslySetInnerHTML={{
                                            __html: xSvg,
                                        }}
                                    />
                                </button>
                                {item.megaHeader.map((header: any, colIndex: number) => (
                                    <div key={colIndex} className="flex flex-col gap-4">
                                        {header.text && (
                                            <h3 className="text-lg font-bold text-primary mb-2">{header.text}</h3>
                                        )}
                                        {header.img && (
                                            <img
                                                srcSet={`data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7 1w, ${header.img} 1024w`}
                                                src={header.img}
                                                alt={header.text || "Mega menu image"}
                                                className="mb-2 object-contain"
                                                sizes="(max-width: 767px) 1px, 1024px"
                                                loading="lazy"
                                            />
                                        )}
                                        {item.mega
                                            .filter((sub: Pages) => parseInt(sub.position) === colIndex)
                                            .map((sub: Pages) => {
                                                const isSubActive = isActive(sub);
                                                return (
                                                    <Link
                                                        key={sub.slug}
                                                        className={`group/sub p-4 rounded-xl transition-all flex flex-col gap-2 border text-left ${isSubActive
                                                            ? "bg-slate-50 border-border-subtle shadow-sm"
                                                            : "hover:bg-slate-50 border-transparent hover:border-border-subtle"
                                                            }`}
                                                        onClick={(e) => {
                                                            handlePageLink(e, sub, `/${sub.slug}`, navigate);
                                                            setActiveMegaMenu(null);
                                                        }}
                                                        to={`/${sub.slug}`}
                                                    >
                                                        <div className={`font-bold transition-colors flex items-center justify-between ${isSubActive ? "text-signal-red" : "text-primary group-hover/sub:text-signal-red"
                                                            }`}>
                                                            <span className="text-lg">{sub.label}</span>
                                                            <span
                                                                className={`w-[16px] h-[16px] [&>svg]:!w-full [&>svg]:!h-full transition-all ${isSubActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover/sub:opacity-100 group-hover/sub:translate-x-0"}`}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: chevronRightSvg,
                                                                }}
                                                            />
                                                        </div>
                                                        {sub.description && (
                                                            <p className="text-sm text-on-surface-variant line-clamp-2 font-normal leading-relaxed opacity-80">
                                                                {sub.description}
                                                            </p>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
    </nav>
}