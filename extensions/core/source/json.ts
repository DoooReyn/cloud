/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: json 操作
 */

import { logger } from "./logger";

export namespace json {
  /**
   * 字符串转 JSON
   * @param text 字符串
   * @param receiver 转换器
   */
  export function s2j(text: string, receiver?: (key: any, value: any) => any) {
    try {
      return JSON.parse(text, receiver);
    } catch (error) {
      logger.cloud.error(error);
      return null;
    }
  }

  /**
   * JSON 转字符串
   * @param content JSON 内容
   * @param replacer 转换器
   * @param space 空格缩进数量
   */
  export function j2s(
    content: any,
    replacer?: (key: string, value: any) => any,
    space?: string | number,
  ) {
    try {
      return JSON.stringify(content, replacer, space);
    } catch (error) {
      logger.cloud.error(error);
      return null;
    }
  }
}
