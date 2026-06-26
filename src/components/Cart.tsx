import { useCart, useCurrency, formatPrice, DEFAULT_CURRENCY } from '@/integrations';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Minus, Plus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Cart() {
  const { items, totalPrice, isOpen, isCheckingOut, actions } = useCart();
  const { currency } = useCurrency();

  return (
    <Sheet open={isOpen} onOpenChange={actions.toggleCart}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl">Giỏ hàng</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground font-paragraph">Chưa có sản phẩm nào</p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-muted/30 p-4 rounded-lg">
                    <Image
                      src={item.image || 'https://static.wixstatic.com/media/73be94_d57bfcccff4340b286eb06f1a06552f1~mv2.png?originWidth=128&originHeight=128'}
                      alt={item.name}
                      width={80}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="font-paragraph font-semibold text-sm line-clamp-2">
                          {item.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => actions.removeFromCart(item)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-primary font-bold mb-2 font-paragraph">
                        {formatPrice(item.price, currency ?? DEFAULT_CURRENCY)}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => actions.updateQuantity(item, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-paragraph font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => actions.updateQuantity(item, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-heading font-bold">Tổng cộng:</span>
                <span className="text-2xl font-heading font-bold text-primary">
                  {formatPrice(totalPrice, currency ?? DEFAULT_CURRENCY)}
                </span>
              </div>
              
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-paragraph font-bold py-6"
                onClick={actions.checkout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full font-paragraph"
                onClick={actions.closeCart}
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
