// Lấy tất cả các file .tsx trong thư mục tablePress
const components = import.meta.glob<{ default: any }>('../components/tablePress/*.tsx', { eager: true });
import { AppRouterProps, Pages } from '@/entities';
import parse from 'html-react-parser';
import React from 'react';
// Tạo một Map để tra cứu component theo shortcode
export const ComponentMap: Record<string, any> = {};

Object.entries(components).forEach(([path, module]) => {
    // Lấy tên file (vd: 'Home_01.tsx')
    const fileName = path.split('/').pop()?.replace('.tsx', '');

    if (fileName && module.default) {
        // Giả sử component có static property 'shortcode'
        // Nếu không, bạn có thể tự tạo key từ tên file: fileName.toLowerCase()
        const shortcode = module.default.shortcode || fileName.toLowerCase();
        ComponentMap[shortcode] = module.default;
    }
});

export const extractHTML = (page: Pages, props: AppRouterProps, more: any = {}) => {
    const options = {
        replace: (domNode) => {
            // Đảm bảo domNode là text node và có dữ liệu
            if (!domNode.data) return;

            const suffix = `_${page.lang}`;
            let hasShortcode = false;

            // Kiểm tra xem trong cụm text này có chứa bất kỳ shortcode nào của page không
            for (const key in page.contents) {
                const tbl = page.contents[key];
                if (domNode.data.includes(`[table id=${tbl.shortcode} /]`)) {
                    hasShortcode = true;
                    break; 
                }
            }

            // Nếu phát hiện có shortcode trong text block này
            if (hasShortcode) {
                // Tách chuỗi text lớn thành các dòng/phần tử nhỏ dựa trên cấu trúc shortcode
                // Quy tắc cắt: Tìm các đoạn có dạng [table id=... /]
                const parts = domNode.data.split(/(\[table id=\S+ \/\])/g);

                return React.createElement(
                    React.Fragment,
                    null,
                    parts.map((part, index) => {
                        // Nếu đoạn text con này chính là một shortcode
                        if (part.startsWith('[table id=') && part.endsWith('/]')) {
                            // Trích xuất lấy cái ID/Shortcode bên trong ra (ví dụ: "home_05")
                            const match = part.match(/id=(\S+)/);
                            const currentShortcode = match ? match[1] : '';

                            // Tìm dữ liệu tương ứng trong page.contents cho shortcode này
                            const currentTbl = page.contents.find(item => item.shortcode === currentShortcode);

                            if (currentTbl) {
                                const componentName = currentShortcode.endsWith(suffix) 
                                    ? currentShortcode.slice(0, -suffix.length) 
                                    : currentShortcode;
                                
                                const ComponentM = ComponentMap[componentName];
                                if (ComponentM) {
                                    return React.createElement(ComponentM, { 
                                        key: index, 
                                        page, 
                                        props, 
                                        data: currentTbl.data, 
                                        ...more 
                                    });
                                }
                            }
                        }
                        // Nếu chỉ là text thường hoặc khoảng trống giữa các shortcode thì trả về nguyên bản
                        return part;
                    })
                );
            }
        }
    };

    return parse(page.content, options);
};