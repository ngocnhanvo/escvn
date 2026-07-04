import he from 'he';
export const stripHtmlAndUnescape = (html: string): string => {
  if (!html) return '';
  // 1. Loại bỏ các thẻ HTML bằng Regex
  const regexStripHtml = /<[^>]*>?/gm;
  const plainText = html.replace(regexStripHtml, '');

  // 2. Giải mã các kí tự đặc biệt (entities) như &#34;, &nbsp;...
  return he.decode(plainText).replace(/\s+/g, ' ').trim();
};