import he from 'he';

export const escapeHtml = (unsafe: string): string => {
  if (!unsafe) return '';
  return he.encode(unsafe);
};