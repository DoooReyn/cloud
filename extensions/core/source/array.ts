/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 数组操作
 */

import { digit } from "./digit";

export namespace array {
    /**
     * 打乱数组
     * @param list 数组
     */
    export function shuffle( list: any[] ) {
        let pid = -1;
        let nid = 0;
        let length = list.length;
        while ( ++pid < length ) {
            nid = digit.random_integer( pid, length );
            [ list[nid], list[pid] ] = [ list[pid], list[nid] ];
        }
        return list;
    }

    /**
     * 打乱数组
     * @param list 数组
     */
    export function shuffle_sort( list: any[] ) {
        return list.sort( () => digit.random() - 0.5 );
    }

    /**
     * 交换数组中的两个元素
     * @param list 数组
     * @param n1 索引 1
     * @param n2 索引 2
     */
    export function swap( list: any[], n1: number, n2: number ) {
        const len = list.length;
        if ( n1 >= 0 && n1 < len && n2 >= 0 && n2 < len ) {
            [ list[n1], list[n2] ] = [ list[n2], list[n1] ];
        }
        return list;
    }

    /**
     * 提取元素
     * @param list 数组
     * @param target 目标元素
     * @param compare 比较方法
     * @param sequence 是否按顺序输出（默认逆序）
     * @returns
     */
    export function pick_values(
        list: any[],
        target: any,
        compare: ( item: any ) => boolean,
        sequence: boolean = false,
    ) {
        const ret: any[] = [];
        list.forEach( ( v, i ) => {
            if ( compare( v ) ) {
                sequence ? ret.push( v ) : ret.unshift( v );
            }
        } );
        return ret;
    }

    /**
     *
     * @param list 数组
     * @param target 目标元素
     * @param compare 比较方法
     * @param sequence 是否按顺序输出（默认逆序）
     * @returns
     */
    export function pick_indexes(
        list: any[],
        target: any,
        compare: ( item: any ) => boolean,
        sequence: boolean = false,
    ) {
        const ret: number[] = [];
        list.forEach( ( v, i ) => {
            if ( compare( v ) ) {
                sequence ? ret.push( i ) : ret.unshift( i );
            }
        } );
        return ret;
    }

    /**
     * 删除指定索引范围内的所有元素
     * @param list 数组
     * @param indexes 索引数组
     * @param sorted 是否排序过（需要逆向排序）
     */
    export function remove_indexes(
        list: any[],
        indexes: number[],
        sorted: boolean = false,
    ) {
        if ( !sorted ) {
            sort( indexes, false );
        }
        indexes.forEach( ( v ) => list.splice( v, 1 ) );
    }

    /**
     * 数值数组排序
     * @param list 数值数组
     * @param sequence 是否按顺序输出（默认正序）
     * @returns
     */
    export function sort( list: number[], sequence: boolean = true ) {
        return list.sort( ( a, b ) => ( sequence ? a - b : b - a ) );
    }

    /**
     * 删除所有元素
     * @param list 数组
     * @param callback 删除回调
     */
    export function remove_all( list: any[], callback?: ( item: any ) => any ) {
        if ( callback ) {
            for ( let i = list.length - 1; i >= 0; i-- ) {
                callback( list[i] );
                list.splice( i, 1 );
            }
        } else {
            list.length = 0;
        }
    }

    /**
     * 删除指定数量的元素
     * @param list 数组
     * @param count 数量
     * @param callback 删除回调
     */
    export function remove_many( list: any[], count: number, callback?: ( item: any ) => any ) {
        if ( callback ) {
            for ( let i = list.length - 1; i >= 0; i-- ) {
                if ( --count < 0 ) {
                    break;
                }
                callback( list[i] );
                list.splice( i, 1 );
            }
        } else {
            list.length = 0;
        }
    }
}
