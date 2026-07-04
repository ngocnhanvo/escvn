export const getContent = (pages: any, key: string, language: string, id?: number) => {
  let link: string | undefined = pages.filter((a) => {
    if (!a.slug) return false;
    return a.key === key && a.lang === language && (id ? a.id === id.toString() : true);
  })[0]?.slug;
  if (link)
    link = "/" + link;
  return link;
}