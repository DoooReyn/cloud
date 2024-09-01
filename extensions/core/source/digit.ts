/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 数值操作
 */

export namespace digit {
  /**
   * 是否为NaN
   * @param v 任意数值
   */
  export function nan(v: number) {
    return isNaN(v);
  }

  /**
   * 是否为无穷数值
   * @param v 任意数值
   */
  export function finite(v: number) {
    return isFinite(v);
  }

  /**
   * 获取数值的整数部分
   * @param v 任意数值
   */
  export function integer(v: number) {
    return Math.floor(v);
  }

  /**
   * 获取数值的小数部分
   * @param v 任意数值
   */
  export function decimal(v: number) {
    return v - integer(v);
  }

  /**
   * 对数值四舍五入
   * @param v 任意数值
   */
  export function round(v: number) {
    return Math.round(v);
  }

  /**
   * 对数值向上取整
   * @param v 任意数值
   */
  export function integer_up(v: number) {
    return Math.ceil(v);
  }

  /**
   * 随机 0-1 区间内的数值
   */
  export function random() {
    return Math.random();
  }

  /**
   * 随机 0 或 1
   */
  export function random_01() {
    return round(random());
  }

  /**
   * 在指定区间内随机数值
   * @param min 左区间
   * @param max 右区间
   */
  export function random_range(min: number, max: number) {
    return min + random() * (max - min);
  }

  /**
   * 随机整数
   * @param min 左区间
   * @param max 右区间
   * @param style 格式：左闭右开|左开右闭|左右全闭|左右全开
   */
  export function random_integer(
    min: number,
    max: number,
    style:
      | "left-close"
      | "right-close"
      | "full-close"
      | "no-close" = "left-close",
  ) {
    let v: number = min;
    switch (style) {
      case "left-close":
        v = integer(random_range(min, max));
        break;
      case "right-close":
        v = integer_up(random_integer(min, max));
        break;
      case "full-close":
        v = integer(random_integer(min, max + 1));
        break;
      case "no-close":
        v = integer(random_integer(min + 1, max));
        break;
    }
    return v;
  }

  /**
   * 限定数值在指定区间内
   * @param v 数值
   * @param min 左区间
   * @param max 右区间
   */
  export function limit(v: number, min: number, max: number) {
    return Math.max(min, Math.min(v, max));
  }

  /**
   * 比较两个数值是否近似相等
   * @param a 数值 1
   * @param b 数值 2
   * @param tolerance 可接受的误差范围
   */
  export function equals(
    a: number,
    b: number,
    tolerance: number = Number.EPSILON,
  ) {
    return Math.abs(a - b) < tolerance;
  }

  /**
   * 获取数值的符号
   * @param v 任意数值
   */
  export function sign(v: number) {
    if (v == 0) {
      return 0;
    } else if (v > 0) {
      return 1;
    } else {
      return -1;
    }
  }

  /**
   * 数组求和
   * @param list 数字列表
   */
  export function sum(...list: number[]) {
    return list.reduce((a, b) => a + b, 0);
  }
}
