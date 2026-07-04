//components.tsx
import { AppRouterProps } from '@/entities/AppRouterProps';
import { Pages } from '@/entities/Pages';
import parse from 'html-react-parser';
import React from 'react';
const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// Chuẩn hóa Regex bắt linh hoạt cả trường hợp có hoặc không có khoảng trắng: [table id=abc /] hoặc [table id=abc/]
const SHORTCODE_GLOBAL_REGEX = /\[table id=(\S+)\s*\/\]/g;

const components = import.meta.glob<{ default: any }>('../components/tablePress/*.tsx');
const loadedComponents = new Map<string, any>();

export const extractHTML = (page: Pages, props: AppRouterProps, more: any = {}) => {
  if (!page || !page.content) return '';
  const suffix = `_${page.lang}`;

  // 1. Tạo Map để tra cứu nhanh data table
  const contentsMap = new Map<string, any>();

  // 2. Tải trước toàn bộ Component cần thiết
  if (Array.isArray(page.contents)) {
    for (const item of page.contents) {
      if (!item || !item.shortcode) continue;

      contentsMap.set(item.shortcode, item);

      const componentName = capitalizeFirstLetter(item.shortcode.endsWith(suffix)
        ? item.shortcode.slice(0, -suffix.length)
        : item.shortcode);
      const pathKey = `../components/tablePress/${componentName}.tsx`;
      if (components[pathKey] && !loadedComponents.has(componentName)) {
        const module = React.lazy(components[pathKey]);
        loadedComponents.set(componentName, module);
      }
    }
  }

  // 3. Sử dụng cấu trúc lưu trữ mảng JSX để render thay vì phụ thuộc async vào hàm replace của thư viện
  // Tiến hành cắt page.content theo shortcode
  const parts = page.content.split(/(\[table id=\S+\s*\/\])/g);

  return (
    <>
      {parts.map((part, index) => {
        // Kiểm tra định dạng shortcode một cách linh hoạt bằng Regex
        const match = part.match(/\[table id=(\S+)\s*\/\]/);
        
        if (match) {
          const shortcode = match[1]; // Lấy được chính xác mã "home_00" không lo khoảng trắng
          const tbl = contentsMap.get(shortcode);
          
          if (!tbl) return parse(part); // Nếu không có data thì render text thường

          const componentName = capitalizeFirstLetter(shortcode.endsWith(suffix)
            ? shortcode.slice(0, -suffix.length)
            : shortcode);

          const Component = loadedComponents.get(componentName);
          
          return Component ? (
            <Component
              key={`sc-${shortcode}-${index}`}
              page={page}
              props={props}
              data={tbl.data}
              {...more}
            />
          ) : parse(part);
        }

        // Nếu là đoạn HTML thông thường thì dùng html-react-parser để dịch ra giao diện
        return parse(part);
      })}
    </>
  );
};