import { AppRouterProps } from '@/entities/AppRouterProps';
import FooterSection from '../FooterSection';
import Footer from '../Footer';
import Header from '../Header';
import { useCart } from '@/integrations/cms/cms-ecom/cart/useCartStore';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { formatCurrency } from '@/lib/stringUtils';
import { mapProducts } from '@/lib/wordpress/products/mapProducts';
import { globalStore } from '@/services/globalStore';
import { initI18n } from '@/context/LanguageContext/getNameLang';
import Select from 'react-select';
import { handlePageLink } from '../PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, removeItem, updateQuantity } from '@/lib/utils/cart';
import { Pages } from '@/entities/Pages';
import mtlang from '@/data/i18n/checkout.json';
let pagePrivacy: Pages, pageTerms: Pages, pageProtectpolicy: Pages, pageCart: Pages, pageHome: Pages;
const dataproduct = await globalStore.getProductData();
export default function CheckoutPage(props: AppRouterProps) {
    const { language } = useLanguage();
    const navigate = useNavigate(); // Thêm hook navigate
    const { items, cartKey, actions, total_tax, subtotal, discount_total, total, coupons } = useCart(language);
    const [loading, setLoading] = useState(true);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    if (!loading) {
        props = globalStore.getCommonData();
        props.data_products = dataproduct;
        mapProducts(props.data_products, items);
        if (!pagePrivacy)
            pagePrivacy = props.pages.find(a => a.key == 'privacy' && a.lang == language);
        if (!pageTerms)
            pageTerms = props.pages.find(a => a.key == 'terms' && a.lang == language);
        if (!pageProtectpolicy)
            pageProtectpolicy = props.pages.find(a => a.key == 'protectpolicy' && a.lang == language);
        if (!pageCart)
            pageCart = props.pages.find(a => a.key == 'cart' && a.lang == language);
        if(!pageHome)
            pageHome = props.pages.find(a=>a.key == 'home' && a.lang == language);
    }

    useEffect(() => {
        fetchCart(cartKey, actions, initI18n, setLoading);
    }, []);

    const currency = items?.[0]?.itemCurrency?.[language];

    const [showCoupons, setShowCoupons] = useState(false);

    // 1. Nếu bạn muốn quản lý dữ liệu Đăng nhập bằng react-hook-form độc lập
    const { register: registerLogin,
        handleSubmit: handleSubmitLogin,
        formState: { errors: errorsLogin } } = useForm({
            defaultValues: {
                username: '',
                password: '',
                rememberme: false
            }
        });

    const { register: registerCheckout,
        handleSubmit: handleSubmitCheckout,
        formState: { errors: errorsCheckout } } = useForm({
            defaultValues: {
                username: '',
                password: '',
                rememberme: false,
                billing_chuthe: 'ca_nhan',
                billing_tenchuthe: '',
                billing_cccd: '',
                billing_sodienthoai: '',
                billing_email: '',
                billing_diachi: '',
                createaccount: false,
                order_comments: '',
                payment_method: 'onepayus',
                terms: false
            }
        });

    const onLoginSubmit = (data: any) => {
        console.log("Login Data Submitted:", data);
        // Gọi API xử lý đăng nhập của bạn tại đây
    };

    const onCheckoutSubmit = async (data: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cart/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartKey,
                    payment_method: data.payment_method,
                    customer_note: data.order_comments,
                    terms: data.terms,
                    create_account: data.createaccount,
                    billing: {
                        "first_name": data.billing_tenchuthe,
                        "last_name": "",
                        "company": "",
                        "email": data.billing_email,
                        "phone": data.billing_sodienthoai,
                        "address_1": data.billing_diachi,
                        "address_2": "",
                        "city": "",
                        "state": "",
                        "postcode": "",
                        "country": "VN",
                        "chuthe": data.billing_chuthe,
                        "cccd": data.billing_cccd
                    }
                })
            });
            const result = await response.json();
            if (result.ok) {
                actions.clearCart();
                window.location.href = result.data.redirect;
            }
            else {
                alert(result.msg);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error('Failed to update quantity:', error);
        }
    };

    const handleFormKeyDown = (e) => {
        // Nếu phím nhấn là Enter VÀ nó KHÔNG PHẢI xuất hiện từ thẻ textarea (vì textarea cần Enter để xuống dòng)
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }

    return (
        <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
            {loading && (
                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                </div>
            )}
            <Header {...props} />
            <main id="main-content" className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    {/* Breadcrumb - Simplified */}
                    <nav className="mb-8 text-sm text-gray-500">
                        <ol className="flex items-center space-x-2">
                            <li className="text-gray-400">
                                <Link to={`/${pageCart?.slug}`} onClick={(e) => { handlePageLink(e, null, `/cart`, navigate) }}>
                                    {mtlang?.cart?.[language]}
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="font-semibold text-primary">
                                {mtlang?.checkout?.[language]}
                            </li>
                            <li>/</li>
                            <li className="text-gray-400">
                                {mtlang?.complete?.[language]}
                            </li>
                        </ol>
                    </nav>
                    <form onSubmit={handleSubmitLogin(onLoginSubmit)} onKeyDown={handleFormKeyDown} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <p className="text-sm leading-relaxed pb-2">
                            {mtlang?.login_text?.[language]}
                        </p>
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">

                            {/* Tên đăng nhập hoặc Email */}
                            <div className="flex-1 space-y-1.5 w-full">
                                <input
                                    type="text"
                                    id="username"
                                    {...registerLogin('username', { required: true })}
                                    placeholder={mtlang?.login_username?.[language]}
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errorsLogin.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
                                        }`}
                                />
                            </div>

                            {/* Mật khẩu */}
                            <div className="flex-1 space-y-1.5 w-full">
                                <input
                                    type="password"
                                    id="password"
                                    {...registerLogin('password', { required: true })}
                                    placeholder={mtlang?.login_password?.[language]}
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errorsLogin.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
                                        }`}
                                />
                            </div>

                            {/* Khối chứa nút Đăng nhập & Checkbox, link bổ sung */}
                            <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between gap-4 w-full lg:w-auto pt-2 lg:pt-0">
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors w-full sm:w-auto lg:w-max whitespace-nowrap h-[46px]"
                                >
                                    {mtlang?.login_button?.[language]}
                                </button>

                                <div className="flex items-center gap-4 text-xs whitespace-nowrap mt-4 lg:mt-2 text-gray-600">
                                    {/* Ghi nhớ mật khẩu */}
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            id="rememberme"
                                            {...registerLogin('rememberme')}
                                            className="h-4 w-4 accent-primary cursor-pointer"
                                        />
                                        <span>{mtlang?.login_remember?.[language]}</span>
                                    </label>

                                    {/* Quên mật khẩu */}
                                    <a
                                        href="https://esc.vn/tai-khoan/lost-password/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-gray-500 hover:text-primary transition-colors hover:underline"
                                    >
                                        {mtlang?.login_lost_password?.[language]}
                                    </a>
                                </div>

                            </div>

                        </div>

                        {/* Dành không gian hiển thị cho hàng tiện ích khi ở màn hình lớn tránh đè dữ liệu */}
                        <div className="hidden lg:block h-3"></div>
                    </form>

                    <form onSubmit={handleSubmitCheckout(onCheckoutSubmit)} onKeyDown={handleFormKeyDown} className="checkout woocommerce-checkout grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Cột trái: Thông tin thanh toán */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold mb-6">{mtlang?.billing_title?.[language]}</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-3 border rounded-xl">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" {...registerCheckout('billing_chuthe')} value="ca_nhan" className="accent-primary" /> {mtlang?.billing_personal?.[language]}</label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" {...registerCheckout('billing_chuthe')} value="to_chuc" className="accent-primary" /> {mtlang?.billing_organization?.[language]}</label>
                                    </div>
                                    <input type="text" {...registerCheckout('billing_tenchuthe', { required: true })} placeholder={mtlang?.billing_name?.[language]} className={`w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none ${errorsCheckout.billing_tenchuthe ? 'border-red-500' : ''}`} />
                                    <input type="text" {...registerCheckout('billing_cccd')} placeholder={mtlang?.billing_id_number?.[language]} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <input type="tel" {...registerCheckout('billing_sodienthoai', { required: true })} placeholder={mtlang?.billing_phone?.[language]} className={`w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none ${errorsCheckout.billing_sodienthoai ? 'border-red-500' : ''}`} />
                                    <input type="email" {...registerCheckout('billing_email', { required: true })} placeholder={mtlang?.billing_email?.[language]} className={`w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none ${errorsCheckout.billing_email ? 'border-red-500' : ''}`} />
                                    <input type="text" {...registerCheckout('billing_diachi', { required: true })} placeholder={mtlang?.billing_address?.[language]} className={`w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none ${errorsCheckout.billing_diachi ? 'border-red-500' : ''}`} />
                                    <p className="form-row form-row-wide create-account porto-checkbox woocommerce-validated flex items-center gap-2 mt-4">
                                        <input
                                            className="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox porto-control-input h-4 w-4 accent-primary cursor-pointer"
                                            id="createaccount"
                                            type="checkbox"
                                            {...registerCheckout('createaccount')}
                                        />
                                        <label
                                            className="woocommerce-form__label woocommerce-form__label-for-checkbox form-check porto-control-label font-size-md text-sm text-gray-700 cursor-pointer select-none"
                                            htmlFor="createaccount"
                                        >
                                            <span>{mtlang?.billing_create_account?.[language]}</span>
                                        </label>
                                    </p>
                                    <textarea {...registerCheckout('order_comments')} placeholder={mtlang?.billing_note?.[language]} className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" rows={3}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Giỏ hàng & Tổng cộng */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-lg mb-4">{mtlang?.cart_title?.[language]}</h3>
                                {(!items || items.length === 0) ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-4">{mtlang?.cart_empty?.[language]}</p>
                                        <button type="button" onClick={(e) => handlePageLink(e, null, '/', navigate)} className="bg-black text-white px-6 py-2 rounded-lg font-bold">
                                            {mtlang?.cart_shop_now?.[language]}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            {items?.slice().sort((a, b) => (a._name || "").localeCompare(b._name || "")).map(item => {
                                                const variations = item.variations?.[language];
                                                const options = variations?.map((v) => ({
                                                    value: v.variation_id,
                                                    label: `${v.name} - ${formatCurrency(v.price, currency)}`
                                                }));
                                                const currentOption = options?.find(opt => opt.value == item._id) || null;
                                                return (
                                                    <div key={item.item_key} className="border-b pb-4 last:border-0 last:pb-0">
                                                        <div className="flex gap-3 items-center mb-2">
                                                            <button type="button" onClick={() => removeItem(item.item_key, cartKey, actions, initI18n, setLoading)} className="text-gray-400 hover:text-red-500 font-bold">×</button>
                                                            <img src={item.itemImage?.[language]?.src} className="w-10 h-10 rounded-lg object-contain bg-gray-50" />
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-xs">{item.itemName?.[language]}</h4>
                                                                <p className="text-xs text-blue-600">{item._name}</p>
                                                            </div>
                                                            <p className="font-bold text-primary text-xs">
                                                                {formatCurrency(item.totals?.subtotal, currency)}
                                                            </p>
                                                        </div>

                                                        {variations && variations.length > 0 ? (
                                                            <div className="ml-12">
                                                                <Select
                                                                    options={options}
                                                                    value={currentOption}
                                                                    onChange={(selected) =>
                                                                        selected && updateQuantity(item.item_key, 1, cartKey, actions, initI18n, setLoading, selected.value)
                                                                    }
                                                                    isSearchable={false}
                                                                    className="text-xs"
                                                                    placeholder={mtlang?.cart_shop_now?.[language]}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="ml-12 flex items-center gap-1">
                                                                <button
                                                                    className="w-6 h-6 border rounded hover:bg-gray-100 text-xs"
                                                                    onClick={() =>
                                                                        updateQuantity(item.item_key, Math.max(1, item.quantity - 1), cartKey, actions, initI18n, setLoading)
                                                                    }>-</button>
                                                                <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                                                                <button
                                                                    className="w-6 h-6 border rounded hover:bg-gray-100 text-xs"
                                                                    onClick={() =>
                                                                        updateQuantity(item.item_key, item.quantity + 1, cartKey, actions, initI18n, setLoading)
                                                                    }>+</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>


                                        <h3 className="font-bold text-lg mb-4 border-t pt-4">{mtlang?.summary_title?.[language]}</h3>
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-gray-600 text-sm"><span>{mtlang?.summary_subtotal?.[language]}</span><span>{formatCurrency(subtotal, currency)}</span></div>

                                            {/* Chi tiết giảm giá (từ CartPage.tsx) */}
                                            {discount_total > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-blue-600 text-sm">
                                                        <button type="button" onClick={() => setShowCoupons(!showCoupons)} className="flex items-center gap-1 hover:underline font-medium">
                                                            <span>{mtlang?.summary_discount?.[language]}</span>
                                                            <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-full">{coupons.length}</span>
                                                        </button>
                                                        <span>- {formatCurrency(discount_total, currency)}</span>
                                                    </div>
                                                    {showCoupons && (
                                                        <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 border border-gray-100">
                                                            {coupons.map((c: any, index: number) => (
                                                                <div key={index} className="flex justify-between text-gray-600">
                                                                    <span>{c.coupon}</span>
                                                                    <span className="font-medium text-blue-500">{c.saving_html}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Thuế */}
                                            {total_tax > 0 && (
                                                <div className="flex justify-between text-red-600 text-sm">
                                                    <span>{mtlang?.summary_tax?.[language]}</span>
                                                    <span>+ {formatCurrency(total_tax, currency)}</span>
                                                </div>
                                            )}

                                            <div className="border-t pt-3 flex justify-between font-bold text-xl">
                                                <span>{mtlang?.summary_title?.[language]}</span>
                                                <span className="text-primary">{formatCurrency(total, currency)}</span>
                                            </div>
                                        </div>

                                        {/* Phương thức thanh toán */}
                                        <div className="mb-6 space-y-3">
                                            <h4 className="font-bold text-sm">{mtlang?.payment_title?.[language]}</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                                    <input type="radio" {...registerCheckout('payment_method')} value="bacs" className="accent-primary" />
                                                    <span>{mtlang?.payment_bacs?.[language]}</span>
                                                </label>
                                                <label className="opacity-50 bg-gray-50 cursor-not-allowed flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                                    <input disabled type="radio" {...registerCheckout('payment_method')} value="ppcp-card-button-gateway" className="accent-primary" />
                                                    <span>Debit & Credit Cards ({mtlang?.more_maintain?.[language]})</span>
                                                </label>
                                                <label className="opacity-50 bg-gray-50 cursor-not-allowed flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                                    <input disabled type="radio" {...registerCheckout('payment_method')} value="ppcp-gateway" className="accent-primary" />
                                                    <span>PayPal ({mtlang?.more_maintain?.[language]})</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                                    <input type="radio" {...registerCheckout('payment_method')} value="onepayus" className="accent-primary" />
                                                    <span>OnepayUS</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Chính sách bảo mật (Privacy Policy text) */}
                                        <div className="mt-4 text-[12px] text-gray-500 leading-relaxed">
                                            <p>{mtlang?.policy_privacy_text?.[language]} <a href={`/${pagePrivacy?.slug}`} target="_blank" className="text-primary underline">{mtlang?.policy_privacy_link?.[language]}</a> của chúng tôi.</p>
                                        </div>

                                        {/* Điều khoản & Chính sách bảo mật */}
                                        <div className="mt-6 mb-6">
                                            <label className="flex items-start gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...registerCheckout('terms', { required: true })}
                                                    className="mt-1 accent-primary"
                                                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                                />
                                                <span className="text-[12px] text-gray-600 leading-relaxed">
                                                    {mtlang?.terms_text?.[language]} <a href={`/${pageTerms?.slug}`} target="_blank" className="text-primary underline">{mtlang?.terms_link?.[language]}</a> {mtlang?.terms_and?.[language]} <a href={`/${pageProtectpolicy?.slug}`} target="_blank" className="text-primary underline">{mtlang?.terms_policy_link?.[language]}</a> của ESC.
                                                </span>
                                            </label>
                                        </div>

                                        <button
                                            disabled={!isTermsAccepted}
                                            type="submit"
                                            name="woocommerce_checkout_place_order"
                                            className="w-full bg-black text-white py-4 rounded-xl font-bold transition-all duration-200 
               hover:bg-gray-800 
               disabled:bg-gray-300 disabled:text-gray-500 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
                                        >{mtlang?.submit_button?.[language]}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <FooterSection {...props} />
            <Footer {...props} />
        </div>
    );
};