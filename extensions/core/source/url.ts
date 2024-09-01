/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: URL 操作
 */

import { be } from "./be";

export namespace url {
  /**
   * 从网址中分离出参数
   * @param url 网址
   */
  export function separate_params(url?: string) {
    url ??= window.location ? window.location.href : "";
    let params: Record<string, string> = {};
    if (be.empty(url)) return params;

    let name, value;
    let num = url.indexOf("?");
    url = url.substring(num + 1);

    let arr = url.split("&"); //各个参数放到数组里
    for (let i = 0, l = arr.length; i < l; i++) {
      num = arr[i].indexOf("=");
      if (num > 0) {
        name = arr[i].substring(0, num);
        value = arr[i].substring(num + 1);
        params[name] = value;
      }
    }
    return params;
  }
}
