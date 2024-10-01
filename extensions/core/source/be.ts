/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 布尔判断器
 */

export namespace be {
    /**
     * 是否未定义
     * @param v 任意值
     */
    export function absent( v: any ) {
        return undefined === v;
    }

    /**
     * 是否为 null
     * @param v
     */
    export function nil( v: any ) {
        return v === null;
    }

    /**
     * 是否为空
     * @param v 任意值
     */
    export function empty( v: any ) {
        return (
            v === null ||
            v === undefined ||
            v === 0 ||
            v === false ||
            v === "" ||
            v === "false"
        );
    }

    /**
     * 是否为真
     * @param v 任意值
     * @param strict 严格模式
     */
    export function yes( v: any, strict: boolean = false ) {
        return strict ? v === true : Boolean( v );
    }

    /**
     * 是否为 true
     * @param v 任意值
     */
    export function truely( v: any ) {
        return v === true;
    }

    /**
     * 是否为 false
     * @param v 任意值
     */
    export function falsy( v: any ) {
        return v === false;
    }

    /**
     * 是否为假
     * @param v 任意值
     * @param strict 严格模式
     */
    export function no( v: any, strict: boolean = false ) {
        return strict ? v === false : !Boolean( v );
    }

    /**
     * 是否为数值
     * @param v 任意值
     */
    export function digit( v: any ) {
        return typeof v === "number";
    }

    /**
     * 是否为字符串
     * @param v 任意值
     */
    export function literal( v: any ) {
        return typeof v === "string";
    }

    /**
     * 是否为函数、方法
     * @param v 任意值
     */
    export function method( v: any ) {
        return typeof v === "function";
    }

    /**
     * 是否为 Symbol
     * @param v 任意值
     */
    export function symbol( v: any ) {
        return typeof v === "symbol";
    }

    /**
     * 是否为数组
     * @param v 任意值
     */
    export function array( v: any ) {
        return (
            Array.isArray( v ) || Object.prototype.toString.call( v ) === "[object Array]"
        );
    }

    /**
     * 是否为对象
     * @param v 任意值
     */
    export function dict( v: any ) {
        return Object.prototype.toString.call( v ) === "[object Object]";
    }

    /**
     * 是否为正则表达式
     * @param v 任意值
     */
    export function regex( v: any ) {
        return Object.prototype.toString.call( v ) === "[object RegExp]";
    }


    /**
     * 是否网址
     * @param url 网址
     */
    export function is_url( url: string ) {
        return url.indexOf( "://" ) > -1;
    }
}
