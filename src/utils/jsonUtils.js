/**
 * JSON工具函数
 * 提供安全的JSON字符串解析功能
 */

/**
 * 将字符串安全地转换为JSON对象
 * @param {string} jsonString - 需要转换的JSON字符串
 * @param {boolean} [silent=false] - 是否静默处理错误(不抛出异常)
 * @returns {Object|null} 解析后的JSON对象，解析失败时返回null
 */
export function safeParse(jsonString, silent = false) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        if (!silent) {
            console.error('JSON解析错误:', error);
        }
        return null;
    }
}

/**
 * 判断字符串是否是有效的JSON
 * @param {string} str - 需要验证的字符串
 * @returns {boolean} 是否是有效的JSON
 */
export function isValidJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
