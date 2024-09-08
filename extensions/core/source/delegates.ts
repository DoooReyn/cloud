import { array } from "./array";

/**
 * 委托机制
 */
export namespace delegates {
  /** 委托结构体 */
  export interface IDelegate {
    caller: any;
    handler: Function;
    args?: any[];
    once?: boolean;
  }

  /**
   * 委托管理
   */
  export class Delegates {
    /** 委托列表 */
    private $list: IDelegate[];

    public constructor() {
      this.$list = [];
    }

    /**
     * 查询委托
     * @param d 委托
     */
    private seek(d: IDelegate) {
      return this.$list.findIndex(
        (v) => v.caller === d.caller && v.handler === d.handler,
      );
    }

    /**
     * 添加委托
     * @param d 委托
     */
    public on(d: IDelegate) {
      if (this.seek(d) < 0) {
        this.$list.push(d);
      }
    }

    /**
     * 移除委托
     * @param caller 调用者
     * @param handler 调用方法
     */
    public off(caller: any, handler: Function) {
      const matches: number[] = array.pick_indexes(
        this.$list,
        caller,
        (item: IDelegate) => caller === item.caller && handler === item.handler,
      );
      if (matches.length) {
        array.remove_indexes(this.$list, matches);
      }
    }

    /**
     * 移除委托
     * @param d 委托
     */
    public off_by_delegate(d: IDelegate) {
      this.off(d.caller, d.handler);
    }

    /**
     * 移除同调用者的所有委托
     * @param caller 调用者
     */
    public off_by_caller(caller: any) {
      const matches: number[] = array.pick_indexes(
        this.$list,
        caller,
        (item: IDelegate) => caller === item.caller,
      );
      if (matches.length) {
        array.remove_indexes(this.$list, matches);
      }
    }

    /**
     * 移除所有委托
     */
    public off_all() {
      this.$list.length = 0;
    }

    /**
     * 当前委托数量
     */
    public get count() {
      return this.$list.length;
    }

    /**
     * 激活委托
     */
    public invoke() {
      for (let i = 0, l = this.$list.length, item: IDelegate; i < l; i++) {
        item = this.$list[i];
        item.handler.apply(item.caller, item.args);
        if (item.once) {
          this.$list.splice(i, 1);
          --i;
        }
      }
    }
  }
}
