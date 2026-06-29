// Lấy tất cả các file .tsx trong thư mục tablePress
const components = import.meta.glob<{ default: any }>('../components/tablePress/*.tsx', { eager: true });

// Tạo một Map để tra cứu component theo shortcode
export const ComponentMap: Record<string, any> = {};

Object.entries(components).forEach(([path, module]) => {
    // Lấy tên file (vd: 'Home_01.tsx')
    const fileName = path.split('/').pop()?.replace('.tsx', '');
    
    if (fileName && module.default) {
        // Giả sử component có static property 'shortcode'
        // Nếu không, bạn có thể tự tạo key từ tên file: fileName.toLowerCase()
        const shortcode = module.default.shortcode || fileName.toLowerCase();
        ComponentMap[shortcode] = module.default;
    }
});