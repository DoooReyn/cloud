/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 字典操作
 */

export module dict {
  /** 基础字典类型 */
  export type IDict = { [key in string]: any };

  /**
   * 获取字段的所有域名
   * @param o 字典
   */
  export function keys(o: IDict) {
    return Object.keys(o);
  }

  /**
   * 获取字段的所有域值
   * @param o 字典
   */
  export function values(o: IDict) {
    return Object.values(o);
  }

  /**
   * 查询字典中是否包含指定的域名
   * @param o 字典
   * @param key 域名
   */
  export function has(o: IDict, key: string) {
    return o[key] !== undefined;
  }

  /**
   * 查询字典中是否包含指定的原生域名
   * @param o 字典
   * @param key 域名
   */
  export function hasProperty(o: IDict, property: string) {
    return o.hasOwnProperty(property);
  }

  /**
   * 获取一份原生的字典
   */
  export function raw() {
    return Object.create(null);
  }

  export function get(o: IDict, key: string) {
    if (has(o, key)) {
      return o[key];
    }
    return undefined;
  }
  export function set(o: IDict, key: string, val: any) {
    o[key] = val;
  }
  export function del(o: IDict, key: string) {
    if (has(o, key)) {
      delete o[key];
    }
  }
}
