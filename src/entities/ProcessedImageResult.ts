export interface ProcessedImageResult {
  alt?: string;
  src?: string;  
  src_key?: string;   // Đường dẫn ảnh mặc định (bản lớn nhất hoặc ảnh gốc)
  srcSet?: string;
  srcSets?: Record<string, string>;   // Chuỗi srcSet chứa nhiều kích thước phục vụ responsive
}
