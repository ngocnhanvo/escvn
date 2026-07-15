import { ProcessedImageResult } from '@/entities/ProcessedImageResult';
import { Agent, fetch as undiciFetch } from 'undici';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
sharp.concurrency(1);
interface ProcessImageOptions {
  imageUrl: string;
  alt?: string;
  wcUrl?: string;
  publicDirBase?: string;
  isPreview?: boolean;
}

const agent = new Agent({ connect: { family: 4, timeout: 30000 } });
const processedImagesCache = new Map<string, Promise<ProcessedImageResult>>();
const TARGET_WIDTHS = [40, 150, 300, 768, 1024, 1536, 2560];


export function clearProcessedImagesCache(): void {
  processedImagesCache.clear();
}

export async function processAndStoreImage({
  imageUrl,
  alt = '',
  wcUrl,
  publicDirBase = 'images',
  isPreview = false,
}: ProcessImageOptions): Promise<ProcessedImageResult> {
  
  if (!imageUrl) return { src: '', srcSet: '', srcSets: {} };

  if (processedImagesCache.has(imageUrl)) {
    return processedImagesCache.get(imageUrl)!;
  }

  const imageProcessPromise = (async (): Promise<ProcessedImageResult> => {
    const defaultResult: ProcessedImageResult = { src: imageUrl, alt, srcSet: '', srcSets: {} };

    if (isPreview) {
      const fullUrl = wcUrl ? `${wcUrl.replace(/\/$/, '')}/${imageUrl.replace(/^\//, '')}` : imageUrl;
      defaultResult.src = fullUrl;
      defaultResult.srcSet = fullUrl;
      for (const width of TARGET_WIDTHS) {
        defaultResult.srcSets[width.toString()] = fullUrl;
      }
      return defaultResult;
    }

    if (import.meta.env.SSR || typeof window === 'undefined') {

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
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

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

        // Lưu ảnh gốc (Không block luồng chính)
        const originalLocalPath = path.join(publicDir, originalFilename);
        if (!fs.existsSync(originalLocalPath)) {
          fs.writeFileSync(originalLocalPath, nodeBuffer);
        }

        const srcSetParts: Record<string, string> = {};
        
        // TỐI ƯU CỐT LÕI: Đẩy tất cả tác vụ resize vào Promise.all để Sharp xử lý SONG SONG
        await Promise.all(
          TARGET_WIDTHS.map(async (width) => {
            const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
            const resizedLocalPath = path.join(publicDir, resizedFilename);
            srcSetParts[width.toString()] = `/${publicDirBase}/${resizedFilename}`;

            if (!fs.existsSync(resizedLocalPath)) {
              await sharp(nodeBuffer)
                .resize({ width, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(resizedLocalPath);
            }
          })
        );

        // Map lại srcSet theo đúng thứ tự mảng widths ban đầu
        const srcSet = TARGET_WIDTHS.map(w => `${srcSetParts[w]} ${w}w`).join(', ');

        return {
          src: `/${publicDirBase}/${originalFilename}`,
          alt,
          srcSet,
          srcSets: srcSetParts,
        };

      } catch (err) {
        processedImagesCache.delete(imageUrl);
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