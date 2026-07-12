import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { handlePageLink } from '../PageTransition/handlePageLink';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Search from 'lucide-react/dist/esm/icons/search';
import { formatCurrencyValue } from '@/lib/stringUtils/formatCurrencyValue';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';

interface Domainregister_00 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

let pageCheckDomain: Pages;
export default function Domainregister_00(props: Domainregister_00) {
    const data = props.data;
    const tld = props.tld;
    let language = props.page.lang;
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!data || !data.items) return null;

    if (!pageCheckDomain)
        pageCheckDomain = props.props?.pages?.find((a: Pages) => a.key === 'checkdomain' && a.lang === language);

    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState("");
    const handleSearch = (e) => {
        handlePageLink(e, pageCheckDomain, `/${pageCheckDomain?.slug}?id=${searchValue}`, navigate);
    };

    const first = data.items?.[0];
    let currency = getCurrencyByKey('vi');
    
    return (
        <>
            <section className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-red-500 mb-10">
                        {data.title}
                    </h2>
                    {/* Domain Search */}
                    <div // Add focus-within for visual feedback
                        className="p-2 rounded-2xl flex mx-auto shadow-lg max-w-[600px] border border-border-subtle"
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(12px)"
                        }}
                    >
                        <input
                            className="flex-grow px-4 py-3 text-on-surface bg-transparent border-none focus:ring-0 text-base outline-none"
                            placeholder={first?.input} // Add focus-within for visual feedback
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
                            <span className='hidden md:block'>{first?.btn}</span>
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Pricing Marquee */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {first?.items?.map((item, index) => (
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
            </section>
        </>
    );
}