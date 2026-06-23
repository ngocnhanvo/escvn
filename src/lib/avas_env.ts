export const getAvas = (locals: App.Locals) => {
    const runtime = (locals as any).runtime;
    const env = runtime?.env;
    const WC_URL_CLIENT = env.WC_URL_CLIENT || import.meta.env.WC_URL_CLIENT || process.env.WC_URL_CLIENT || '';
    const RESEND_API_KEY = env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY || '';
    const TURNSTILE_SECRET_KEY = env.CLOUDFLARE_TURNSTILE_SECRET_KEY || import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '';
    const WC_URL = env.WC_URL || import.meta.env.WC_URL || process.env.WC_URL || '';
    return {
        WC_URL_CLIENT,
        RESEND_API_KEY,
        TURNSTILE_SECRET_KEY,
        WC_URL,
    }
}