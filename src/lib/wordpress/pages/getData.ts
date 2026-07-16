// src/lib/wordpress/products/getData.ts
import { Pages } from "@/entities/Pages";
import { processAndStoreImage } from "../imageProcessor";
import { parse } from 'node-html-parser';
import { imgRegex, removeTargetImgRegex, tblPressRegex, imgRegexFull } from '../tablepress/tablePressProcessor';
import { replaceAllProperties } from '@/lib/i18n/replaceAllProperties';
import { WPInfo } from "@/entities/WPInfo";

export async function getData(allWPPages: any[], WC_URL: string, data_info: WPInfo, isPreview: boolean = false) { // Renamed function to match file name
  if (!WC_URL) {
    console.error('❌ LỖI: Biến WC_URL chưa được cấu hình trong Environment Variables.');
    return [];
  }

  try {
    const PagesData = allWPPages;
    let unifiedPages: Pages[] = [];
    PagesData.forEach((item: any) => {
      const id = item.id;
      const idP = item.acf?.origin_page_id || '';
      const key = item.acf?.key || '';
      const action = item.acf?.action || '';
      const lang = item.acf?.product_lang.value || 'vi';
      const slug = item.slug || '';
      const label = item.acf?.label || '';
      const title = item.acf?.title || '';
      const image = item.acf?.image?.url || '';
      const alt_image = item.acf?.image?.alt || '';
      const content = replaceAllProperties(item.acf?.content, data_info, lang) || '';
      const description = replaceAllProperties(item.acf?.description, data_info, lang) || '';

      let itemcp = unifiedPages.find((t) => t.id === id);
      if (itemcp == null) {
        itemcp = {
          id: id,
          idP: idP,
          key: key,
          lang: lang,
          slug: slug,
          label: label,
          title: title,
          description: description,
          content: content,
          action: action,
          image: { [lang]: { src: image, alt: alt_image } },
          tablePress: []
        };
        unifiedPages.push(itemcp);
      }
    });

    const home = unifiedPages.find(page => page.key === 'home' && (page.idP ?? '') == '');
    if (home) {
      const homeM = { ...home };
      homeM.slug = '';
      unifiedPages.unshift(homeM);
    }

    interface ImageTask {
      type: 'static' | 'html';
      page: Pages;
      key?: string;
      originalSrc?: string;
    }

    const pagesArray = Object.values(unifiedPages);
    const imageTasks: ImageTask[] = [];

    // Map lưu trữ định nghĩa hàm tải ảnh độc nhất (chưa kích hoạt gọi API ngay)
    const uniqueImageTaskResolvers = new Map<string, () => Promise<any>>();

    for (const p of pagesArray) {
      const reload = p.reload;
      // --- BƯỚC 1: Gom nhóm & Lọc trùng ảnh Static ---
      if (p.image) {
        for (const id of Object.keys(p.image)) {
          const url = p.image[id]?.src;
          if (!url) continue;
          
          imageTasks.push({ type: 'static', page: p, key: id });

          if (!uniqueImageTaskResolvers.has(url)) {
            // Đóng gói hàm gọi tải ảnh (Lazy evaluation) để kích hoạt theo kiểm soát sau
            uniqueImageTaskResolvers.set(url, () =>
              processAndStoreImage({
                imageUrl: url,
                alt: p.image[id].alt,
                WC_URL,
                publicDirBase: 'images/pages',
                isPreview: isPreview,
                reload
              })
            );
          }
        }
      }

      // --- BƯỚC 2: Gom nhóm & Lọc trùng ảnh trong HTML ---
      if (p.content && (import.meta.env.SSR || typeof window === 'undefined')) {
        p.content = p.content.replace(removeTargetImgRegex, '');
        const matches = Array.from(p.content.matchAll(imgRegex));

        for (const match of matches) {
          const originalSrc = match[1];
          if (originalSrc && !originalSrc.startsWith('data:')) {
            imageTasks.push({ type: 'html', page: p, originalSrc });

            if (!uniqueImageTaskResolvers.has(originalSrc)) {
              // Đóng gói hàm gọi tải ảnh (Lazy evaluation)
              uniqueImageTaskResolvers.set(originalSrc, () =>
                processAndStoreImage({
                  imageUrl: originalSrc,
                  WC_URL,
                  publicDirBase: 'images/pages',
                  isPreview: isPreview,
                  reload
                })
              );
            }
          }
        }
      }

      p.reload = undefined;
    }

    // --- BƯỚC 2.5: KÍCH HOẠT DOWNLOAD THEO TỪNG ĐỢT (CHUNKING) ---
    const CONCURRENCY_LIMIT = 8; // Chỉ cho phép tối đa 8 kết nối tải song song cùng một lúc
    const downloadResultsMap = new Map<string, any>(); // Map lưu trữ kết quả download thực tế thành công
    const downloadEntries = Array.from(uniqueImageTaskResolvers.entries());

    for (let i = 0; i < downloadEntries.length; i += CONCURRENCY_LIMIT) {
      const chunk = downloadEntries.slice(i, i + CONCURRENCY_LIMIT);

      // Tạo các Promise cho đợt hiện tại
      const chunkPromises = chunk.map(async ([url, fetchFn]) => {
        try {
          const result = await fetchFn();
          return { url, result };
        } catch (error) {
          console.error(`❌ Thất bại khi tải ảnh: ${url}`, error);
          return { url, result: null }; // Tránh lỗi 1 ảnh làm chết cả cụm tải
        }
      });

      // Đợi đợt hiện tại chạy hoàn tất
      const chunkResults = await Promise.all(chunkPromises);

      // Lưu kết quả tải vào Map tổng thể
      for (const res of chunkResults) {
        downloadResultsMap.set(res.url, res.result);
      }
    }

    // Map lưu trữ tạm thời các ảnh HTML đã xử lý theo từng page để replace 1 lần duy nhất
    const htmlImagesMap = new Map<Pages, Array<{ originalSrc: string; storedImage: any }>>();

    // 3. Phân bổ kết quả từ Map kết quả an toàn
    for (let i = 0, len = imageTasks.length; i < len; i++) {
      const task = imageTasks[i];

      if (task.type === 'static' && task.key) {
        const url = task.page.image[task.key]?.src;
        const storedImage = downloadResultsMap.get(url);

        task.page.image[task.key] = storedImage;
        if (task.page.image[task.key]?.src === '' || !storedImage) {
          task.page.image[task.key] = data_info.image[task.key];
        }
      }
      else if (task.type === 'html' && task.originalSrc) {
        const storedImage = downloadResultsMap.get(task.originalSrc);

        if (storedImage) {
          if (!htmlImagesMap.has(task.page)) {
            htmlImagesMap.set(task.page, []);
          }
          htmlImagesMap.get(task.page)!.push({ originalSrc: task.originalSrc, storedImage });
        }
      }
    }

    // 4. XỬ LÝ HTML VÀ SHORTCODE BẰNG NODE-HTML-PARSER
    for (const p of pagesArray) {
      if (p.content) {
        // Dọn dẹp thẻ noscript cơ bản trước khi đưa vào DOM Tree
        p.content = p.content.replace(/<\/?noscript>/gi, '');

        // Khởi tạo DOM Tree từ content
        const root = parse(p.content);

        // A. Xử lý triệt để phần TablePress Preview Wrap
        const tableWraps = root.querySelectorAll('.tablepress-preview-wrap');
        
        for (const wrap of tableWraps) {
          // Tìm data-table-id ở thẻ div bọc ngoài trước
          let tableId = wrap.getAttribute('data-table-id');
          
          // Nếu div không có, tìm tiếp xuống thẻ img bên trong
          if (!tableId) {
            const imgInside = wrap.querySelector('img');
            tableId = imgInside?.getAttribute('data-table-id') || '';
          }

          if (tableId) {
            // Thay thế cả cụm div lùng bùng thành chuỗi shortcode thuần túy
            wrap.replaceWith(`[table id=${tableId} /]`);
          } else {
            // Trường hợp lỗi giao diện làm trống rỗng nội dung/mất ID: Xóa sổ hoàn toàn
            wrap.remove();
          }
        }

        // Đồng bộ ngược lại chuỗi HTML sau khi dọn sạch TablePress rác vào content
        p.content = root.toString();

        // B. Thay đổi logic ảnh (giữ nguyên cơ chế map ảnh WebP và tối ưu cũ của bạn)
        const htmlImages = htmlImagesMap.get(p);
        if (htmlImages) {
          p.content = p.content.replace(imgRegexFull, (fullMatch, beforeSrc, src: string, afterSrc) => {
            if (isPreview) {
              src = src?.startsWith('/') ? `${WC_URL}${src}` : src;
              return `<img${beforeSrc}src="${src}"${afterSrc}>`;
            }
            else {
              const matchImg = htmlImages.find(item => item.originalSrc === src);
              if (!matchImg) return fullMatch;

              return `
                <picture style="width:inherit; height: inherit; display: inherit;">
                  <source srcset="${matchImg.storedImage.srcSet}" type="image/webp">
                  <img${beforeSrc}src="${matchImg.storedImage.src}"${afterSrc}>
                </picture>
              `;
            }
          });
        }
      }

      // Trích xuất shortcode xuống mảng p.contents
      if (p.content && (import.meta.env.SSR || typeof window === 'undefined')) {
        const parts = p.content.split(tblPressRegex);
        p.contents = [];
        const currentContent = p.content;

        for (let j = 0, len = parts.length; j < len; j++) {
          const part = parts[j];
          if (!part.trim()) continue;

          const isShortcode = /^[a-zA-Z0-9_-]+$/.test(part) && currentContent.includes(`[table id=${part} /]`);
          if (isShortcode) {
            p.contents.push({
              type: 'shortcode',
              shortcode: part,
              data: null
            });
          }
        }
      }
    }

    return pagesArray;
  }
  catch (err) {
    throw new Error(`Lỗi Pages.ts: ${err instanceof Error ? err.message : err}`);
  }
}