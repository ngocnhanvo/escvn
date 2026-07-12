import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';

const StepBox = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex flex-col items-center text-center p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 transform hover:-translate-y-1">
        <div className="mb-4 h-16 text-primary bg-primary/5 p-4 rounded-full">
            <span
                className="relative top-[-3px] w-10 h-10 block [&>svg]:!w-full [&>svg]:!h-full"
                dangerouslySetInnerHTML={{ __html: icon }}
            />
        </div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>
);

const DownloadButton = ({ href, icon, label }: { href: string; icon: string; label: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-10 py-3.5 bg-red-500 text-white font-bold text-base rounded-full shadow-md shadow-red-200 transition-all hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 text-center group w-full sm:w-auto"
    >
        <div className="flex items-center justify-center gap-3">
            {/* Giữ nguyên định dạng gốc của SVG, chuyển màu icon sang màu trắng để tiệp với nền nút đỏ */}
            <span
                className="w-6 h-6 block text-white/90 group-hover:text-white transition-colors [&>svg]:!w-full [&>svg]:!h-full"
                dangerouslySetInnerHTML={{ __html: icon }}
            />
            <span className="truncate">{label}</span>
        </div>
    </a>
);

interface Domainfree_03 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

export default function Domainfree_03(props: Domainfree_03) {
    const data = props.data;
    const tld = props.tld;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!data || !data.items) return null;

    const domainItems = data.items;

    // Lọc ra toàn bộ danh sách các lợi ích thuộc về tld hiện tại
    const activeBenefits = domainItems.filter((item: any) => item.key === tld);

    // Nếu không tìm thấy phần tử nào khớp với tld, lấy nhóm đầu tiên làm fallback
    const displayBenefits = activeBenefits.length > 0
        ? activeBenefits
        : domainItems.filter((item: any) => item.key === (domainItems[0]?.key || 'id.vn'));

    if (displayBenefits.length === 0) return null;

    // Lọc danh sách tài liệu hợp lệ (loại bỏ phần tử không có link hoặc label - ví dụ ở biz.vn bước 2 và 4)
    const validDownloads = displayBenefits.filter((item: any) => item.link && item.label);

    return (
        <>
            {/* Quy trình đăng ký dynamic */}
            <section className="py-12 bg-gray-50 border-t border-gray-100">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8 uppercase">
                        {data.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {displayBenefits.map((item: any, index: number) => (
                            <StepBox 
                                key={`step-${item.key}-${index}`} 
                                icon={item.icon} 
                                title={item.title} 
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Tài liệu & Download dynamic */}
            {validDownloads.length > 0 && (
                <section className="py-10 bg-white border-b border-gray-100">
                    <div className="container mx-auto px-4">
                        {/* Thay đổi flexbox căn giữa để dàn các nút tròn đỏ trông cân đối hơn là ép grid cứng */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            {validDownloads.map((item: any, index: number) => (
                                <DownloadButton
                                    key={`download-${item.key}-${index}`}
                                    href={item.link}
                                    icon={item.icon2 || item.icon} // Fallback dùng tạm icon1 nếu icon2 rỗng
                                    label={item.label}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}