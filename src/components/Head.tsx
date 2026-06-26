import { WPInfo } from "@/entities";
import interFont1 from "public/fonts/quicksand/v37/6xKtdSZaM9iE8KbpRA_hJFQNYuDyP7bh.woff2";
import interFont2 from "public/fonts/quicksand/v37/6xKtdSZaM9iE8KbpRA_hJVQNYuDyP7bh.woff2";
import interFont3 from "public/fonts/quicksand/v37/6xKtdSZaM9iE8KbpRA_hK1QNYuDyPw.woff2";

// 1. Định nghĩa bảng quy đổi giữa Short Lang và Full Locale
export const LOCALE_MAP: Record<string, string> = {
  vi: 'vi_VN',
  en: 'en_US',
  fr: 'fr_FR',
  ja: 'ja_JP',
  ko: 'ko_KR',
  // Bạn có thể thêm các ngôn ngữ khác của dự án vào đây
};

export interface HeadProps {
  title: string;
  description: string;
  ogImage?: string;
  lang: string;
  href: string;
  data_info: WPInfo;
}
export const Head = (props: HeadProps) => {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" hrefLang={props.lang} href={props.href} />
      <link
          rel="icon"
          href={props.data_info?.favicon[props.lang]?.srcSets["20"] || '/favicon.ico'}
      />
      <link 
        rel="preload" 
        as="image" 
        fetchPriority="high"
        /* Định nghĩa danh sách các file ảnh và kích thước chiều rộng (w) tương ứng */
        imageSrcSet={props.data_info?.mascot[props.lang]?.srcSet}
        /* Báo cho trình duyệt biết ở mỗi kích thước màn hình, ảnh này sẽ hiển thị rộng bao nhiêu */
        imageSizes="(max-width: 768px) 251px, 400px"
        crossOrigin="anonymous" 
      />
      <link
      rel="preload"
        href={interFont1}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      <link
        rel="preload"
        href={interFont2}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      <link
        rel="preload"
        href={interFont3}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={props.href} />
      <meta property="og:title" content={props.title} />
      <meta property="og:description" content={props.description} />
      <meta property="og:locale" content={LOCALE_MAP[props.lang]} />
      {props.ogImage && <meta property="og:image" content={props.ogImage} />}
      {props.ogImage && <meta property="og:image:width" content="1424" />}
      {props.ogImage && <meta property="og:image:height" content="752" />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={props.href} />
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      {props.ogImage && <meta name="twitter:image" content={props.ogImage} />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": props.data_info?.['tencongty'] || "Vibe Code Studio",
            "url": props.href,
            "description": props.description,
            "inLanguage": LOCALE_MAP[props.lang],
            "publisher": {
              "@type": "Organization",
              "name": props.data_info?.['tencongty'] || "Vibe Code Studio",
              "url": props.href,
              "contactPoint": {
                "@type": "ContactPoint",
                "email": props.data_info?.['email'] || "contact@vibecodestudio.com",
                "telephone": props.data_info?.['sodienthoai'] || "+84123456789",
                "contactType": "customer service",
                "areaServed": "VN",
                "availableLanguage": ["Vietnamese", "English"]
              }
            }
          })
        }}
      />
    </>
  );
};
