// cartUtils.ts
import { Products } from '../../entities/Products';

// 1. Hàm đồng bộ trạng thái giỏ hàng vào Context/Store
export const syncCartState = (data: any, actions: any, initI18n: Function) => {
    actions.clearCart();
    
    if (data && data.items && Object.keys(data.items).length > 0) {
        const data_items: Products[] = Object.values(data.items).map((item: any): Products => ({
            item_key: item.item_key,
            _id: item.id,
            _name: item.cart_item_data?._name,
            quantity: item.quantity?.value,
            itemPriceCart: initI18n(item.price),
            itemCurrency: initI18n(data.currency.currency_code),
            slug: initI18n(item.slug),
            totals: item.totals
        }));
        
        actions.addAllToCart(
            data_items,
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

// 2. Hàm xóa sản phẩm khỏi giỏ hàng
export const removeItem = async (
    itemKey: string, 
    cartKey: string, 
    actions: any, 
    initI18n: Function, 
    setLoading: (loading: boolean) => void
) => {
    setLoading(true);
    try {
        const response = await fetch(`/api/cart/del`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart_key: cartKey, item_key: itemKey })
        });
        const result = await response.json();
        if (result.ok && result.data) {
            syncCartState(result.data, actions, initI18n);
        }
    } catch (error) {
        console.error('Failed to remove item:', error);
    } finally {
        setLoading(false);
    }
};

// 3. Hàm cập nhật số lượng sản phẩm
export const updateQuantity = async (
    itemKey: string, 
    quantity: number, 
    cartKey: string, 
    actions: any, 
    initI18n: Function, 
    setLoading: (loading: boolean) => void,
    varId?: string
) => {
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
            syncCartState(result.data, actions, initI18n);
        }
    } catch (error) {
        console.error('Failed to update quantity:', error);
    } finally {
        setLoading(false);
    }
};

// 4. Hàm lấy dữ liệu giỏ hàng ban đầu
export const fetchCart = async (
    cartKey: string, 
    actions: any, 
    initI18n: Function, 
    setLoading: (loading: boolean) => void
) => {
    try {
        const url = `/api/cart${cartKey ? `?cart_key=${cartKey}` : ''}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.ok && result.data) {
            syncCartState(result.data, actions, initI18n);
        }
    } catch (error) {
        console.error('Failed to fetch cart:', error);
    } finally {
        setLoading(false);
    }
};