import { Pages } from "@/entities/Pages";
import { getNestedValue } from "@/lib/effects/getNestedValue";
//Gán thuộc tính của sản phẩm trên server sang client
export const mapPages = function (pages_server: Pages[], pages_client) {
    if (!pages_client || pages_client.length == 0)
        return [];

    let keyClients = [];
    pages_client.forEach(item => {
        if (item?.key) {
            let itemP = pages_server?.find(a => String(a?.id) == String(item?.id) || String(a?.id) == String(item?.key));
            if (!itemP) {
                itemP = pages_server?.find(pageServer => {
                    // Lấy danh sách các ngôn ngữ có trong item
                    const languages = Object.keys(item?.slug || {});

                    // Kiểm tra: Có bất kỳ ngôn ngữ nào mà slug của server khớp với slug của item ko?
                    return languages?.some(lang =>
                        pageServer?.slug?.[lang] &&
                        pageServer?.slug?.[lang] === item?.slug?.[lang]
                    );
                });
            }

            // 2. Duyệt qua các cặp [key, value] của item
            Object.entries(item).forEach(([key, val]) => {
                if (key === 'key') {
                    item.keyAPI = val;
                }
                else if (key.startsWith('api-') && itemP) {
                    const keyClient = key.slice(4);
                    item[keyClient] = getNestedValue(itemP, val.toString());
                    console.log(`item[keyClient]`, item[keyClient], 'val', val);
                }
            });
        }
    });

    return pages_client;
}