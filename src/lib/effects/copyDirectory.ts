import fs from "node:fs";
import path from "node:path";

// Hàm copy thư mục
export function copyDirectory(src: string, dest: string) {
    // 1. Kiểm tra nếu thư mục nguồn không tồn tại thì không làm gì cả
    if (!fs.existsSync(src)) return;

    // 2. Tạo thư mục đích nếu chưa có

    if (fs.existsSync(dest)) {
        fs.rmSync(dest, {
            recursive: true,
            force: true,
        });
    }
    else {
        fs.mkdirSync(dest, { recursive: true });
    }

    // 3. Đọc danh sách file trong thư mục nguồn
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            // Nếu là thư mục, đệ quy copy
            copyDirectory(srcPath, destPath);
        } else {
            // Nếu là file, copy file
            fs.copyFileSync(srcPath, destPath);
        }
    }
}