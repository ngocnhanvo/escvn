import { AppRouterProps } from '@/entities/AppRouterProps';
import React from 'react';
import { Pages } from '@/entities/Pages';
import { useNavigate } from 'react-router-dom';
import { Products } from '@/entities/Products';

interface TabProps {
    id: string;
    label: string | React.ReactNode;
    isActive: boolean;
    onClick: (id: string) => void;
    imgSrc: string;
    imgAlt: string;
}

const Tab: React.FC<TabProps> = ({ id, label, isActive, onClick, imgSrc, imgAlt }) => (
    <button
        id={id}
        onClick={() => onClick(id)}
        className={`flex-1 min-w-[240px] max-w-[380px] p-5 bg-white border rounded-2xl text-center transition-all duration-300
            ${isActive
                ? 'border-2 border-primary text-primary shadow-lg shadow-primary/10 transform scale-[1.02]'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'}`}
        aria-selected={isActive}
        role="tab"
    >
        <img
            decoding="async"
            className="block mx-auto h-[140px] w-auto object-contain"
            alt={imgAlt}
            src={imgSrc}
        />
        <div className="text-sm md:text-base font-bold leading-snug">{label}</div>
    </button>
);

interface Domainfree_00 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setTLD?: (a: Products) => void;
    item?: any;
}

export default function Checkdomain_00(props: Domainfree_00) {
    const language = props.page.lang;
    const data = props.data;
    const navigate = useNavigate();
    const setTLD = props.setTLD;
    let sel = props.item;
    if (!data) return null;
    const domainItems = data.items;
    if (!sel?.tld)
        sel = domainItems?.[0];
    const currentActiveItem = domainItems.find(item => item.tld === sel.tld)

    return (
        <>
            {/* Section Tabs */}
            <section className="py-8 bg-white border-b border-gray-100">
                <div className="container mx-auto px-4">
                    {/* Vòng lặp map qua các item dữ liệu để render ra Tab */}
                    <div className="w-full flex flex-wrap justify-center gap-8 mb-8" role="tablist">
                        {domainItems?.map((item) => (
                            <Tab
                                key={item.tld}
                                id={`tab-${item.tld}`}
                                label={
                                    <span className="whitespace-pre-line block">
                                        {item.dieukiendangky}
                                    </span>
                                }
                                isActive={sel.tld === item.tld}
                                onClick={() => setTLD?.(item)}
                                imgSrc={item.image?.src}
                                imgAlt={item.image?.alt}
                            />
                        ))}
                    </div>

                    {/* Nút đăng ký động theo tab đang active */}
                    <div className="text-center">
                        <a
                            className="inline-block px-10 py-3.5 bg-red-500 text-white font-bold text-base rounded-full shadow-md shadow-red-200 transition-all hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5"
                            href={currentActiveItem?.link}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {/* Hiển thị chữ "Đăng ký .id.vn" hoặc "Đăng ký .biz.vn" động từ data */}
                            {currentActiveItem?.nutdangky} .{currentActiveItem?.tld}
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}