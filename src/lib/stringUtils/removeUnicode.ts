export const removeUnicode = (decodedStr: string) => {
  return decodedStr
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}