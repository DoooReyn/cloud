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
    execute_in(EDITOR, callback);
  }

  /**
   * 在非编辑器模式下运行
   * @param callback 运行器
   * @param args 参数列表
   */
  export function execute_not_in_editor(callback: Function, ...args: any[]) {
    execute_not_in(EDITOR, callback);
  }

  /**
   * 在预览模式下运行
   * @param callback 运行器
   * @param args 参数列表
   */
  export function execute_in_preview(callback: Function, ...args: any[]) {
    execute_in(PREVIEW, callback);
  }
}
