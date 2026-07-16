import { ProcessedImageResult } from '@/entities/ProcessedImageResult';
import { Agent, fetch as undiciFetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

sharp.concurrency(1);

interface ProcessImageOptions {
  imageUrl: string;
  alt?: string;
  WC_URL?: string;
  publicDirBase?: string;
  isPreview?: boolean;
  reload?: boolean;
}

const agent = new Agent({ connect: { family: 4, timeout: 30000 } });
const processedImagesCache = new Map<string, Promise<ProcessedImageResult>>();
const TARGET_WIDTHS = [40, 150, 300, 768, 1024, 1536, 2560];

// Thư mục .cache nằm ở gốc dự án (ngang cấp với src)
const CACHE_DIR = path.resolve('.cache/images/pages');

export function clearProcessedImagesCache(): void {
  processedImagesCache.clear();
}

export async function processAndStoreImage({
  imageUrl,
  alt = '',
  WC_URL,
  publicDirBase = 'images',
  isPreview = false,
  reload = false
}: ProcessImageOptions): Promise<ProcessedImageResult> {

  if (!imageUrl) return { src: '', srcSet: '', srcSets: {} };

  if (processedImagesCache.has(imageUrl)) {
    return processedImagesCache.get(imageUrl)!;
  }

  const imageProcessPromise = (async (): Promise<ProcessedImageResult> => {
    const defaultResult: ProcessedImageResult = { src: imageUrl, alt, srcSet: '', srcSets: {} };

    if(imageUrl.startsWith('http')) {
      defaultResult.src = imageUrl;
      defaultResult.srcSet = imageUrl;
      for (const width of TARGET_WIDTHS) {
        defaultResult.srcSets[width.toString()] = imageUrl;
      }
      return defaultResult;
    }

    if (isPreview) {
      const fullUrl = WC_URL ? `${WC_URL.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}` : imageUrl;
      defaultResult.src = fullUrl;
      defaultResult.srcSet = fullUrl;
      for (const width of TARGET_WIDTHS) {
        defaultResult.srcSets[width.toString()] = fullUrl;
      }
      return defaultResult;
    }

    if (import.meta.env.SSR || typeof window === 'undefined') {
      let absoluteImageUrl = imageUrl;
      if (absoluteImageUrl.startsWith('/') && WC_URL) {
        absoluteImageUrl = `${WC_URL.replace(/\/$/, '')}${absoluteImageUrl}`;
      }

      const originalFilename = absoluteImageUrl.split('/').pop()?.split('?')[0];
      if (!originalFilename) return defaultResult;

      try {
        const ext = path.extname(originalFilename);
        const nameWithoutExt = path.basename(originalFilename, ext);
        
        const publicDir = path.resolve('public', publicDirBase);
        const originalCachePath = path.join(CACHE_DIR, originalFilename);
        const originalPublicPath = path.join(publicDir, originalFilename);

        // Tạo các thư mục cần thiết
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        if (!fs.existsSync(CACHE_DIR)) {
          fs.mkdirSync(CACHE_DIR, { recursive: true });
        }

        const srcSetParts: Record<string, string> = {};
        let needsRegenerate = reload;

        // BƯỚC 1: KIỂM TRA TOÀN BỘ FILE CACHE CÓ SẴN CHƯA (NẾU KHÔNG RELOAD)
        if (!needsRegenerate) {
          // Kiểm tra xem cả file gốc lẫn tất cả các file resized (.webp) có nằm trong .cache không
          const originalExistsInCache = fs.existsSync(originalCachePath);
          const allResizedExistInCache = TARGET_WIDTHS.every(width => {
            const cacheResizedPath = path.join(CACHE_DIR, `${nameWithoutExt}-${width}w.webp`);
            return fs.existsSync(cacheResizedPath);
          });

          // Nếu thiếu bất kỳ file nào trong .cache, ta đánh dấu cần chạy lại quy trình tải & resize
          if (!originalExistsInCache || !allResizedExistInCache) {
            needsRegenerate = true;
          }
        }

        // BƯỚC 2: NẾU THIẾU CACHE HOẶC RELOAD = TRUE => TẢI MỚI & RUN SHARP LƯU VÀO CACHE
        if (needsRegenerate) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const res = await undiciFetch(absoluteImageUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Astro-Image-Processor/1.0' },
            dispatcher: agent,
          });
          clearTimeout(timeoutId);

          if (!res.ok) return defaultResult;

          const buffer = await res.arrayBuffer();
          const nodeBuffer = Buffer.from(buffer);

          // Ghi ảnh gốc vào thư mục .cache
          fs.writeFileSync(originalCachePath, nodeBuffer);

          // Tạo các bản resized song song và lưu thẳng vào .cache
          await Promise.all(
            TARGET_WIDTHS.map(async (width) => {
              const cacheResizedPath = path.join(CACHE_DIR, `${nameWithoutExt}-${width}w.webp`);
              await sharp(nodeBuffer)
                .resize({ width, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(cacheResizedPath);
            })
          );
        }

        // BƯỚC 3: COPY TẤT CẢ FILE TỪ .CACHE SANG PUBLIC (Cực kỳ nhanh vì chỉ là I/O file thông thường)
        // 3.1. Copy ảnh gốc sang public (để fallback src)
        if (!fs.existsSync(originalPublicPath)) {
          fs.copyFileSync(originalCachePath, originalPublicPath);
        }

        // 3.2. Copy các file webp đã resize sang public và map dữ liệu đầu ra
        TARGET_WIDTHS.forEach(width => {
          const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
          const cacheResizedPath = path.join(CACHE_DIR, resizedFilename);
          const publicResizedPath = path.join(publicDir, resizedFilename);

          srcSetParts[width.toString()] = `/${publicDirBase}/${resizedFilename}`;

          if (!fs.existsSync(publicResizedPath)) {
            fs.copyFileSync(cacheResizedPath, publicResizedPath);
          }
        });

        // Tạo chuỗi srcSet hoàn chỉnh theo đúng thứ tự mảng widths ban đầu
        const srcSet = TARGET_WIDTHS.map(w => `${srcSetParts[w]} ${w}w`).join(', ');

        return {
          src: `/${publicDirBase}/${originalFilename}`,
          alt,
          srcSet,
          srcSets: srcSetParts,
        };

      } catch (err) {
        processedImagesCache.delete(imageUrl);
        console.error(`[Error] Lỗi xử lý ảnh: ${imageUrl}`, err);
        throw new Error(`Lỗi Server-side xử lý ảnh đa kích thước: ${imageUrl}`);
      }
    }

    return defaultResult;
  })();

  processedImagesCache.set(imageUrl, imageProcessPromise);

  if (processedImagesCache.size > 10) {
    const firstKey = processedImagesCache.keys().next().value;
    if (firstKey) processedImagesCache.delete(firstKey);
  }

  return imageProcessPromise;
}