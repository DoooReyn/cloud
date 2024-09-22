/**
 * @Author: Reyn jl88744653@gmail.com
 * @Description: 通用定时器
 */

import { datetime } from "./datetime";

export namespace scheduler {

    /** 延迟回调 */
    type NextHandler = ( ...args: any[] ) => any;
    
    /** 重复回调 */
    type RepeatHandler = ( current: number, total: number, ...args: any[] ) => any;
    
    /** 永远 */
    const REPEAT_FOREVER = -1;
    
    /** 运行中的定时器 */
    const timers: Map<number, boolean> = new Map();

    /**
     * 延迟执行
     * @param delay 延迟
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function next( delay: number, caller: any, method: NextHandler, ...args: any[] ) {
        const tid = setTimeout( function () {
            method.apply( caller, args );
        }, delay );
        timers.set( tid, true);
        return tid;
    }

    /**
     * 延迟到下一个节拍执行
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function next_tick( caller: any, method: NextHandler, ...args: any[] ) {
        return next( datetime.TIME_ZERO, caller, method, ...args );
    }

    /**
     * 延迟到下一帧执行
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function next_frame( caller: any, method: NextHandler, ...args: any[] ) {
        return next( datetime.TIME_FRAME, caller, method, ...args );
    }

    /**
     * 延迟到下一秒执行
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function next_second( caller: any, method: NextHandler, ...args: any[] ) {
        return next( datetime.TIME_SECOND, caller, method, ...args );
    }

    /**
     * 取消延迟执行
     * @param tid 定时器 ID
     */
    export function cancel_next( tid: number ) {
        clearTimeout( tid );
        timers.delete( tid);
    }

    /**
     * 重复执行
     * @param interval 间隔
     * @param times 次数
     * @param immediately 立即执行一次回调
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function repeat( interval: number, times: number, immediately: boolean, caller: any, method: RepeatHandler, ...args: any[] ) {
        times |= 0;
        
        if ( immediately ) {
            // 立即执行一次，而不是等到下一个节拍到达时才触发
            method.call( caller, 0, times, ...args );
        }
            
        let current = 0;
        let tid: number;
        if ( times > 0 ) {
            tid = setInterval( function () {
                if ( ++current > times ) {
                    cancel_repeat( tid );
                    return;
                }
                method.call( caller, current, times, ...args );
            }, interval );
        } else {
            // 如果小于 0，则代表永远重复
            times = -1;
            tid = setInterval( function () {
                method.call( caller, current, times, ...args );
            }, interval );
        }
        return tid;
    }

    /**
     * 永远重复执行
     * @param interval 间隔
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function repeat_forever( interval: number, caller: any, method: RepeatHandler, ...args: any[] ) {
        return repeat(interval, REPEAT_FOREVER, true, caller, method, ...args);
    }

    /**
     * 每帧执行
     * @param times 次数
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function repeat_every_frame(times: number = REPEAT_FOREVER, caller: any, method: RepeatHandler, ...args: any[]) {
        return repeat( datetime.TIME_FRAME, times, false, caller, method, ...args );
    }

    /**
     * 每秒执行
     * @param times 次数
     * @param caller 调用者
     * @param method 调用方法
     * @param args 参数列表
     */
    export function repeat_every_second( times: number= REPEAT_FOREVER, caller: any, method: RepeatHandler, ...args: any[] ) {
        return repeat( datetime.TIME_SECOND, times, true, caller, method, ...args );
    }

    /**
     * 取消重复执行
     * @param tid 定时器 ID
     */
    export function cancel_repeat( tid: number ) {
        clearInterval( tid );
        timers.delete( tid);
    }

    /**
     * 定时器是否在运行
     * @param tid 定时器 ID
     */
    export function running(tid: number) {
        return timers.has( tid);
    }
}