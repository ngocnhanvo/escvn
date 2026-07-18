import { useState, useEffect, useRef } from 'react';
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { Products } from '@/entities/Products';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
import { formatCurrency } from '@/lib/stringUtils/formatCurrency';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTranslation } from '@/lib/i18n/getTranslation';
import { useCart } from '@/integrations/cms/cms-ecom/cart/useCartStore';
import Search from 'lucide-react/dist/esm/icons/search';
import { mapProducts } from '@/lib/wordpress/products/mapProducts';
import { initI18n } from '@/context/LanguageContext/getNameLang';
interface Checkdomain_00 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    handleWhois?: (a: string, b: boolean) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
}

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export default function Checkdomain_00(props: Checkdomain_00) {
    let language = props.page.lang;
    let data = props.data;
    if (!data)
        return null;
    let currency = getCurrencyByKey('vi');
    const contentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchName, setSearchName] = useState('');
    const idFromUrl = searchParams.get('id');

    const VN_DOMAINS = data.items.filter((item: any) => item?.tld && item?.tld?.endsWith('.vn')) || [];
    const INTL_DOMAINS = data.items.filter((item: any) => item?.tld && !item?.tld?.endsWith('.vn')) || [];
    const handleWhois = props.handleWhois || (() => { });
    const inputRef = props.inputRef || useRef<HTMLInputElement>(null);
    const allSupportedDomains = [...VN_DOMAINS, ...INTL_DOMAINS];
    const handleSearch = (newName: string) => {
        const cleanInput = newName.replaceAll(' ', '').replace(/^(https?:\/\/)?(www\.)?/, '');


        const sortedDomains = [...allSupportedDomains].sort((a, b) => b.tld.length - a.tld.length);

        // Kiểm tra nếu người dùng có nhập đuôi (có chứa dấu chấm)
        if (cleanInput.includes('.')) {
            const foundDomain = sortedDomains.find(d => cleanInput.endsWith(d.tld));

            if (foundDomain) {
                const domainName = cleanInput.substring(0, cleanInput.length - foundDomain.tld.length);

                // Tên miền không được chứa dấu chấm ở phần tên (ví dụ: test.abc.com)
                if (domainName.includes('.')) {
                    const mess = getTranslation("checkdomain.tenmienKhongHopLe", language);
                    handleWhois(mess, true);
                    return;
                }

                setSearchName(domainName);
                setSearchParams({ id: cleanInput });
            } else {
                // Có dấu chấm nhưng không khớp TLD nào trong danh sách -> Báo lỗi
                const mess = getTranslation("checkdomain.tenmienKhongHopLe", language);
                handleWhois(mess, true);
                return;
            }
        } else {
            // Không có dấu chấm -> chỉ là tên, không cần kiểm tra đuôi
            setSearchName(cleanInput);
            setSearchParams({ id: cleanInput });
        }
    };

    useEffect(() => {
        if (idFromUrl && idFromUrl.trim()) {
            handleSearch(idFromUrl.trim().toLowerCase());
        }
    }, [idFromUrl]);
    return (
        <section className="max-w-[1300px] mx-auto px-margin-desktop">
            <div className="space-y-12 article-content" ref={contentRef}>
                <div className="max-w-none text-foreground leading-relaxed">
                    <div className="mt-12 mb-14">
                        <SearchBar
                            initialValue={idFromUrl || ""}
                            onSearch={handleSearch}
                            language={language}
                            inputRef={inputRef}
                        />
                    </div>

                    {/* Hiển thị kết quả cho chính tên miền vừa tìm kiếm nếu có đuôi */}
                    {idFromUrl && (() => {
                        const sortedDomains = [...allSupportedDomains].sort((a, b) => b.tld.length - a.tld.length);
                        const domainInfo = sortedDomains.find(d => idFromUrl.endsWith(d.tld));

                        // Nếu không tìm thấy TLD hoặc phần tên chứa dấu chấm thì không hiển thị kết quả đặc biệt
                        if (!domainInfo) return null;
                        const domainName = idFromUrl.substring(0, idFromUrl.length - domainInfo.tld.length);
                        if (domainName.includes('.')) return null;

                        return (
                            <div className="mb-12 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                <h3 className="text-indigo-900 font-bold mb-4">{getTranslation("checkdomain.ketquatimkiem", language)}</h3>
                                <DomainItem
                                    {...domainInfo}
                                    name={domainName}
                                    onWhois={handleWhois}
                                    currency={currency}
                                    language={language}
                                    isSpecialView={true}
                                />
                            </div>
                        );
                    })()}

                    {/* Khu vực Grid 2 Khối danh sách song song */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <DomainBlock
                            title={getTranslation("checkdomain.tenmienVietNam", language)}
                            domains={VN_DOMAINS}
                            currency={currency}
                            currentSearch={searchName}
                            onWhois={handleWhois}
                            language={language}
                        />
                        <DomainBlock
                            title={getTranslation("checkdomain.tenmienQuocTe", language)}
                            domains={INTL_DOMAINS}
                            currency={currency}
                            currentSearch={searchName}
                            onWhois={handleWhois}
                            language={language}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

function SearchBar({ initialValue, onSearch, language, inputRef }) {
    const [inputValue, setInputValue] = useState(initialValue || "");
    useEffect(() => {
        if (!isMobile)
            inputRef.current?.focus();
    }, []);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onSearch(inputValue.trim().toLowerCase());
            if (!isMobile)
                inputRef.current?.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex shadow-lg rounded-2xl overflow-hidden border border-slate-200 bg-white max-w-3xl mx-auto mb-16 p-2">
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getTranslation('checkdomain.NhapTenMienBanMuon', language)}
                aria-label={getTranslation('checkdomain.NhapTenMienBanMuon', language)}
                className="flex-1 px-6 py-3 text-lg outline-none text-slate-700 placeholder-slate-400 bg-transparent"
            />
            <button
                type="submit"
                aria-label={getTranslation('checkdomain.KiemTra', language)}
                className="bg-primary hover:bg-primary/90 text-white px-4 font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
                {/* Chữ "Kiểm tra" chỉ hiện từ md trở lên */}
                <span className="hidden md:inline">{getTranslation('checkdomain.KiemTra', language)}</span>

                {/* Icon Search luôn hiện, nhưng chỉ hiển thị trên mobile nếu bạn muốn */}
                <span className="md:hidden">
                    <Search size={20} />
                </span>
            </button>
        </form>
    );
}

