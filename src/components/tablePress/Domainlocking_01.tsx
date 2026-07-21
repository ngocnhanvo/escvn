import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { FaqItem } from '@/lib/utils/faq';

interface Domainlocking_01 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    item?: any;
}

export default function Domainlocking_01(props: Domainlocking_01) {
    const data = props.data;
    const sel = props.item;

    if (!data || !data.items) return null;
    
    const domainItems = data.items;

    const activeBenefits = domainItems.filter((item: any) => item.key === sel?.tld);

    const displayBenefits = activeBenefits.length > 0
        ? activeBenefits
        : domainItems.filter((item: any) => item.key === (domainItems[0]?.key || 'id.vn'));

    if (displayBenefits.length === 0) return null;

    return (
        <>
            <section className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-red-500 mb-10">
                        {data.title}
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <div>
                            {displayBenefits.map((item: any, index: number) => {
                            // Lấy chuỗi đường dẫn hoặc chuỗi HTML của ảnh an toàn
                            let imageSrc = "";
                            if (typeof item.image === "string") {
                                imageSrc = item.image;
                            } else if (item.image && typeof item.image === "object") {
                                imageSrc = item.image.url || item.image.src || "";
                            }

                            // Nếu item.image là một chuỗi đường dẫn thuần (bắt đầu bằng / hoặc http), ta bọc nó thành thẻ img HTML
                            let imageTagStr = "";
                            if (imageSrc.trim() !== "") {
                                if (imageSrc.includes("<img")) {
                                    imageTagStr = imageSrc; // Nếu đã sẵn là thẻ img HTML thì giữ nguyên
                                } else {
                                    imageTagStr = `<img src="${imageSrc}" alt="${item.ask}" />`; // Nếu chỉ là đường dẫn text thì biến thành thẻ img
                                }
                            }

                            // Nối chuỗi câu trả lời với thẻ HTML hình ảnh
                            const combinedAnswer = imageTagStr !== ""
                                ? `${item.question}<br/><div class="mt-3 flex justify-center"><div class="w-full max-w-xl overflow-hidden flex justify-center [&>img]:w-full [&>img]:h-auto [&>img]:object-contain rounded-lg">${imageTagStr}</div></div>`
                                : item.question;

                            return (
                                <FaqItem
                                    key={`faq-${item.key}-${index}`}
                                    question={item.ask}
                                    answer={combinedAnswer}
                                />
                            );
                        })}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}