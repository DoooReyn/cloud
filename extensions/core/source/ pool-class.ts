import { be } from "./be";
import { datetime } from "./datetime";
import { dict } from "./dict";
import { logger } from "./logger";
import { singletons } from "./singleton";
import { task } from "./task";

export namespace pool {
  export interface IPoolItem {
    $init(...args: any[]): void;
    $deinit(): void;
  }

  const log = logger.create("pool");

  class Pool {
    private $items: IPoolItem[];

    constructor(
      public readonly cname: string,
      public readonly $template: { new (): IPoolItem },
    ) {
      this.$items = [];
    }

    public acquire(initialize: boolean = false, ...args: any[]) {
      let item;
      if (this.$items.length) {
        item = this.$items.pop();
      } else {
        item = new this.$template();
      }

      if (initialize) {
        // 初始化
        item!.$init(...args);
      }

      // 移除回收标记
      dict.del(item!, "$recycled_at");

      return item;
    }

    public recycle(item: IPoolItem, immediately: boolean = false) {
      if (!item) {
        log.warn(`${this.cname} 回收失败：对象为空`);
        return;
      }

      const cname = dict.get(item, "$cname");
      if (be.absent(cname)) {
        log.warn(`${this.cname} 回收失败：不是有效的对象 ${cname}`);
        return;
      }

      if (cname !== this.cname) {
        log.warn(`${this.cname} 回收失败：对象类型不匹配 ${cname}`);
        return;
      }

      if (dict.has(item, "$recycled_at")) {
        log.warn(`${this.cname} 回收失败：对象已回收 ${cname}`);
        return;
      }

      // 添加回收标记
      dict.set(item, "$recycled_at", datetime.now());

      // 重置
      item.$deinit();

      // 延迟回收
      if (immediately) {
        this.$items.unshift(item);
      } else {
        // task.create(0, this, this.$items.unshift, item).run();
        setTimeout(() => {
          this.$items.unshift(item);
        }, 0);
      }
    }
  }

  class ObjectPool {
    private $pools: Map<string, Pool>;

    constructor() {
      this.$pools = new Map();
    }

    has(cname: string) {
      return this.$pools.has(cname);
    }

    inject(clazz: { new (): IPoolItem }) {}
  }
}
