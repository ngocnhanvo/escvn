import { ProcessedImageResult } from '@/entities';

interface ProcessImageOptions {
  imageUrl: string;
  alt?: string;
  wcUrl?: string;
  publicDirBase?: string;
  isPreview?: boolean;
}

export async function processAndStoreImage({
  imageUrl,
  alt,
  wcUrl,
  publicDirBase = 'images',
  isPreview = false,
}: ProcessImageOptions): Promise<ProcessedImageResult> {
  // Định nghĩa các kích thước chiều rộng (width) bạn muốn phân bổ
  const targetWidths = [20, 40, 100, 400, 800, 1200];
  // Kết quả mặc định dự phòng nếu gặp lỗi hoặc chạy ở Client
  const defaultResult: ProcessedImageResult = { src: imageUrl, alt: alt || '', srcSet: '', srcSets: {} };
  if (!imageUrl) return { src: '', srcSet: '', srcSets: {} };
  if (isPreview) { 
    defaultResult.src = wcUrl + imageUrl;
    defaultResult.srcSet = wcUrl + imageUrl;
    for (const width of targetWidths) {
      defaultResult.srcSets[width.toString()] = wcUrl + imageUrl;
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
      const timeoutId = setTimeout(() => controller.abort(), 60000); // Timeout 10s
      const res = await fetch(absoluteImageUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Astro-Image-Processor/1.0' }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);

        // 1. Lưu ảnh gốc trước để dự phòng
        const originalLocalPath = path.join(publicDir, originalFilename);
        if (!existsSync(originalLocalPath)) {
          writeFileSync(originalLocalPath, nodeBuffer);
        }

        // 2. Lặp qua danh sách kích thước để cắt ảnh bằng Sharp
        let srcSetPart: string[] = [];
        let srcSetParts: any = {};
        for (const width of targetWidths) {
          // Tạo tên file mới theo định dạng: ten-anh-400w.webp
          const resizedFilename = `${nameWithoutExt}-${width}w.webp`;
          const resizedLocalPath = path.join(publicDir, resizedFilename);
          const resizedPublicUrl = `/${publicDirBase}/${resizedFilename}`;

          if (!existsSync(resizedLocalPath)) {
            // Dùng sharp để vừa resize chiều rộng, vừa chuyển sang WebP
            await sharp(nodeBuffer)
              .resize({ width: width, withoutEnlargement: true }) // withoutEnlargement giúp ảnh nhỏ không bị phóng đại vỡ hình
              .webp({ quality: 80 })
              .toFile(resizedLocalPath);
          }

          srcSetPart.push(`${resizedPublicUrl} ${width}w`);
          if(!srcSetParts)
            srcSetParts = {[width.toString()]:resizedPublicUrl};
          else
            srcSetParts = { ...srcSetParts, [width.toString()]:resizedPublicUrl};
          
        }

        // Bản mặc định (src) sẽ lấy bản lớn nhất từ srcSets (thường là 1200w)
        const defaultSrc = `/${publicDirBase}/${originalFilename}`;

        return {
          src: defaultSrc,
          alt: alt || '',
          srcSet: srcSetPart.join(', '),
          srcSets: srcSetParts,
        };
      }
    } catch (err) {
      console.error(`Lỗi Server-side xử lý ảnh đa kích thước:`, err);
    }
  }

  return defaultResult;
}