import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import { formatCurrencyValue } from '@/lib/stringUtils/formatCurrencyValue';
import { getCurrencyByKey } from '@/lib/stringUtils/getCurrencyByKey';
interface Tool_listdomain_00 {
    page: Pages;
    data: Record<string, any>;
    props?: AppRouterProps;
}
export default function Tool_listdomain_00(props: Tool_listdomain_00) {
    console.log(`props`, props);
    let data = props.data;
    if (!data)
        return null;
    if (!data.items)
        return null;

    let currency = getCurrencyByKey('vi');
    return (
        <>
            {data.items?.map((item, index) => (
                <div
                    key={index}
                    className={`bg-white px-4 py-4 border border-border-subtle text-center transition-all rounded-2xl`}
                >
                    <span className="text-primary font-bold text-lg">{item.domain}</span>
                    <span className="text-signal-red font-bold text-lg ml-2">{formatCurrencyValue(item.price, currency.code, 3)}</span>
                    {item.subprice?.length > 0 && (
                        <span className="text-[10px] pl-1 md:text-xs text-slate-500 italic">{item.subprice}</span>
                    )}
                </div>
            ))}
        </>
    );
}