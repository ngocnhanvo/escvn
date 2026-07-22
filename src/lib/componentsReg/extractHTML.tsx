// extractHTML.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import parse, { DOMNode, Text, HTMLReactParserOptions } from 'html-react-parser';
import { getRegisteredComponent } from './componentRegistry';

const SHORTCODE_TEST_REGEX = /\[table id=\S+\s*\/\]/;
const SHORTCODE_EXTRACT_KEY = /\[table id=(\S+)\s*\/\]/;

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

    const options: HTMLReactParserOptions = {
        replace: (domNode: DOMNode) => {
            if (domNode instanceof Text && domNode.data) {
                const textContent = domNode.data;

                // Dùng regex không có cờ 'g' ở đây
                if (SHORTCODE_TEST_REGEX.test(textContent)) {
                    const parts = textContent.split(/(\[table id=\S+\s*\/\])/g);

                    return (
                        <>
                            {parts.map((part, idx) => {
                                const match = SHORTCODE_EXTRACT_KEY.exec(part);
                                
                                if (!match) return part;

                                const shortcode = match[1];
                                const table = contentsMap.get(shortcode);

                                if (!table) return null;

                                const Component = getRegisteredComponent(shortcode, page.lang);

                                if (!Component) {
                                    console.warn(`[extractHTML] Component not registered: ${shortcode}`);
                                    return null;
                                }

                                return (
                                    <Component
                                        key={`sc-${shortcode}-${idx}`}
                                        page={page}
                                        props={props}
                                        data={table.data}
                                        {...more}
                                    />
                                );
                            })}
                        </>
                    );
                }
            }
        },
    };

    return parse(page.content, options);
};