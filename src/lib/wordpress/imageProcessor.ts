import { ProcessedImageResult } from '@/entities/ProcessedImageResult';
import { Agent, fetch as undiciFetch } from 'undici';

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

export function clearProcessedImagesCache(): void {
  if (processedImagesCache) {
    processedImagesCache.clear();
  }
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

    // 1. Nếu là ảnh tuyệt đối hoặc đang ở chế độ PREVIEW => Trả về URL ngay lập tức, né hoàn toàn Sharp/FS
    if (imageUrl.startsWith('http')) {
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

    // 2. Chỉ luồng SSG (Build thực tế) mới được phép động vào File System và Sharp
    if (import.meta.env.SSR || typeof window === 'undefined') {
      // DYNAMIC IMPORT các thư viện nặng ký vào đây để né lỗi sập Module ở Top-level
      const fs = await import('node:fs');
      const path = await import('node:path');
      
      let sharp;
      try {
        const sharpModule = await import('sharp');
        sharp = sharpModule.default || sharpModule;
        sharp.concurrency(1); // Cấu hình an toàn trong luồng runtime
      } catch (sharpLoadError) {
        console.error("🚨 Không thể load thư viện Sharp trên Server:", sharpLoadError.message);
        return defaultResult; // Trả về fallback nếu server thiếu thư viện native
      }

      const CACHE_DIR = path.resolve('.cache/images/pages');
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

        // Tạo các thư mục (Sử dụng cấu trúc an toàn)
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        if (!fs.existsSync(CACHE_DIR)) {
          fs.mkdirSync(CACHE_DIR, { recursive: true });
        }

        const srcSetParts: Record<string, string> = {};
        let needsRegenerate = reload;

        if (!needsRegenerate) {
          const originalExistsInCache = fs.existsSync(originalCachePath);
          const allResizedExistInCache = TARGET_WIDTHS.every(width => {
            const cacheResizedPath = path.join(CACHE_DIR, `${nameWithoutExt}-${width}w.webp`);
            return fs.existsSync(cacheResizedPath);
          });

          if (!originalExistsInCache || !allResizedExistInCache) {
            needsRegenerate = true;
          }
        }

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

          fs.writeFileSync(originalCachePath, nodeBuffer);

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

        if (!fs.existsSync(originalPublicPath)) {
          fs.copyFileSync(originalCachePath, originalPublicPath);
        }

        TARGET_WIDTHS.forEach(width => {
          const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
          const cacheResizedPath = path.join(CACHE_DIR, resizedFilename);
          const publicResizedPath = path.join(publicDir, resizedFilename);

          srcSetParts[width.toString()] = `/${publicDirBase}/${resizedFilename}`;

          if (!fs.existsSync(publicResizedPath)) {
            fs.copyFileSync(cacheResizedPath, publicResizedPath);
          }
        });

        const srcSet = TARGET_WIDTHS.map(w => `${srcSetParts[w]} ${w}w`).join(', ');

        return {
          src: `/${publicDirBase}/${originalFilename}`,
          alt,
          srcSet,
          srcSets: srcSetParts,
        };

      } catch (err) {
        processedImagesCache.delete(imageUrl);
        console.error(`[Error] Lỗi xử lý ảnh cấu trúc nội bộ: ${imageUrl}`, err);
        return defaultResult; // Trả về ảnh gốc thay vì quăng lỗi làm sập cả luồng SSR
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