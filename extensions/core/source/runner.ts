/**
 * @Author: Reyn jl88744653@gmail.com
 * @Date: 2024-09-01 00:46:54
 * @LastEditors: Reyn jl88744653@gmail.com
 * @LastEditTime: 2024-09-22 21:43:51
 * @FilePath: extensions/core/source/runner.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 运行器
 */

import { EDITOR, PREVIEW } from "cc/env";
import { be } from "./be";

export namespace runner {
    /**
     * 在指定条件下运行
     * @param condition 条件
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_in(
        condition: boolean,
        callback: Function,
        ...args: any[]
    ) {
        if (be.truely(condition)) callback(...args);
    }

    /**
     * 在非指定条件下运行
     * @param condition 条件
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_not_in(
        condition: boolean,
        callback: Function,
        ...args: any[]
    ) {
        if (be.falsy(condition)) callback(...args);
    }

    /**
     * 在编辑器模式下运行
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_in_editor(callback: Function, ...args: any[]) {
        execute_in(EDITOR, callback, ...args);
    }

    /**
     * 在非编辑器模式下运行
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_not_in_editor(callback: Function, ...args: any[]) {
        execute_not_in(EDITOR, callback, ...args);
    }

    /**
     * 在预览模式下运行
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_in_preview(callback: Function, ...args: any[]) {
        execute_in(PREVIEW, callback, ...args);
    }

    /**
     * 在安全模式下运行
     * @param oncomplete 完成回调
     * @param caller 调用者
     * @param callback 运行器
     * @param args 参数列表
     */
    export function execute_in_safe_mode(oncomplete: Function | null, caller: any, callback: Function, ...args: any[]) {
        try {
            const ret = callback.apply(caller, args);
            oncomplete && oncomplete(null, ret);
        } catch (e) {
            oncomplete && oncomplete(e, null);
        }
    }
}
