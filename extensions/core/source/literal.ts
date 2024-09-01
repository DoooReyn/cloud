/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 字符串操作
 */

import { digit } from "./digit";

export namespace literal {
  /**
   * 比对版本号
   * @desc 相等: 0
   * @desc 大于: 1
   * @desc 小于: -1
   * @param version1 版本号 1
   * @param version2 版本号 2
   */
  export function compareVersion(version1: string, version2: string) {
    const f = (str: string) => str.split(".").map((v) => parseInt(v));
    const v1 = f(version1);
    const v2 = f(version2);
    const maxLen = Math.max(v1.length, v2.length);
    for (let i = 0; i < maxLen; i++) {
      const w1 = v1[i] ?? 0;
      const w2 = v2[i] ?? 0;
      if (w1 > w2) return 1;
      if (w1 < w2) return -1;
    }
    return 0;
  }

  /**
   * 字符串按行拼接
   * @param strings 字符串列表
   */
  export function join_lines(...strings: string[]) {
    return strings.join("\n");
  }

  /**
   * 获取唯一 ID
   * @param tag 标识
   */
  export function unique_id(tag?: string) {
    return (
      (tag ?? "generic") +
      "-" +
      (Date.now() % 10 ** 5) +
      "-" +
      digit.random_integer(1001, 9999, "full-close")
    );
  }
}
