/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 常用正则表达式
 */

export namespace re {
    /**
     * 去除首尾空格
     * @param str 字符串
     */
    export function trim_ht_spaces( str: string ) {
        return str.trim();
    }

    /**
     * 去除所有空格
     * @param str 字符串
     */
    export function trim_all_spaces( str: string ) {
        return str.replace( /\s+/g, "" );
    }
}
