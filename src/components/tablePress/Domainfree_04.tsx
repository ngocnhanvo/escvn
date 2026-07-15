import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { FaqItem } from '@/lib/utils/faq';

interface Domainfree_03 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    item?: any; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

export default function Domainfree_03(props: Domainfree_03) {
    const data = props.data;
    const sel = props.item;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!data || !data.items) return null;
    
    const domainItems = data.items;

    // Lọc ra danh sách câu hỏi thuộc về tld hiện tại
    const activeBenefits = domainItems.filter((item: any) => item.key === sel?.tld);

    // Fallback nếu không trùng key
    const displayBenefits = activeBenefits.length > 0
        ? activeBenefits
        : domainItems.filter((item: any) => item.key === (domainItems[0]?.key || 'id.vn'));

    if (displayBenefits.length === 0) return null;

    // Tìm video hợp lệ từ danh sách câu hỏi (phần tử nào có video thì lấy, nếu không có lấy fallback từ item đầu tiên có video)
    const activeVideoItem = displayBenefits.find((item: any) => item.video) || domainItems.find((item: any) => item.video);
    const videoUrl = activeVideoItem?.video || '';

    return (
        <>
            {/* FAQ & Video Dynamic */}
            <section className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-red-500 mb-10">
                        {data.title}
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Cột danh sách câu hỏi */}
                        <div className={videoUrl ? "lg:col-span-7" : "lg:col-span-12"}>
                            {displayBenefits.map((item: any, index: number) => (
                                <FaqItem
                                    key={`faq-${item.key}-${index}`}
                                    question={item.ask}
                                    answer={item.question}
                                />
                            ))}
                        </div>

                        {/* Cột hiển thị Video (Chỉ hiển thị nếu có link video hợp lệ) */}
                        {videoUrl && (
                            <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-md bg-black">
                                <video
                                    className="w-full h-auto aspect-video object-cover"
                                    src={videoUrl}
                                    controls
                                    preload="metadata"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}