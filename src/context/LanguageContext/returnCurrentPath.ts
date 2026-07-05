export const returnCurrentPath = (baseName?: string) => {
  let currentPath = location.pathname.startsWith(baseName) ? location.pathname.substring(baseName.length) : location.pathname;
  currentPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;
  currentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
  return currentPath;
};