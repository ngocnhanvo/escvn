import { Products } from "@/entities";
import { getNestedValue } from "@/lib/effects/getNestedValue";
//Gán thuộc tính của sản phẩm trên server sang client
export const mapProducts = function (products_server: Products[], products_client) {
    if (!products_client || products_client.length == 0)
        return [];

    let keyClients = [];
    products_client.forEach(item => {
        let itemP = products_server.find(a => String(a._id) == String(item._id) || String(a._id) == String(item.key));
        let laBienThe = false;
        if (!itemP) {
            itemP = products_server.find(serverProduct => {
                // Lấy danh sách các ngôn ngữ có trong item
                const languages = Object.keys(item.slug);

                // Kiểm tra: Có bất kỳ ngôn ngữ nào mà slug của server khớp với slug của item ko?
                return languages.some(lang =>
                    serverProduct.slug[lang] &&
                    serverProduct.slug[lang] === item.slug[lang]
                );
            });

            if(item)
                laBienThe = true;
        }
        
        // 2. Duyệt qua các cặp [key, value] của item
        Object.entries(item).forEach(([key, val]) => {
            if (key === 'key') {
                item.keyAPI = val;
                keyClients.push(key);
            } else if (key.startsWith('api-')) {
                const keyClient = key.slice(4);
                item[keyClient] = getNestedValue(itemP, val.toString());
                keyClients.push(keyClient);
            }
            else {
                keyClients.push(key);
            }
        });

        if (itemP) {
            Object.entries(itemP).forEach(([key]) => {
                if (keyClients.lastIndexOf(key) <= -1 && itemP[key])
                    item[key] = itemP[key];
            });
        }
    });

    return products_client;
}