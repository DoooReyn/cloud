/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 时间与日期
 */

export namespace datetime {
  /**
   * 当前时间戳
   */
  export function now() {
    return Date.now();
  }

  /**
   * 获得日期对象
   */
  export function date() {
    return new Date();
  }

  /**
   * 获得年份
   * @param d 日期对象
   */
  export function year(d?: Date) {
    return (d || date()).getFullYear();
  }

  /**
   * 获得月份
   * @param d 日期对象
   */
  export function month(d?: Date) {
    return (d || date()).getMonth() + 1;
  }

  /**
   * 获得月日
   * @param d 日期对象
   */
  export function month_day(d?: Date) {
    return (d || date()).getDate();
  }

  /**
   * 获得周天
   * @param d 日期对象
   * @param sunday7 默认将周日转换为第 7 天而不是第 0 天
   */
  export function week_day(d?: Date, sunday7: boolean = true) {
    let day = (d || date()).getDay();
    if (sunday7 && day == 0) {
      day = 7;
    }
    return day;
  }

  /**
   * 获得时辰
   * @param d 日期对象
   */
  export function hour(d?: Date) {
    return (d || date()).getHours();
  }

  /**
   * 获得时分
   * @param d 日期对象
   */
  export function minute(d?: Date) {
    return (d || date()).getMinutes();
  }

  /**
   * 获得秒数
   * @param d 日期对象
   */
  export function second(d?: Date) {
    return (d || date()).getSeconds();
  }

  /**
   * 获得毫秒数
   * @param d 日期对象
   */
  export function ms(d?: Date) {
    return (d || date()).getMilliseconds();
  }

  /**
   * 获得时间戳
   * @param d
   */
  export function time(d?: Date) {
    return (d || date()).getTime();
  }

  /**
   * 结构化日期对象
   * @param d 日期对象
   */
  export function structure(d?: Date) {
    d ??= date();
    return {
      YY: year(d),
      MM: month(d),
      DD: month_day(d),
      hh: hour(d),
      mm: minute(d),
      ss: second(d),
      ms: ms(d),
      tt: time(d),
    };
  }

  /**
   * 年-月-日
   * @param d 日期对象
   */
  export function ymd(d?: Date) {
    const s = structure(d || date());
    return `${s.YY}-${s.MM}-${s.DD}`;
  }

  /**
   * 时:分:秒
   * @param d 日期对象
   */
  export function hms(d?: Date) {
    const s = structure(d || date());
    return `${s.hh}:${s.mm}:${s.ss}`;
  }

  /**
   * 年-月-日 时:分:秒
   * @param d 日期对象
   */
  export function full(d?: Date) {
    const s = structure(d || date());
    return `${s.YY}-${s.MM}-${s.DD} ${s.hh}:${s.mm}:${s.ss}`;
  }

  /**
   * 比较两个日期的时间差
   * @param d1 日期 1
   * @param d2 日期 2
   */
  export function diff(d1: Date, d2?: Date) {
    return Math.abs(time(d2) - time(d1));
  }
}
