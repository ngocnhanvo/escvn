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
            {/* Thêm items-center để các cột bằng phân nửa chiều dọc luôn được gióng hàng ngay chính giữa màn hình */}
            <section className="py-12 container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Cột trái: Thêm flex flex-col items-center để tiêu đề và ảnh luôn canh đều vào trục giữa */}
                <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-4 text-center w-full">
                    <h3 className="text-primary text-xl md:text-2xl font-extrabold tracking-wide uppercase w-full">
                        {currentActiveItem.title2}
                    </h3>
                    {/* Giới hạn max-w-2xl và mx-auto để hình ảnh không bị phóng quá to trên màn hình lớn, giữ độ sắc nét */}
                    <div className="overflow-hidden rounded-2xl shadow-md border border-gray-100 w-full max-w-2xl mx-auto">
                        <img
                            fetchPriority="high"
                            decoding="async"
                            src={currentActiveItem.image?.src || "https://esc.vn/wp-content/uploads/2025/03/BANNER-TEN-MIEN-MIEN-PHI-01-1.png"}
                            className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
                            alt={currentActiveItem.image?.alt || currentActiveItem.title}
                        />
                    </div>
                </div>

                {/* Cột phải: Hộp Quà Tặng / Ưu đãi động */}
                <div className="lg:col-span-5 w-full">
                    <div className="bg-gradient-to-br from-primary/5 to-white border border-primary/10 p-6 shadow-sm rounded-2xl">
                        <h3 className="text-primary text-lg font-bold mb-4 flex items-center gap-2 border-b border-primary/10 pb-2 uppercase">
                            <Gift size={20} /> {currentActiveItem.title}
                        </h3>
                        
                        <ul className="space-y-3 text-gray-700 text-sm md:text-base text-left">
                            {offerLines.map((line: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                    <span className="text-green-500 font-bold mt-0.5">✓</span>
                                    <span 
                                        className="prose prose-sm text-gray-700 max-w-none [&>a]:text-red-500 [&>a]:font-medium [&>a]:hover:underline"
                                        dangerouslySetInnerHTML={{ __html: line }} 
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
            </section>
        </>
    );
}