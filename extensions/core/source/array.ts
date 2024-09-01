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
  export function shuffle(list: any[]) {
    let pid = -1;
    let nid = 0;
    let length = list.length;
    while (++pid < length) {
      nid = digit.random_integer(pid, length);
      [list[nid], list[pid]] = [list[pid], list[nid]];
    }
    return list;
  }

  /**
   * 打乱数组
   * @param list 数组
   */
  export function shuffle_sort(list: any[]) {
    return list.sort(() => digit.random() - 0.5);
  }

  /**
   * 交换数组中的两个元素
   * @param list 数组
   * @param n1 索引 1
   * @param n2 索引 2
   */
  export function swap(list: any[], n1: number, n2: number) {
    const len = list.length;
    if (n1 >= 0 && n1 < len && n2 >= 0 && n2 < len) {
      [list[n1], list[n2]] = [list[n2], list[n1]];
    }
    return list;
  }
}
