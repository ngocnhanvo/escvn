interface ImportMetaEnv {
  readonly WC_URL_CLIENT: string;
  readonly RESEND_API_KEY: string;
  readonly CLOUDFLARE_TURNSTILE_SECRET_KEY: string;
  readonly WC_URL: string;
  readonly WOO_KEY: string;
  readonly WOO_SECRET: string;
  readonly cacheAll: string;
  readonly cacheProduct: string;
  readonly cacheTablePress: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const getAvas = (locals: App.Locals) => {
    const runtimeEnv = locals == null ? {} : ((locals as any).runtime?.env ?? {});

    const getEnv = (key: string) => {
        // 1. Lấy từ runtime environment (Cloudflare / Node locals)
        if (runtimeEnv && key in runtimeEnv) return runtimeEnv[key];

        // 2. Lấy từ biến môi trường của Node.js (Vẫn chạy được dynamic access thoải mái)
        if (typeof process !== 'undefined' && process.env && key in process.env) {
            return process.env[key];
        }

        // 3. Với import.meta.env, bắt buộc phải viết tĩnh (Static Fallback) cho từng biến
        // Vite sẽ phân tích được đống này và thay thế giá trị chuẩn lúc build
        switch (key) {
            case 'WC_URL_CLIENT': return import.meta.env.WC_URL_CLIENT;
            case 'RESEND_API_KEY': return import.meta.env.RESEND_API_KEY;
            case 'CLOUDFLARE_TURNSTILE_SECRET_KEY': return import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
            case 'WC_URL': return import.meta.env.WC_URL;
            case 'WOO_KEY': return import.meta.env.WOO_KEY;
            case 'WOO_SECRET': return import.meta.env.WOO_SECRET;
            case 'cacheAll': return import.meta.env.cacheAll;
            case 'cacheProduct': return import.meta.env.cacheProduct;
            case 'cacheTablePress': return import.meta.env.cacheTablePress;
            default: return '';
        }
    };

    return {
        WC_URL_CLIENT: getEnv('WC_URL_CLIENT') ?? '',
        RESEND_API_KEY: getEnv('RESEND_API_KEY') ?? '',
        TURNSTILE_SECRET_KEY: getEnv('CLOUDFLARE_TURNSTILE_SECRET_KEY') ?? '',
        WC_URL: getEnv('WC_URL') ?? '',
        WOO_KEY: getEnv('WOO_KEY') ?? '',
        WOO_SECRET: getEnv('WOO_SECRET') ?? '',
        cacheAll: getEnv('cacheAll') ?? '',
        cacheProduct: getEnv('cacheProduct') ?? '',
        cacheTablePress: getEnv('cacheTablePress') ?? '',
    };
};