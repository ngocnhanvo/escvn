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
const processedImagesCache = new Map<string, Promise<ProcessedImageResult>>();
const TARGET_WIDTHS = [20, 40, 100, 400, 600, 700, 800, 1200];

// Cache module imports để tránh việc load đi load lại trong runtime
let fsModule: typeof import('node:fs') | null = null;
let pathModule: typeof import('node:path') | null = null;
let sharpModule: any = null;

export function clearProcessedImagesCache(): void {
  processedImagesCache.clear();
}

async function loadModules() {
  if (!fsModule) fsModule = await import('node:fs');
  if (!pathModule) pathModule = await import('node:path');
  if (!sharpModule) sharpModule = (await import('sharp')).default;
  return { fs: fsModule, path: pathModule, sharp: sharpModule };
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
      const { fs, path, sharp } = await loadModules();

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
        throw new Error(`Lỗi Server-side xử lý ảnh đa kích thước: ${err instanceof Error ? err.message : err}`);
      }
    }

    return defaultResult;
  })();

  processedImagesCache.set(imageUrl, imageProcessPromise);

  if (processedImagesCache.size > 1000) {
    const firstKey = processedImagesCache.keys().next().value;
    if (firstKey) processedImagesCache.delete(firstKey);
  }

  return imageProcessPromise;
}