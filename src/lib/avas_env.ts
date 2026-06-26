export const getAvas = (locals: App.Locals) => {
    const runtimeEnv = locals == null ? {} : ((locals as any).runtime?.env ?? {});

    const getEnv = (key: string) => {
        return (
            runtimeEnv[key] ??
            process.env[key] ??
            import.meta.env[key] ??
            ''
        );
    };

    return {
        WC_URL_CLIENT: getEnv('WC_URL_CLIENT'),
        RESEND_API_KEY: getEnv('RESEND_API_KEY'),
        TURNSTILE_SECRET_KEY: getEnv('CLOUDFLARE_TURNSTILE_SECRET_KEY'),
        WC_URL: getEnv('WC_URL'),
    };
};