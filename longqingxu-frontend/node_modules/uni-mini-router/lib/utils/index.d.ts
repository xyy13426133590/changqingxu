/**
 * 获取url中的参数
 * @param path 完整路径
 * @returns
 */
export declare function getUrlParams(path: string): Record<string, string>;
/**
 * 设置参数
 * @param path 路径（无参数）
 * @param params （参数）
 * @returns
 */
export declare function setUrlParams(path: string, params: Record<string, string>): string;
/**
 * 去除拼接url产生的多余的/
 * @param url 目标路径
 */
export declare function beautifyUrl(url: string): string;
/**
 * url查询参数序列化
 * @param query url查询参数
 * @returns
 */
export declare function queryStringify(query: Record<string, string>): Record<string, string>;
/**
 * 判断query或params是否为空或者undefined
 * @param obj 待判断对象
 * @returns
 */
export declare function isEmptyObject(obj: undefined | null | Record<string, any>): boolean;
