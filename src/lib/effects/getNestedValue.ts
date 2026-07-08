export const getNestedValue = function (obj: any, pathString: string) {
  if (!obj || !pathString) return undefined;
  let cleanPath = pathString.replace(/\?/g, '').replace(/\[(\d+)\]/g, '.$1');
  const keys = cleanPath.split('.').filter(Boolean);
  return keys.reduce((current, key) => {
    return (current && current[key] !== undefined) ? current[key] : undefined;
  }, obj);
}