import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { FaqItem } from '@/lib/utils/faq';


interface Domainregister_03 {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

export default function Domainregister_03(props: Domainregister_03) {
    const data = props.data;
    const tld = props.tld;

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!data || !data.items) return null;

    return (
        <>
            <section className="py-12 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-red-500 mb-10">
                        {data.title}
                    </h2>
                    <div>
                        {data.items?.map((item: any, index: number) => (
                            <FaqItem
                                key={`faq-${item.key}-${index}`}
                                question={item.ask}
                                answer={item.question}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}