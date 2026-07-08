import { ProcessedImageResult } from '@/entities/ProcessedImageResult';
import { Agent, fetch as undiciFetch } from 'undici';

interface ProcessImageOptions {
  imageUrl: string;
  alt?: string;
  wcUrl?: string;
  publicDirBase?: string;
  isPreview?: boolean;
}

const agent = new Agent({ connect: { family: 4, timeout: 30000 } });

// Cache lưu Promise để chia sẻ tiến trình xử lý giữa các request đồng thời
const processedImagesCache = new Map<string, Promise<ProcessedImageResult>>();

export async function processAndStoreImage({
  imageUrl,
  alt,
  wcUrl,
  publicDirBase = 'images',
  isPreview = false,
}: ProcessImageOptions): Promise<ProcessedImageResult> {
  
  if (!imageUrl) return { src: '', srcSet: '', srcSets: {} };

  // 1. Nếu đã hoặc ĐANG xử lý ảnh này, trả về Promise đó ngay lập tức
  if (processedImagesCache.has(imageUrl)) {
    return processedImagesCache.get(imageUrl)!;
  }

  // 2. Tạo một Promise bao bọc toàn bộ quá trình xử lý
  const imageProcessPromise = (async (): Promise<ProcessedImageResult> => {
    const targetWidths = [20, 40, 100, 400, 600, 700, 800, 1200];
    const defaultResult: ProcessedImageResult = { src: imageUrl, alt: alt || '', srcSet: '', srcSets: {} };

    if (isPreview) {
      const fullUrl = wcUrl ? `${wcUrl.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}` : imageUrl;
      defaultResult.src = fullUrl;
      defaultResult.srcSet = fullUrl;
      for (const width of targetWidths) {
        defaultResult.srcSets[width.toString()] = fullUrl;
      }
      return defaultResult;
    }

    if (import.meta.env.SSR || typeof window === 'undefined') {
      const { writeFileSync, mkdirSync, existsSync } = await import('node:fs');
      const path = await import('node:path');
      const sharp = (await import('sharp')).default;

      let absoluteImageUrl = imageUrl;
      if (absoluteImageUrl.startsWith('/') && wcUrl) {
        absoluteImageUrl = `${wcUrl.replace(/\/$/, '')}${absoluteImageUrl}`;
      }

      const originalFilename = absoluteImageUrl.split('/').pop()?.split('?')[0];
      if (!originalFilename) return defaultResult;

      const ext = path.extname(originalFilename);
      const nameWithoutExt = path.basename(originalFilename, ext);
      const publicDir = path.resolve('public', publicDirBase);

      try {
        if (!existsSync(publicDir)) {
          mkdirSync(publicDir, { recursive: true });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Timeout 60s như bạn set bên dưới
        
        const res = await undiciFetch(absoluteImageUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Astro-Image-Processor/1.0' },
          dispatcher: agent,
        });
        clearTimeout(timeoutId);

        if (!res.ok) return defaultResult;

        const buffer = await res.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);

        // Lưu ảnh gốc
        const originalLocalPath = path.join(publicDir, originalFilename);
        if (!existsSync(originalLocalPath)) {
          writeFileSync(originalLocalPath, nodeBuffer);
        }

        // Xử lý resize đa kích thước
        const srcSetPart: string[] = [];
        const srcSetParts: Record<string, string> = {};

        for (const width of targetWidths) {
          const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
          const resizedLocalPath = path.join(publicDir, resizedFilename);
          const resizedPublicUrl = `/${publicDirBase}/${resizedFilename}`;

          if (!existsSync(resizedLocalPath)) {
            await sharp(nodeBuffer)
              .resize({ width: width, withoutEnlargement: true })
              .webp({ quality: 80 })
              .toFile(resizedLocalPath);
          }

          srcSetPart.push(`${resizedPublicUrl} ${width}w`);
          srcSetParts[width.toString()] = resizedPublicUrl;
        }

        const defaultSrc = `/${publicDirBase}/${originalFilename}`;
        return {
          src: defaultSrc,
          alt: alt || '',
          srcSet: srcSetPart.join(', '),
          srcSets: srcSetParts,
        };

      } catch (err) {
        // Nếu lỗi xảy ra, XÓA Promise lỗi khỏi cache để request sau có thể thử lại
        processedImagesCache.delete(imageUrl);
        throw new Error(`Lỗi Server-side xử lý ảnh đa kích thước: ${err instanceof Error ? err.message : err}`);
      }
    }

    return defaultResult;
  })();

  // 3. Đưa Promise vào Map NGAY LẬP TỨC để các request đồng thời khác ăn theo
  processedImagesCache.set(imageUrl, imageProcessPromise);

  // Giới hạn bộ nhớ cache (Tránh tràn RAM khi chạy SSR lâu dài)
  if (processedImagesCache.size > 1000) {
    const firstKey = processedImagesCache.keys().next().value;
    if (firstKey) processedImagesCache.delete(firstKey);
  }

  // 4. Chờ và trả ra kết quả cuối cùng
  return imageProcessPromise;
}