function DomainBlock({ title, domains, currentSearch, onWhois, currency, language }) {
    const [visibleCount, setVisibleCount] = useState(6);
    useEffect(() => {
        setVisibleCount(6);
    }, [currentSearch]);
    const visibleDomains = domains.slice(0, visibleCount);
    const hasMore = visibleCount < domains.length;

    return (
        // 1. Container chính là flex-col
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col ring-1 ring-slate-900/5">
            <div className="bg-gradient-to-r from-primary to-indigo-900 text-white px-6 py-5 font-bold text-xl tracking-tight">
                {title}
            </div>

            {/* 2. Phần danh sách: flex-grow-1 để nó chiếm hết không gian khả dụng */}
            <div className="flex-grow divide-y divide-slate-100 p-2">
                {visibleDomains.map((item, index) => (
                    <DomainItem
                        name={currentSearch}
                        {...item}
                        onWhois={onWhois}
                        currency={currency}
                        language={language}
                    />
                ))}
            </div>

            {/* 3. Phần button: mt-auto sẽ đẩy nó xuống dưới cùng của khối bất kể danh sách ngắn hay dài */}
            <div className="mt-auto">
                {hasMore && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 6)}
                            className="text-sm text-primary hover:text-indigo-700 font-bold transition-all w-full"
                        >
                            {getTranslation('checkdomain.xemthem', language).replaceAll('{so}', Math.min(6, domains.length - visibleCount).toString())}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function DomainItem({
    keyAPI, name, tld,
    itemPriceRegister, itemPriceRenew,
    itemPriceRegisterSale, itemPriceRenewSale,
    onWhois, currency, language,
    isSpecialView = false, variations }) {
    
    const [isAvailable, setIsAvailable] = useState<boolean | null | 'timeout'>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const domainName = name ? `${name}${tld}` : `example${tld}`;
    const { items, actions, cartKey } = useCart(language);
    useEffect(() => {
        if (!name) return;
        setIsAvailable(null); // Reset trạng thái khi bắt đầu fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);
        fetch(`/api/checkdomain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: `${name}${tld}` }),
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => {
                setIsAvailable(data.status.toString().startsWith("0"));
            })
            .catch((err) => {
                if (err.name === 'AbortError') {
                    setIsAvailable('timeout');
                }
                else {
                    setIsAvailable(false);
                }
            })
            .finally(() => {
                clearTimeout(timeoutId);
            });

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [name, tld, retryCount]);


    const isInCart = items.some(item => item._name == domainName);

    const ariaLabel = isAvailable === null ?
        getTranslation("checkdomain.loading", language) :
        isAvailable === 'timeout' ?
            getTranslation("checkdomain.btnTimeout", language) :
            isAvailable ?
                (isInCart ? getTranslation("checkdomain.btnDaChon", language) : getTranslation("checkdomain.btnChon", language)) :
                getTranslation("checkdomain.btnwhois", language);

        
    const itemV = variations?.[language]?.[0];
    const itemV_Id = itemV?.variation_id || keyAPI;
    const priceReg = itemPriceRegister?.[language];
    const priceRenew = itemPriceRenew?.[language];
    const priceRegSale = itemPriceRegisterSale?.[language];

    return (
        <div className={`flex items-center justify-between px-4 py-4 hover:bg-slate-50 transition-colors rounded-xl group gap-4 ${isSpecialView ? 'bg-white shadow-sm border border-indigo-200' : ''}`}>
            {/* Cột tên miền: thêm 'min-w-0' để flex không bị đẩy vỡ */}
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <span
                    className={`text-base font-bold break-all 
            ${isAvailable == null ? 'text-slate-400' :
                            isAvailable === true ? 'text-emerald-600' : 'text-slate-400 line-through'
                        }`}
                    title={domainName} // Hiển thị full tên khi rê chuột vào
                >
                    {domainName}
                </span>
                <div className="text-slate-400 font-medium break-all">
                    {/* Đăng ký */}
                    {priceReg !== null && priceReg !== undefined && (
                        <>
                            {getTranslation("checkdomain.dangky", language)}:&nbsp;
                            <span className="text-slate-600">
                                {priceRegSale !== null && priceRegSale !== undefined && priceRegSale < priceReg ? (
                                    <>
                                        <span className="line-through text-sm text-gray-400 mr-1">{formatCurrency(priceReg, currency.code)}</span>
                                        <span>{formatCurrency(priceRegSale, currency.code)}</span>
                                    </>
                                ) : (
                                    <span>{formatCurrency(priceReg, currency.code)}</span>
                                )}
                            </span>
                            /
                        </>
                    )}

                    {/* Gia hạn */}
                    {priceRenew !== null && priceRenew !== undefined && (
                        <>
                            {getTranslation("checkdomain.giahan", language)}:&nbsp;
                            <span className="text-slate-600">
                                <span>{formatCurrency(priceRenew, currency.code)}</span>
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Cột nút: thêm 'flex-shrink-0' để nút không bị co lại khi tên miền quá dài */}
            <div className="flex-shrink-0">
                <button
                    disabled={(isInCart && isAvailable === true) || isAdding}
                    onClick={async () => {
                        if (isAvailable === 'timeout') {
                            setRetryCount(prev => prev + 1);
                        } else if (!isAvailable) {
                            onWhois(`${name}${tld}`);
                        }
                        else {
                            setIsAdding(true);
                            try {
                                const response = await fetch(`/api/cart/add`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                        _id: itemV_Id,
                                        quantity: 1, 
                                        lang: language, 
                                        name: domainName, 
                                        cartKey: cartKey 
                                    })
                                });
                                const result = await response.json();
                                if (result.ok) {
                                    const data: any = result.msg;
                                    if (data && data.cart_key) {
                                        actions.clearCart();
                                        const data_items: Products[] = data.items.map((item: any): Products => ({
                                            item_key: data.item_key,
                                            _id: itemV_Id,
                                            _name: item.cart_item_data?._name,
                                            itemName: initI18n(item.name),
                                            quantity: item.quantity?.value,
                                            itemPriceCart: initI18n(item.price),
                                            itemCurrency: initI18n(data.currency.currency_code),
                                            variations
                                        }));
                                        actions.addAllToCart(data_items, false, data.cart_key, data.totals?.total_tax);
                                    }
                                    else {
                                        throw new Error(result.msg);
                                    }
                                }
                                else {
                                    throw new Error(result.msg || 'Unknown error');
                                }
                            }
                            catch (error) {
                                onWhois(`Error: ${error}`);
                            }
                            finally {
                                setIsAdding(false); // Tắt loading
                            }
                        }
                    }}
                    aria-label={ariaLabel}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all 
            ${isAvailable === null || isAdding ? "bg-slate-50 text-slate-400 cursor-wait" :
                            isInCart && isAvailable === true ? "bg-slate-100 text-slate-500 cursor-default" :
                                isAvailable === 'timeout' ? "bg-orange-50 text-orange-600" :
                                    isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                        }`}
                >
                    {ariaLabel}
                </button>
            </div>
        </div>
    );
}