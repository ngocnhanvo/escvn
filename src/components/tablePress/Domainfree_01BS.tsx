import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import Gift from 'lucide-react/dist/esm/icons/gift';

interface Domainfree_01BSProps {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: '.id.vn' hoặc '.biz.vn') 
}

export default function Domainfree_01BS(props: Domainfree_01BSProps) {
    const data = props.data;
    const tld = props.tld;

    if (!data || !data.items || data.items.length === 0) return null;

    // Tìm item phù hợp với tld được truyền vào, nếu không tìm thấy thì lấy item đầu tiên hợp lệ 
    const currentItem = data.items.find((item: any) => item.key === tld && item.title) || data.items.find((item: any) => item.title);

    // Trường hợp data rỗng hoặc không có item nào chứa nội dung hợp lệ
    if (!currentItem) return null;

    // Hàm render chuỗi text có chứa ký tự xuống dòng (\n) thành các thẻ <br /> hoặc danh sách 
    const renderDescription = (text: any) => {
        if (!text || typeof text !== 'string') return null;
        return text.split('\n').map((str, index) => (
            <span key={index} className="block">
                {str}
            </span>
        ));
    };
    console.log("3. Giá trị gốc của trường image trong JSON:", currentItem.image);
    console.log("4. Giá trị src chuẩn bị đưa vào thẻ <img />:", currentItem.image?.src);
    return (
        <>
        <section className="bg-background py-12 md:py-20 px-4 sm:px-6 lg:px-8">
            {/* Container giới hạn chiều ngang giống boxed layout nhưng hiện đại hơn */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Cột trái: Nội dung chữ */}
                <div className="space-y-6 order-2 md:order-1">
                    <h3 className="font-heading text-2xl md:text-3xl text-primary font-bold text-center md:text-left border-b-2 border-accent pb-3 inline-block">
                        {currentItem.title}
                    </h3>

                    <div className="font-paragraph space-y-4 text-foreground leading-relaxed">
                        {/* Block 1: Khái niệm */}
                        {currentItem.title2 && (
                            <div className="bg-muted p-4 rounded-xl border border-border/50 hover:shadow-sm transition-shadow">
                                <span className="block font-heading text-lg font-bold text-primary mb-2">
                                    {currentItem.title2}
                                </span>
                                <div className="text-base text-foreground/90">
                                    {renderDescription(currentItem.description2)}
                                </div>
                            </div>
                        )}

                        {/* Block 2: Đối tượng đăng ký */}
                        {currentItem.title3 && (
                            <div className="bg-muted p-4 rounded-xl border border-border/50 hover:shadow-sm transition-shadow">
                                <span className="block font-heading text-lg font-bold text-primary mb-2 flex items-center gap-2">
                                    {currentItem.description3?.toLowerCase().includes('miễn phí') && (
                                        <Gift className="w-5 h-5 text-accent inline-block" />
                                    )}
                                    {currentItem.title3}
                                </span>
                                <div className="text-base text-foreground/90 space-y-1">
                                    {renderDescription(currentItem.description3)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cột phải: Hình ảnh xử lý động theo object giống Domainfree_01.tsx */}
                <div className="flex justify-center items-center order-1 md:order-2 p-4">
                    <div className="relative group max-w-md w-full">
                        {/* Hiệu ứng nền mờ phía sau ảnh cho hiện đại */}
                        <div className="absolute -inset-1 bg-gradient-to-r gap-2 from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>

                        <img
                            fetchPriority="high"
                            decoding="async"
                            src={currentItem.image?.src || "https://esc.vn/wp-content/uploads/2025/03/id_biz_pro_logo_01-463x348.png"}
                            alt={currentItem.image?.alt || currentItem.title || "Giới thiệu tên miền"}
                            className="relative bg-white rounded-2xl shadow-md object-contain w-full h-auto transform group-hover:scale-[1.02] transition duration-300 border border-border"
                            width="463"
                            height="348"
                        />
                    </div>
                </div>

            </div>
        </section>
        </>
    );
}