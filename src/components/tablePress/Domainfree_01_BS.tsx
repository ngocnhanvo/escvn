import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import Gift from 'lucide-react/dist/esm/icons/gift';

interface Domainfree_01 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

export default function Domainfree_01(props: Domainfree_01) {
    const data = props.data;
    const tld = props.tld;

    if (!data || !data.items) return null;

    const domainItems = data.items;
    
    // Tìm item khớp với tld của parent. Nếu không tìm thấy, lấy item đầu tiên làm mặc định.
    const currentActiveItem = domainItems.find((item: any) => item.key === tld) || domainItems[0];

    if (!currentActiveItem || !currentActiveItem.key) return null;

    // Xử lý chuỗi "note" chứa HTML và ngắt dòng thành mảng các hàng ưu đãi
    const offerLines = currentActiveItem.note
        ? currentActiveItem.note.split(/\n+/).filter((line: string) => line.trim() !== '')
        : [];

    return (
        <>
            <div>
                DEMO BS
            </div>
            
        </>
    );
}