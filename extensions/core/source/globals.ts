/**
 * 全局变量管理
 */
export namespace globals {
    /** 全局对象 */
    export const __G__: any = globalThis || window || self;

    /** 新注册的全局变量 */
    const __posts__: Map<string, any> = new Map();

    /**
     * 注册全局变量
     * @param key 名称
     * @param value 值
     */
    export function register<T>(key: string, value: T) {
        if (__G__[key] === undefined) {
            __G__[key] = value;
            __posts__.set(key, value);
        }
        return value;
    }

    /**
     * 注销全局变量
     * @param key 名称
     */
    export function unregister(key: string) {
        if (__posts__.has(key)) {
            __posts__.delete(key);
            delete __G__[key];
        }
    }

    /**
     * 获取全局变量
     * @param key 名称
     */
    export function get<T>(key: string): T | undefined {
        if (__posts__.has(key)) {
            return __posts__.get(key) as T;
        }
        if (__G__[key] !== undefined) {
            return __G__[key] as T;
        }
        return undefined;
    }

    register("globals", globals);
}