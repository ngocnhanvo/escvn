import { AppRouterProps } from '@/entities/AppRouterProps';
import FooterSection from '../FooterSection';
import Footer from '../Footer';
import Header from '../Header';
import { useCart } from '@/integrations/cms/cms-ecom/cart/useCartStore';
import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';
import { Products } from '@/entities/Products';
import { formatCurrency } from '@/lib/stringUtils';
import { mapProducts } from '@/lib/wordpress/products/mapProduct';
import { globalStore } from '@/services/globalStore';
import { initI18n } from '@/context/LanguageContext/getNameLang';
import Select from 'react-select';
import { handlePageLink } from '../PageTransition';
import { useNavigate } from 'react-router-dom';

const dataproduct = await globalStore.getProductData();
export default function CartPage(props: AppRouterProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { items, cartKey, actions, total_tax, subtotal, discount_total, total, coupons } = useCart(language);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background font-paragraph selection:bg-primary/20 selection:text-primary">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
        </div>
      )}
      <Header {...props} />
      <main id="main-content">
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* Breadcrumb - Simplified */}
            <nav className="mb-8 text-sm text-gray-500">
              <ol className="flex items-center space-x-2">
                <li className="font-semibold text-primary">Giỏ hàng</li>
                <li>/</li>
                <li className="text-gray-400">Thanh toán</li>
                <li>/</li>
                <li className="text-gray-400">Hoàn tất</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items - Left Column */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold mb-6">Giỏ hàng của bạn</h2>
                  {(!items || items.length === 0) ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống.</p>
                      <a href="/" className="inline-block bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">
                        Tiếp tục mua sắm
                      </a>
                    </div>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div className="hidden md:grid grid-cols-[10px,70px,1fr,100px,100px,100px] gap-4 pb-4 text-gray-600 items-center">
                        <div></div>
                        <div></div>
                        <div>Sản phẩm</div>
                        <div className='text-right'>Số lượng</div>
                        <div className='text-right'>Đơn giá</div>
                        <div className='text-right'>Tạm tính</div>
                      </div>
                      {items?.slice().sort((a, b) => (a._name || "").localeCompare(b._name || "")).map(item => {
                        const variations = item.variations?.[language];
                        const options = variations?.map((v) => ({
                          value: v.variation_id,
                          label: `${v.name} - ${formatCurrency(v.price, currency)}`
                        }));
                        const currentOption = options?.find(opt => opt.value == item._id) || null;
                        return (
                          <div className="space-y-6 pt-4 border-t border-[#CCC] mt-[15px]">
                            {/* Cart Item Row */}
                            <div className="grid grid-cols-[30px,60px,1fr] md:grid-cols-[10px,70px,1fr,100px,100px,100px] gap-4 items-center border-b pb-6 last:border-0 last:pb-0">
                              {/* 1. Delete */}
                              <button
                                onClick={() => removeItem(item?.item_key)}
                                className="text-gray-400 hover:text-red-500 font-bold md:col-span-1">×</button>

                              {/* 2. Image */}
                              <picture className="w-16 h-16 object-contain rounded-lg">
                                {item.itemImage ? (
                                  <source
                                    srcSet={item.itemImage?.[language]?.srcSet} type="image/webp"
                                    sizes="60px"
                                  />
                                ) : (
                                  <source
                                    srcSet="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                                    sizes="60px"
                                  />
                                )}

                                <img
                                  className="w-16 h-16 object-contain rounded-lg"
                                  width={100}
                                  height={60}
                                  alt={item.itemImage?.[language]?.alt}
                                  src={item.itemImage?.[language]?.src}
                                />
                              </picture>

                              {/* 3. Name */}
                              <div>
                                <h3 className="font-bold text-gray-900">{item.itemName?.[language]}</h3>
                                <p className="text-sm text-blue-600 font-medium">{item._name}</p>
                              </div>

                              {/* 4. Quantity */}
                              {variations && variations.length > 0 ? (
                                <div className="col-start-3 md:col-start-4 md:col-span-2">
                                  <Select
                                    options={options}
                                    value={currentOption} // Giá trị hiện tại đang được chọn
                                    onChange={(selectedNode) => {
                                      // selectedNode trả về full object { value, label }
                                      // Truyền selectedNode.value chính là variation_id tương đương e.target.value cũ
                                      if (selectedNode) {
                                        updateQuantity(item.item_key, 1, selectedNode.value);
                                      }
                                    }}
                                    isSearchable={false} // Tắt ô search gõ chữ
                                    placeholder="Chọn số năm..."
                                  />
                                </div>
                              ) : (
                                <div className="col-start-3 md:col-start-auto text-right">
                                  <div className="flex items-center gap-2 text-right">
                                    <button
                                      className="w-8 h-8 border rounded hover:bg-gray-100"
                                      onClick={() => updateQuantity(item.item_key, Math.max(1, item.quantity - 1))}
                                    >-</button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <button
                                      className="w-8 h-8 border rounded hover:bg-gray-100"
                                      onClick={() => updateQuantity(item.item_key, item.quantity + 1)}
                                    >+</button>
                                  </div>
                                </div>
                              )}
                              {/* 5. Price */}
                              {(!variations || variations.length === 0) && (
                                <div className="col-start-3 md:col-start-auto text-right">
                                  <div className="md:hidden text-xs text-gray-400">Đơn giá</div>
                                  <>
                                    {item.itemPrice?.[language] != item.itemPriceCart?.[language] && (
                                      <p className="text-sm text-gray-400 line-through">{formatCurrency(item.itemPrice?.[language], currency)}</p>
                                    )}
                                    <p className="font-bold text-primary">{formatCurrency(item.itemPriceCart?.[language], currency)}</p>
                                  </>
                                </div>
                              )}


                              {/* 6. Subtotal */}
                              <div className="col-start-3 md:col-start-auto">
                                <div className="md:hidden text-xs text-gray-400 text-right">Tạm tính</div>
                                <div className="font-bold text-gray-900 text-right">
                                  {variations && variations.length > 0 ? (
                                    <p className="font-bold text-primary">
                                      {(() => {
                                        const currentVariation = variations.find(a => a.variation_id == item._id);
                                        const total = currentVariation ? currentVariation.price * item.quantity : 0;
                                        return formatCurrency(total, currency);
                                      })()}
                                    </p>
                                  ) : (
                                    <>
                                      {item.itemPrice?.[language] != item.itemPriceCart?.[language] && (() => {
                                        const total = item.itemPrice?.[language] * item.quantity;
                                        return (
                                          <p className="text-sm text-gray-400 line-through">{formatCurrency(total, item.itemCurrency?.[language])}</p>
                                        )
                                      })()}

                                      <p className="font-bold text-primary">
                                        {(() => {
                                          const total = item.itemPriceCart?.[language] * item.quantity;
                                          return formatCurrency(total, currency);
                                        })()}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </div>

              {/* Cart Summary - Right Column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                  <h3 className="font-bold text-lg mb-4">Tổng cộng</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600"><span>Tạm tính</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    {discount_total && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-blue-600">
                          <button
                            onClick={() => setShowCoupons(!showCoupons)}
                            className="flex items-center gap-1 hover:underline font-medium"
                          >
                            <span>Giảm giá</span>
                            <span className="text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">{coupons.length}</span>
                          </button>
                          <span>- {formatCurrency(discount_total, currency)}</span>
                        </div>

                        {/* Chi tiết mã giảm giá (Accordion) */}
                        {showCoupons && (
                          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2 border border-gray-100">
                            {coupons.map((c, index) => (
                              <div key={index} className="flex justify-between text-gray-600">
                                <span>{c.coupon}</span>
                                <span className="font-medium text-blue-500">{c.saving_html}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {total_tax && (
                      <div className="flex justify-between text-red-600">
                        <span>Thuế</span>
                        <span>+ {formatCurrency(total_tax, currency)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between font-bold text-xl">
                      <span>Tổng</span>
                      <span className="text-primary">{formatCurrency(total, currency)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                        if (items && items.length > 0) {
                            handlePageLink(e, null, '/checkout', navigate);
                        }
                    }}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    Tiến hành thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FooterSection {...props} />
      <Footer {...props} />
    </div>
  );
};




