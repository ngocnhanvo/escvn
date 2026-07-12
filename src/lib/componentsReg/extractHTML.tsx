// extractHTML.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import parse from 'html-react-parser';
import { getRegisteredComponent } from './componentRegistry';

const SHORTCODE_REGEX = /\[table id=(\S+)\s*\/\]/;
const SHORTCODE_SPLIT_REGEX = /(\[table id=\S+\s*\/\])/g;

export const extractHTML = (
    page: Pages,
    props: AppRouterProps,
    more: any = {}
) => {
    if (!page?.content) return null;
    
    const contentsMap = new Map(
        (page.contents ?? [])
            .filter(item => item?.shortcode)
            .map(item => [item.shortcode, item])
    );

    const parts = page.content.split(SHORTCODE_SPLIT_REGEX);

    return (
        <>
            {parts.map((part, index) => {
                const match = SHORTCODE_REGEX.exec(part);

                if (!match) {
                    return parse(part);
                }

                const shortcode = match[1];
                const table = contentsMap.get(shortcode);

                if (!table) {
                    return parse(part);
                }

                const Component = getRegisteredComponent(shortcode, page.lang);

                if (!Component) {
                    console.warn(`[extractHTML] Component not registered: ${shortcode}`);
                    return null;
                }

                return (
                    <Component
                        key={`sc-${shortcode}-${index}`}
                        page={page}
                        props={props}
                        data={table.data}
                        {...more}
                    />
                );
            })}
        </>
    );
};