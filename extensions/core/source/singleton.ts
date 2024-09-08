/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 单例
 */

import { dict } from "./dict";

export namespace singletons {
  /**
   * 第一种单例实现方式：单例基类
   * @description
   * - 优点：只要继承此类即可获得单例的能力
   * - 缺点：子类无法继承
   */
  export function singletonize<T>() {
    return class Singleton {
      private static $instance: T;
      public static get inst(): T {
        if (!this.$instance) {
          this.$instance = new this() as T;
        }
        return this.$instance;
      }
    };
  }

  /**
   * 第二种单例实现方式
   * @description
   * 优点：灵活，对类继承没有要求
   * 缺点：需要类定义额外的 `$cname` 字段
   */

  /** 单例模式 */
  export interface ISingleton {
    new (): unknown;
    readonly $cname: string;
  }

  /** 存放所有单例的字典 */
  const $collections: Record<string, any> = dict.raw();

  /** 获取单例 */
  export function acquire<T>(cls: ISingleton) {
    if (!cls.$cname) throw new Error("[sinletons] cls.$cname is nonsense.");
    return ($collections[cls.$cname] ??= new cls()) as T;
  }

  /** 移除单例 */
  export function release<T>(cls: ISingleton) {
    if ($collections[cls.$cname]) {
      delete $collections[cls.$cname];
    }
  }

  /** 返回所有在列的单例 */
  export function dump() {
    return dict.values($collections);
  }
}
