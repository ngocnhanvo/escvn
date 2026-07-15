import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import Gift from 'lucide-react/dist/esm/icons/gift';

interface Domainfree_01BS {
    page: Pages;
    data: any;
    props?: AppRouterProps;
    setLtd?: (a: string) => void;
    tld?: string; // key nhận từ parent (ví dụ: 'id.vn' hoặc 'biz.vn')
}

export default function Domainfree_01BS(props: Domainfree_01BS) {
    const data = props.data;
    const tld = props.tld;
    console.log(`data`, data);
    if (!data || !data.items) return null;

    const domainItems = data.items;

    return (
        <>
            <div>
                <span>DEMO BS</span>
            </div>
            
        </>
    );
}