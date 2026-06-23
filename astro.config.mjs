// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
//import cloudProviderFetchAdapter from "@wix/cloud-provider-fetch-adapter";
//import wix from "@wix/astro";
//import monitoring from "@wix/monitoring-astro";
import react from "@astrojs/react";
import sourceAttrsPlugin from "@wix/babel-plugin-jsx-source-attrs";
import dynamicDataPlugin from "@wix/babel-plugin-jsx-dynamic-data";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";
import postcssPseudoToData from "@wix/postcss-pseudo-to-data";
import cloudflare from "@astrojs/cloudflare";
import { loadEnv } from 'vite';

// Load biến môi trường
const { WC_URL } = loadEnv(process.env.NODE_ENV?? "development", process.cwd(), "");

// Bóc tách hostname (ví dụ từ http://127.0.0.1:10010 thành 127.0.0.1)
const wpHost = WC_URL ? new URL(WC_URL).hostname : '';

const isBuild = process.env.NODE_ENV == "production";

// https://astro.build/config
export default defineConfig({
  build: {
    inlineStylesheets: 'always'
  },
  output: "static",
  adapter: cloudflare(),
  integrations: [
    {
      name: "framewire",
      hooks: {
        "astro:config:setup": ({ injectScript, command }) => {
          if (command === "dev") {
            injectScript(
              "page",
              `import loadFramewire from "framewire.js";
              loadFramewire(true);`
            );
          }
        },
      },
    },
    tailwind(),
    // wix({
    //   htmlEmbeds: isBuild,
    //   auth: false,
    // }),
    // ...(isBuild ? [monitoring()] : []),
    react(isBuild ? {} : {
      babel: { plugins: [sourceAttrsPlugin, dynamicDataPlugin] },
    }),
    // Hook di chuyển ảnh từ public/images/ vào dist/images/ sau khi build xong
    {
      name: "move-generated-assets",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          if (!isBuild) return;

          const { existsSync, cpSync, rmSync } = await import('node:fs');
          const { fileURLToPath } = await import('node:url');
          const path = await import('node:path');

          try {
            // 1. Di chuyển thư mục images
            const srcDir = path.join(process.cwd(), 'public/images');
            const destDir = fileURLToPath(new URL('images/', dir));

            if (existsSync(srcDir)) {
              cpSync(srcDir, destDir, { recursive: true, force: true });
              console.log('✅ Đã copy toàn bộ images sang dist/');
              rmSync(srcDir, { recursive: true, force: true });
              console.log('🧹 Đã dọn sạch public/images/');
            }

            // 2. Di chuyển robots.txt và sitemap.xml
            const filesToMove = ['robots.txt', 'sitemap.xml'];
            filesToMove.forEach(file => {
              const srcFile = path.join(process.cwd(), 'public', file);
              const destFile = fileURLToPath(new URL(file, dir));
              if (existsSync(srcFile)) {
                cpSync(srcFile, destFile, { force: true });
                console.log(`✅ Đã copy ${file} sang dist/`);
                rmSync(srcFile, { force: true });
                console.log(`🧹 Đã dọn sạch public/${file}`);
              }
            });
            
          } catch (err) {
            console.error('❌ Lỗi khi xử lý file sau build:', err instanceof Error ? err.message : String(err));
          }
        }
      }
    }
  ],
  vite: {
    ssr: {
      external: ['node:buffer', 'node:fs', 'node:path'],
    },
    build: {
      rollupOptions: {
        external: ['node:buffer','node:fs', 'node:path']
      }
    },
    plugins: [customErrorOverlayPlugin()],
    cacheDir: 'node_modules/.cache/.vite',
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'zustand',
        'framer-motion',
        'date-fns',
        'clsx',
        'class-variance-authority',
        'tailwind-merge',
        '@radix-ui/*',
        //'@wix/*',
        'zod',
      ],
      exclude: [
        '@wix/image-kit',
        '@wix/astro',
        '@wix/*',
      ],
    },
    css: !isBuild ? {
      postcss: {
        plugins: [
          postcssPseudoToData(),
        ],
      },
    } : undefined,
  },
  //...(isBuild && { adapter: cloudProviderFetchAdapter({}) }),
  // 2. Chỉ sử dụng duy nhất dòng này ở cuối hoặc trong defineConfig
  devToolbar: {
    enabled: false,
  },
  image: {
    domains: [wpHost],
    service: passthroughImageService(),
  },
  server: {
    allowedHosts: true,
    host: true,
  },
  security: {
    checkOrigin: false
  }
});
