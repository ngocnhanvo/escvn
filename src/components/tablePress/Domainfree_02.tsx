import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';

interface Domainfree_02 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

const IconBox = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full transition-all hover:shadow-md hover:border-primary/20">
        {/* Đã cập nhật nền icon sang màu primary mờ nhẹ 5% và màu chữ/icon sang text-primary */}
        <div className="mb-4 h-16 text-primary bg-primary/5 p-3 rounded-xl">
            {/* Thêm ép màu currentColor vào SVG để ăn theo class text-primary của cha */}
            <span
                className="w-10 h-10 block [&>svg]:!w-full [&>svg]:!h-full [&>svg]:!stroke-current"
                dangerouslySetInnerHTML={{ __html: icon }}
            />
        </div>
        <h3 className="text-base font-medium text-gray-700 leading-relaxed max-w-[280px]">
            {title}
        </h3>
    </div>
);

export default function Domainfree_02(props: Domainfree_02) {
    const data = props.data;
    const tld = props.tld;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!data || !data.items) return null;

    const domainItems = data.items;

    // Lọc ra toàn bộ danh sách các lợi ích thuộc về tld hiện tại
    const activeBenefits = domainItems.filter((item: any) => item.key === tld);

    // Nếu không tìm thấy phần tử nào khớp với tld, lấy tạm danh sách của 'id.vn' hoặc phần tử đầu tiên làm fallback
    const displayBenefits = activeBenefits.length > 0 
        ? activeBenefits 
        : domainItems.filter((item: any) => item.key === (domainItems[0]?.key || 'id.vn'));

    if (displayBenefits.length === 0) return null;

    // Lấy tiêu đề chính từ phần tử đầu tiên trong nhóm được lọc (phần tử có text title)
    const sectionTitle = displayBenefits.find((item: any) => item.title)?.title 
        || `Lợi ích khi đăng ký tên miền .${tld?.toUpperCase()}`;

    return (
        <>
            {/* Lợi ích - Tận dụng màu nền secondary (#f8fbff) cực kì sáng sủa và êm mắt */}
            <section className="py-12 bg-secondary">
                <div className="container mx-auto px-4">
                    {/* Cập nhật tiêu đề sang màu primary độc quyền của bạn */}
                    <h2 className="text-primary text-2xl md:text-3xl font-bold text-center mb-10 uppercase">
                        {sectionTitle}
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayBenefits.map((item: any, idx: number) => (
                            <div key={idx}>
                                <IconBox 
                                    icon={item.icon} 
                                    title={item.note} 
                                    
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}