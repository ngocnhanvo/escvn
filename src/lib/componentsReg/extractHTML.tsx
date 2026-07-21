// extractHTML.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import parse, { DOMNode, Text, HTMLReactParserOptions } from 'html-react-parser';
import { getRegisteredComponent } from './componentRegistry';

// Regex toàn cục (g) để tìm tất cả [table id=... /]
const SHORTCODE_GLOBAL_REGEX = /\[table id=(\S+)\s*\/\]/g;
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

                // Nếu có chứa ít nhất 1 shortcode
                if (SHORTCODE_GLOBAL_REGEX.test(textContent)) {
                    // Tách đoạn văn bản thành các mảng gồm cả text thường và shortcode
                    const parts = textContent.split(/(\[table id=\S+\s*\/\])/g);

                    return (
                        <>
                            {parts.map((part, idx) => {
                                const match = SHORTCODE_EXTRACT_KEY.exec(part);
                                
                                // Nếu không phải shortcode -> Trả về văn bản thuần
                                if (!match) return part;

                                const shortcode = match[1];
                                const table = contentsMap.get(shortcode);

                                if (!table) return null;

                                const Component = getRegisteredComponent(shortcode, page.lang);

                                if (!Component) {
                                    console.warn(`[extractHTML] Component not registered: ${shortcode}`);
                                    return null;
                                }

                                // Trả về Component đúng vị trí bên trong mảng node con
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