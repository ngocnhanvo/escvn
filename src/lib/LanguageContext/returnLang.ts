export const returnLang = (pages: any, pathname: string, basename?: string) => {
  // Lấy slug từ URL hiện tại (ví dụ: /en/home -> en/home)
  const currentSlug = pathname.split('/').filter(Boolean).join('/');
  const exactPage = pages.find(p => p.slug === currentSlug);
  if (exactPage) {
    return exactPage.lang;
  }

  const pathSegments = currentSlug.split('/');
  if (pathSegments.length > 1) {
    const parentSlug = pathSegments[0]; // Lấy segment đầu tiên
    const parentPage = pages.find(p => p.slug === parentSlug);
    if (parentPage) {
      return parentPage.lang;
    }
  }

  if (pathSegments[0] === 'en') {
    return 'en';
  }

  return 'vi';
};