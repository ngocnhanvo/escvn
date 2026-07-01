import { useState, useEffect } from 'react';
import { useCart, BaseCrudService } from '@/integrations';
import { X, Plus, Minus, ShoppingBag, CreditCard, Truck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AppRouterProps, Products } from '@/entities';
import { formatCurrency, removeUnicode } from '@/lib/stringUtils';
import { useLanguage } from '@/lib/LanguageContext';
import { getTranslation } from '@/lib/i18n';

export default function Cart(props: AppRouterProps) {
  const { language } = useLanguage();
  const { items, totalPrice: subtotal, isOpen, actions } = useCart(language);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    note: '',
    paymentMethod: 'cod' as 'cod' | 'bank'
  });

  const currency = items.length > 0 ? items[0].itemCurrency[language] : 'VND';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Chỉ reset trạng thái về giỏ hàng khi Drawer đóng hẳn
  useEffect(() => {
    if (!isOpen) {
      setStep('cart');
      setFormData({ fullName: '', phone: '', email: '', note: '', paymentMethod: 'cod' });
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { // Khi click backdrop, đóng cart và reset step
              actions.closeCart();
            }}
            className="fixed inset-0 bg-primary/30 backdrop-blur-sm z-50"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-primary" />
                <h2 className="text-2xl text-primary uppercase">
                  {step === 'checkout'
                    ? getTranslation('cart.checkout', language, props)
                    : getTranslation('cart.title', language, props)}
                </h2>
              </div>
              <button
                onClick={() => {
                  actions.closeCart();
                }}
                className="p-2 text-primary hover:text-linkcolor transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl text-primary">
                      {getTranslation('cart.orderSuccess', language, props)}
                    </h3>
                    <p className="font-paragraph text-base text-primary/60">
                      {getTranslation('cart.orderSuccessDesc', language, props)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      actions.closeCart();
                    }}
                    className="px-8 py-3 bg-primary text-white font-paragraph text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
                  >
                    {getTranslation('cart.continue', language, props)}
                  </button>
                </motion.div>
              ) : step === 'checkout' ? (
                <form id="checkout-form" onSubmit={handleOrderSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm uppercase tracking-wider font-semibold text-primary/60">
                        {getTranslation('contact.formName', language, props)}
                      </label>
                      <input
                        required
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-buttonborder bg-transparent focus:outline-none focus:border-primary transition-colors"
                        placeholder={getTranslation('contact.placeholderName', language, props)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm uppercase tracking-wider font-semibold text-primary/60">
                        {getTranslation('contact.formPhone', language, props)}
                      </label>
                      <input
                        required
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-buttonborder bg-transparent focus:outline-none focus:border-primary transition-colors"
                        placeholder={getTranslation('contact.placeholderPhone', language, props)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm uppercase tracking-wider font-semibold text-primary/60">
                        {getTranslation('contact.formEmail', language, props)}
                      </label>
                      <input
                        required
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-buttonborder bg-transparent focus:outline-none focus:border-primary transition-colors"
                        placeholder={getTranslation('contact.placeholderEmail', language, props)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm uppercase tracking-wider font-semibold text-primary/60">
                        {getTranslation('cart.form.note', language, props)}
                      </label>
                      <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 border border-buttonborder bg-transparent focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-sm uppercase tracking-wider font-semibold text-primary/60">
                      {getTranslation('cart.paymentMethod', language, props)}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <label className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-buttonborder'}`}>
                        <div className="flex items-center gap-3">
                          <Truck className="w-5 h-5" />
                          <span className="font-paragraph">{getTranslation('cart.payment.cod', language, props)}</span>
                        </div>
                        <input type="radio" name="paymentMethod" className="hidden" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })} />
                        <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-buttonborder'}`} />
                      </label>
                      <label className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'border-buttonborder'}`}>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-paragraph">{getTranslation('cart.payment.bank', language, props)}</span>
                        </div>
                        <input type="radio" name="paymentMethod" className="hidden" checked={formData.paymentMethod === 'bank'} onChange={() => setFormData({ ...formData, paymentMethod: 'bank' })} />
                        <div className={`w-4 h-4 rounded-full border-2 ${formData.paymentMethod === 'bank' ? 'border-primary bg-primary' : 'border-buttonborder'}`} />
                      </label>

                      <AnimatePresence>
                        {formData.paymentMethod === 'bank' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-secondary border border-buttonborder text-xs md:text-sm text-primary/70 italic leading-relaxed"
                          >
                            {getTranslation('cart.payment.bankMaintenance', language, props)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </form>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="w-16 h-16 text-primary/30" />
                  <p className="font-paragraph text-lg text-primary">
                    {getTranslation('cart.empty', language, props)}
                  </p>
                  <p className="font-paragraph text-base text-primary/60">
                    {getTranslation('cart.emptyDesc', language, props)}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 pb-6 border-b border-primary/10 last:border-0"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-secondary">
                        {item.itemImage[language] && (
                          <Image
                            src={item.itemImage[language].srcSets["100"]}
                            alt={item.itemName[language]}
                            className="w-full h-full object-cover"
                            width={96}
                          />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg text-primary mb-1">
                            {item.itemName[language]}
                          </h3>
                          <p className="font-paragraph text-base text-linkcolor">
                            {formatCurrency(item.itemPrice[language], item.itemCurrency[language])}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actions.updateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 border border-buttonborder text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-paragraph text-base text-primary w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => actions.updateQuantity(item, item.quantity + 1)}
                              className="p-1 border border-buttonborder text-primary hover:bg-primary hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => actions.removeFromCart(item)}
                            className="font-paragraph text-sm text-destructive hover:text-destructive/80 transition-colors"
                          >
                            {getTranslation('cart.remove', language, props)}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Panel */}
            {items.length > 0 && step !== 'success' && (
              <div className="border-t border-primary/10 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-xl text-primary">
                    {getTranslation('cart.total', language, props)} {/* Giờ là Subtotal */}
                  </span>
                  <span className="text-2xl text-primary">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>

                {submitError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-paragraph">
                    {submitError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setStep('checkout'); }}
                  className="w-full py-4 bg-primary text-white font-paragraph text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
                >
                  {getTranslation('cart.checkout', language, props)}
                </button>

                <button
                  onClick={() => {
                    actions.closeCart();
                  }}
                  className="w-full py-4 border border-buttonborder text-primary font-paragraph text-base hover:bg-primary hover:text-white transition-colors"
                >
                  {getTranslation('cart.continue', language, props)}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
