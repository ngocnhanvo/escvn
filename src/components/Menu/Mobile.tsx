import { Pages } from "@/entities/Pages";
import { useState } from "react";
import { Link, NavigateFunction } from "react-router-dom";
import { handlePageLink } from "../PageTransition/handlePageLink";
import { DynamicIcon } from "@/lib/effects/icons";
import { AppRouterProps } from "@/entities/AppRouterProps";

interface Mobile {
    navItems: Pages[];
    navigate: NavigateFunction;
    isActive: (page: Pages) => boolean;
    setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    language: string;
    link_about: string;
    link_member: string;
    mobileMenuOpen: boolean;
    getTranslation: (key:string, language: string, props?: AppRouterProps) => string;
}
export const Mobile = (props: Mobile) => {
    const isActive = props.isActive;
    const navItems = props.navItems;
    const mobileMenuOpen = props.mobileMenuOpen;
    const setMobileMenuOpen = props.setMobileMenuOpen;
    const navigate = props.navigate;
    const language = props.language;
    const link_about = props.link_about;
    const link_member = props.link_member;
    const getTranslation = props.getTranslation;
    const [activeMobileMegaMenu, setActiveMobileMegaMenu] = useState<string | null>(null);
    return <div className={`absolute top-full left-0 w-full bg-white border-t border-border-subtle shadow-2xl transition-all duration-300 ease-in-out z-[60] ${mobileMenuOpen ? 'max-h-[90vh] opacity-100 visible' : 'max-h-0 opacity-0 invisible overflow-hidden'}`}>
        <nav className="flex flex-col p-4 max-h-[90vh] overflow-y-auto">
            {navItems.map((item: any) => {
                const hasMega = item.mega && item.mega.length > 0;
                const isMobileMegaOpen = activeMobileMegaMenu === item.slug;
                const isCurrentActive = isActive(item);

                return (
                    <div key={item.slug} className="border-b border-gray-50 last:border-none">
                        {hasMega ? (
                            <>
                                <button
                                    className={`flex items-center justify-between w-full py-4 px-4 text-sm font-bold uppercase transition-colors ${isMobileMegaOpen || isCurrentActive ? 'text-signal-red' : 'text-primary hover:text-signal-red'}`}
                                    onClick={() => setActiveMobileMegaMenu(isMobileMegaOpen ? null : item.slug)}
                                >
                                    {item.label}
                                    <DynamicIcon name='ChevronDown' size={14} className={`transition-transform ${isMobileMegaOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isMobileMegaOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="flex flex-col pl-8 pb-4 bg-slate-50/50">
                                        {item.mega.map((subItem: any) => (
                                            <Link
                                                key={subItem.slug}
                                                className={`py-3 text-sm font-medium transition-colors ${isActive(subItem) ? 'text-signal-red' : 'text-on-surface-variant hover:text-signal-red'}`}
                                                onClick={(e) => {
                                                    setMobileMenuOpen(false);
                                                    setActiveMobileMegaMenu(null); // Close mobile mega menu as well
                                                    handlePageLink(e, `/${subItem.slug}`, navigate);
                                                }}
                                                to={`/${subItem.slug}`}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link
                                className={`flex items-center justify-between w-full py-4 px-4 text-sm font-bold uppercase transition-colors ${isCurrentActive ? 'text-signal-red' : 'text-primary hover:text-signal-red'
                                    }`}
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    handlePageLink(e, `/${item.slug}`, navigate);
                                }}
                                to={`/${item.slug}`}
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
            {/* Bổ sung các link phụ ở topbar vào menu mobile */}
            <div className="flex flex-col border-t border-border-subtle mt-2 pt-2">
                <Link
                    to={link_about}
                    className="py-4 px-4 text-sm font-bold text-on-surface-variant uppercase"
                    onClick={(e) => { setMobileMenuOpen(false); handlePageLink(e, link_about, navigate); }}>
                    {getTranslation('header.top.about', language)}
                </Link>
                <Link
                    to={link_member}
                    className="py-4 px-4 text-sm font-bold text-on-surface-variant uppercase"
                    onClick={(e) => { setMobileMenuOpen(false); handlePageLink(e, link_member, navigate); }}>
                    {getTranslation('header.top.members', language)}
                </Link>
            </div>
        </nav>
    </div>
}