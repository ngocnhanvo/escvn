import { AppRouterProps } from '@/entities/AppRouterProps';
import FooterSection from '../FooterSection';
import Footer from '../Footer';
import Header from '../Header';
import { useCart } from '@/integrations/cms/cms-ecom/cart/useCartStore';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form'; // Import useForm
import { Products } from '@/entities/Products';
import { formatCurrency } from '@/lib/stringUtils';
import { mapProducts } from '@/lib/wordpress/products/mapProduct';
import { globalStore } from '@/services/globalStore';
import { initI18n } from '@/context/LanguageContext/getNameLang';
import Select from 'react-select';
import { handlePageLink } from '../PageTransition';
import { Link, useNavigate } from 'react-router-dom';

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
    }
    const syncCartState = (data: any) => {
        actions.clearCart();
        if (data && data.items && Object.keys(data.items).length > 0) {
            const data_items: Products[] = Object.values(data.items).map((item: any): Products => ({
                item_key: item.item_key,
                _id: item.id,
                _name: item.cart_item_data?._name,
                quantity: item.quantity?.value,
                itemPriceCart: initI18n(item.price),
                itemCurrency: initI18n(data.currency.currency_code),
                slug: initI18n(item.slug)
            }));
            actions.addAllToCart(data_items,
                false,
                data.cart_key,
                data.totals?.total_tax,
                data.totals?.subtotal,
                data.totals?.discount_total,
                data.totals?.total,
                data.coupons
            );
        }
    };

    const removeItem = async (itemKey: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cart/del`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_key: cartKey, item_key: itemKey })
            });
            const result = await response.json();
            if (result.ok && result.data) {
                syncCartState(result.data);
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemKey: string, quantity: number, varId?: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/cart/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartKey,
                    item_key: itemKey,
                    quantity,
                    varId
                })
            });
            const result = await response.json();
            if (result.ok && result.data) {
                const data: any = result.data;
                syncCartState(data);
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        async function fetchCart() {
            try {
                const url = `/api/cart${cartKey ? `?cart_key=${cartKey}` : ''}`;
                const response = await fetch(url);
                const result = await response.json();
                if (result.ok && result.data) {
                    const data: any = result.data;
                    syncCartState(data);
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchCart();
    }, []);

    const currency = items?.[0]?.itemCurrency?.[language];

    const [showCoupons, setShowCoupons] = useState(false);

    const [isCreateAccount, setIsCreateAccount] = useState(false);

    // 1. Nếu bạn muốn quản lý dữ liệu Đăng nhập bằng react-hook-form độc lập
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            password: '',
            rememberme: false
        }
    });

    const onLoginSubmit = (data: any) => {
        console.log("Login Data Submitted:", data);
        // Gọi API xử lý đăng nhập của bạn tại đây
    };

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
                                <Link to={`/cart`} onClick={(e) => {handlePageLink(e, null, `/cart`, navigate)}}>
                                Giỏ hàng
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="font-semibold text-primary">Thanh toán</li>
                            <li>/</li>
                            <li className="text-gray-400">Hoàn tất</li>
                        </ol>
                    </nav>
                    <form onSubmit={handleSubmit(onLoginSubmit)} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <p className="text-sm text-gray-600 leading-relaxed pb-2">
                            Nếu trước đây bạn đã mua hàng của chúng tôi, vui lòng đăng nhập. Nếu bạn là khách hàng mới, vui lòng tiếp tục nhập phần thông tin thanh toán.
                        </p>
                        <div className="flex flex-col lg:flex-row lg:items-end gap-4">

                            {/* Tên đăng nhập hoặc Email */}
                            <div className="flex-1 space-y-1.5 w-full">
                                <input
                                    type="text"
                                    id="username"
                                    {...register('username', { required: true })}
                                    placeholder="Nhập tài khoản hoặc email..."
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.username ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
                                        }`}
                                />
                            </div>

                            {/* Mật khẩu */}
                            <div className="flex-1 space-y-1.5 w-full">
                                <input
                                    type="password"
                                    id="password"
                                    {...register('password', { required: true })}
                                    placeholder="••••••••"
                                    className={`w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'
                                        }`}
                                />
                            </div>

                            {/* Khối chứa nút Đăng nhập & Checkbox, link bổ sung */}
                            <div className="flex flex-col sm:flex-row sm:items-center lg:items-end justify-between gap-4 w-full lg:w-auto pt-2 lg:pt-0">

                                {/* Nút Đăng nhập: 
                        - Mobile: Rộng full 100%
                        - MD: Rớt xuống dòng riêng biệt (do cha bao bọc điều hướng dọc trước khi tới LG)
                        - LG: Thu gọn kích thước vừa vặn kế bên 2 input nhờ `lg:w-max`
                    */}
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors w-full sm:w-auto lg:w-max whitespace-nowrap h-[46px]"
                                >
                                    Đăng nhập
                                </button>

                                <div className="flex items-center gap-4 text-xs whitespace-nowrap mt-4 lg:mt-2 text-gray-600">
                                    {/* Ghi nhớ mật khẩu */}
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            id="rememberme"
                                            {...register('rememberme')}
                                            className="h-4 w-4 accent-primary cursor-pointer"
                                        />
                                        <span>Ghi nhớ mật khẩu</span>
                                    </label>

                                    {/* Quên mật khẩu */}
                                    <a
                                        href="https://esc.vn/tai-khoan/lost-password/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-gray-500 hover:text-primary transition-colors hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </a>
                                </div>

                            </div>

                        </div>

                        {/* Dành không gian hiển thị cho hàng tiện ích khi ở màn hình lớn tránh đè dữ liệu */}
                        <div className="hidden lg:block h-3"></div>
                    </form>
                    <div className="checkout woocommerce-checkout grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Cột trái: Thông tin thanh toán */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold mb-6">Thông tin thanh toán</h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-3 border rounded-xl">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="billing_chuthe" value="ca_nhan" className="accent-primary" /> Cá nhân</label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="billing_chuthe" value="to_chuc" className="accent-primary" /> Tổ chức</label>
                                    </div>
                                    <input type="text" name="billing_tenchuthe" placeholder="Tên chủ thể *" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <input type="text" name="billing_cccd" placeholder="CCCD/MSDN" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <input type="tel" name="billing_sodienthoai" placeholder="Số điện thoại *" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <input type="email" name="billing_email" placeholder="Email *" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <input type="text" name="billing_diachi" placeholder="Địa chỉ *" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" />
                                    <p className="form-row form-row-wide create-account porto-checkbox woocommerce-validated flex items-center gap-2 mt-4">
                                        <input
                                            className="woocommerce-form__input woocommerce-form__input-checkbox input-checkbox porto-control-input h-4 w-4 accent-primary cursor-pointer"
                                            id="createaccount"
                                            type="checkbox"
                                            name="createaccount"
                                            checked={isCreateAccount}
                                            onChange={(e) => setIsCreateAccount(e.target.checked)}
                                        />
                                        <label
                                            className="woocommerce-form__label woocommerce-form__label-for-checkbox form-check porto-control-label font-size-md text-sm text-gray-700 cursor-pointer select-none"
                                            htmlFor="createaccount"
                                        >
                                            <span>Tạo tài khoản mới?</span>
                                        </label>
                                    </p>
                                    <textarea name="order_comments" placeholder="Ghi chú đơn hàng" className="w-full border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-primary/20 outline-none" rows={3}></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Cột phải: Giỏ hàng & Tổng cộng */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-lg mb-4">Giỏ hàng của bạn</h3>
                                {(!items || items.length === 0) ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 mb-4">Giỏ hàng trống.</p>
                                        <button onClick={(e) => handlePageLink(e, null, '/', navigate)} className="bg-black text-white px-6 py-2 rounded-lg font-bold">Mua sắm</button>
                                    </div>
                                ) : (
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
                                                        <button onClick={() => removeItem(item.item_key)} className="text-gray-400 hover:text-red-500 font-bold">×</button>
                                                        <img src={item.itemImage?.[language]?.src} className="w-10 h-10 rounded-lg object-contain bg-gray-50" />
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-gray-900 text-xs">{item.itemName?.[language]}</h4>
                                                            <p className="text-xs text-blue-600">{item._name}</p>
                                                        </div>
                                                        <p className="font-bold text-primary text-xs">
                                                            {variations && variations.length > 0
                                                                ? formatCurrency((variations.find(a => a.variation_id == item._id)?.price || 0) * item.quantity, currency)
                                                                : formatCurrency(item.itemPriceCart?.[language] * item.quantity, currency)}
                                                        </p>
                                                    </div>

                                                    {variations && variations.length > 0 ? (
                                                        <div className="ml-12">
                                                            <Select
                                                                options={options}
                                                                value={currentOption}
                                                                onChange={(selected) => selected && updateQuantity(item.item_key, 1, selected.value)}
                                                                isSearchable={false}
                                                                className="text-xs"
                                                                placeholder="Chọn loại..."
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="ml-12 flex items-center gap-1">
                                                            <button className="w-6 h-6 border rounded hover:bg-gray-100 text-xs" onClick={() => updateQuantity(item.item_key, Math.max(1, item.quantity - 1))}>-</button>
                                                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                                                            <button className="w-6 h-6 border rounded hover:bg-gray-100 text-xs" onClick={() => updateQuantity(item.item_key, item.quantity + 1)}>+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <h3 className="font-bold text-lg mb-4 border-t pt-4">Tổng cộng</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600 text-sm"><span>Tạm tính</span><span>{formatCurrency(subtotal, currency)}</span></div>

                                    {/* Chi tiết giảm giá (từ CartPage.tsx) */}
                                    {discount_total > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-blue-600 text-sm">
                                                <button onClick={() => setShowCoupons(!showCoupons)} className="flex items-center gap-1 hover:underline font-medium">
                                                    <span>Giảm giá</span>
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
                                            <span>Thuế</span>
                                            <span>+ {formatCurrency(total_tax, currency)}</span>
                                        </div>
                                    )}

                                    <div className="border-t pt-3 flex justify-between font-bold text-xl">
                                        <span>Tổng</span>
                                        <span className="text-primary">{formatCurrency(total, currency)}</span>
                                    </div>
                                </div>

                                {/* Phương thức thanh toán */}
                                <div className="mb-6 space-y-3">
                                    <h4 className="font-bold text-sm">Phương thức thanh toán</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                            <input type="radio" name="payment_method" value="bacs" className="accent-primary" />
                                            <span>Chuyển khoản ngân hàng</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                            <input type="radio" name="payment_method" value="ppcp-card-button-gateway" className="accent-primary" />
                                            <span>Debit & Credit Cards</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                            <input type="radio" name="payment_method" value="ppcp-gateway" className="accent-primary" />
                                            <span>PayPal</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm border p-3 rounded-xl cursor-pointer">
                                            <input type="radio" name="payment_method" value="onepayus" defaultChecked className="accent-primary" />
                                            <span>onepayUS</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Chính sách bảo mật (Privacy Policy text) */}
                                <div className="mt-4 text-[12px] text-gray-500 leading-relaxed">
                                    <p>Thông tin cá nhân của bạn sẽ được sử dụng để xử lý đơn hàng, tăng trải nghiệm sử dụng website, và cho các mục đích cụ thể khác đã được mô tả trong <a href="/chinh-sach-bao-mat" target="_blank" className="text-primary underline">chính sách bảo mật</a> của chúng tôi.</p>
                                </div>

                                {/* Điều khoản & Chính sách bảo mật */}
                                <div className="mt-6 mb-6">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="terms"
                                            required
                                            className="mt-1 accent-primary"
                                            checked={isTermsAccepted}
                                            onChange={(e) => setIsTermsAccepted(e.target.checked)}
                                        />
                                        <span className="text-[12px] text-gray-600 leading-relaxed">
                                            Tôi đồng ý với <a href="/thoa-thuan-su-dung/" target="_blank" className="text-primary underline">Thỏa thuận sử dụng</a> và <a href="/chinh-sach-bao-ve-du-lieu-ca-nhan/" target="_blank" className="text-primary underline">Chính sách bảo vệ dữ liệu cá nhân</a> của ESC.
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
                                >
                                    Thanh toán
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection {...props} />
            <Footer {...props} />
        </div>
    );
};