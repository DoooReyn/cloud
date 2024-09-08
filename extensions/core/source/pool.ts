/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 对象池
 * @Todo: 需要进一步简化注册
 * - 要方便初始化
 */

import { be } from "./be";
import { dict } from "./dict";
import { logger } from "./logger";
import { singletons } from "./singleton";

// 不管是任意类型还是特定类型，都需要注册，且提供初始化和反初始化接口
// 对于特定类型，注册时只需要传入类即可
// 对于任意类型，注册时需要传入初始化和反初始化方法（内部伪造一个类）

export namespace pool {
  /** 对象池日志 */
  const log = logger.create("pool");

  /** 对象池节点 */
  export interface IPoolItem {
    /** 初始化 */
    $init(...args: any[]): void;
    /** 反初始化 */
    $deinit(): void;
  }

  /** 对象池节点类 */
  export type IPoolClazz<T extends IPoolItem> = {
    readonly $cname: string;
    new (): T;
  };

  /**
   * 支持指定类的对象池工厂
   */
  class FactorySpecified<T extends IPoolItem> {
    /** 对象列表 */
    private $collections: T[];

    /**
     * 创建支持指定类的对象池
     * @param $cls 类
     * @param $acquire 创建方法
     * @param $recycle 回收方法
     */
    public constructor(
      public readonly $cls: IPoolClazz<T>,
      private readonly $acquire: () => T,
      private readonly $recycle: (cls: T) => void,
    ) {
      this.$collections = [];
    }

    /**
     * 从池子中取出一个对象
     */
    public acquire() {
      let item: T;
      if (this.$collections.length) {
        item = this.$collections.shift()!;
      } else {
        item = this.$acquire();
      }

      dict.set(item, "$pooling", true);
      item.$init();

      return item;
    }

    /**
     * 将对象回收到池子
     * @param cls 类实例
     */
    public recycle(cls: T) {
      if (be.truely(dict.get(cls, "$pooling"))) {
        dict.set(cls, "$pooling", false);
        cls.$deinit();
        this.$recycle(cls);
        this.$collections.push(cls);
      } else {
        const $cname = dict.get(cls.constructor, "$cname");
        log.warn($cname + " 不需要回收");
      }
    }

    /**
     * 清空池子
     */
    public clear() {
      this.$collections.length = 0;
    }

    /**
     * 获取池子中的对象数量
     */
    public count() {
      return this.$collections.length;
    }
  }

  /**
   * 支持任意对象的对象池工厂
   */
  class FactoryAnything<T extends dict.IDict> {
    /** 对象列表 */
    private $collections: any[];

    /**
     * 创建支持任意对象的对象池
     * @param $pname 池子标识
     * @param $template 模板
     * @param $acquire 创建方法
     * @param $recycle 回收方法
     */
    public constructor(
      public readonly $pname: string,
      public readonly $template: T,
      private readonly $acquire: () => T,
      private readonly $recycle: (cls: T) => void,
    ) {
      this.$collections = [];
    }

    /**
     * 从池子中取出一个对象
     */
    public acquire() {
      let item: any;
      if (this.$collections.length) {
        item = this.$collections.shift()!;
      } else {
        item = this.$acquire();
      }

      dict.set(item, "$pname", this.$pname);
      dict.set(item, "$pooling", true);

      return item;
    }

    /**
     * 将对象回收到池子
     * @param cls 对象
     */
    public recycle(cls: T) {
      const pname = dict.get(cls, "$pname");
      if (pname === this.$pname) {
        if (be.truely(dict.get(cls, "$pooling"))) {
          dict.set(cls, "$pooling", false);
          this.$recycle(cls);
          this.$collections.push(cls);
        } else {
          log.warn(this.$pname + " 不需要回收");
        }
      } else {
        if (be.absent(pname)) {
          log.warn("不是可回收对象", cls);
        } else {
          log.warn("回收的对象类型不匹配", pname, this.$pname);
        }
      }
    }

    /**
     * 清空池子
     */
    public clear() {
      this.$collections.length = 0;
    }

    /**
     * 获取池子中的对象数量
     */
    public count() {
      return this.$collections.length;
    }
  }

  /** 指定类的对象池 */
  class SpecifiedPool {
    /** 指定池子管理器类型 */
    public static readonly $cname = "@pool:specified";

    /** 池子列表 */
    private $pools: Record<string, FactorySpecified<any>> = dict.raw();

    /**
     * 是否有指定名称的池子
     * @param pname 池子标识
     */
    private has(name: string) {
      return dict.has(this.$pools, name);
    }

    /**
     * 获取指定池子
     * @param pname 池子标识
     * @returns
     */
    private get<T extends IPoolItem>(
      name: string,
    ): FactorySpecified<T> | undefined {
      return dict.get(this.$pools, name) as FactorySpecified<T>;
    }

    /**
     * 注册池子
     * @param cls 类
     * @param $acquire 类实例创建方法
     * @param $recycle 类实例回收方法
     */
    public inject<T extends IPoolItem>(
      cls: IPoolClazz<T>,
      $acquire: () => T,
      $recycle: (cls: T) => void,
    ) {
      const $cname = cls.$cname;
      if (be.literal($cname) && !this.has($cname)) {
        dict.set(
          this.$pools,
          cls.$cname,
          new FactorySpecified(cls, $acquire, $recycle),
        );
      } else {
        log.warn("池子已经注册过了", $cname);
      }
    }

    /**
     * 注销池子
     * @param cls 类
     */
    public eject(cls: IPoolItem) {
      const $cname = dict.get(cls.constructor, "$cname");
      if (be.literal($cname) && this.has($cname)) {
        dict.del(this.$pools, $cname);
      }
    }

    /**
     * 从池子中取出一个对象
     * @param cls 类
     */
    public acquire<T extends IPoolItem>(cls: IPoolClazz<T>) {
      if (!this.has(cls.$cname)) {
        throw new Error(`${cls.$cname} 池子未注册`);
      }
      return this.get<T>(cls.$cname)!.acquire();
    }

    /**
     * 回收对象到池子
     * @param cls 类实例对象
     */
    public recycle(cls: IPoolItem) {
      const $cname = dict.get(cls.constructor, "$cname");
      if (this.has($cname)) {
        this.get($cname)!.recycle(cls);
      }
    }

    /**
     * 获取对象池对象数量
     * @param cls 类
     */
    public count<T extends IPoolItem>(cls: IPoolClazz<T>) {
      if (dict.has(this.$pools, cls.$cname)) {
        this.get(cls.$cname)!.count();
      }
      return 0;
    }
  }

  /**
   * 任意对象的对象池
   */
  class AnythingPool {
    /** 指定类名 */
    public static readonly $cname = "@pool:anything";

    /** 池子列表 */
    private $pools: Record<string, FactoryAnything<dict.IDict>> = dict.raw();

    /**
     * 是否有指定名称的池子
     * @param pname 池子标识
     */
    private has(pname: string) {
      return dict.has(this.$pools, pname);
    }

    /**
     * 获取指定池子
     * @param pname 池子标识
     * @returns
     */
    private get<T extends dict.IDict>(
      pname: string,
    ): FactoryAnything<T> | undefined {
      return dict.get(this.$pools, pname) as FactoryAnything<T>;
    }

    /**
     * 注册池子
     * @param $pname 池子标识
     * @param $template 对象模板
     * @param $acquire 对象创建方法
     * @param $recycle 对象回收方法
     */
    public inject<T extends dict.IDict>(
      $pname: string,
      $template: T,
      $acquire: () => T,
      $recycle: (cls: T) => void,
    ) {
      if (!this.has($pname)) {
        dict.set(
          this.$pools,
          $pname,
          new FactoryAnything($pname, $template, $acquire, $recycle),
        );
      } else {
        log.warn($pname + " 已经注册过了");
      }
    }

    /**
     * 注销池子
     * @param clsOrName 池子标识
     */
    public eject(clsOrName: string | dict.IDict) {
      let pname: string;
      if (be.literal(clsOrName)) {
        pname = clsOrName;
      } else {
        pname = dict.get(clsOrName, "$pname");
      }
      if (pname) {
        if (this.has(pname)) {
          this.get(pname)!.clear();
          dict.del(this.$pools, pname);
        } else {
          log.warn(`${pname} 未注册，不需要注销`);
        }
      } else {
        log.warn("不是池子或未注册", clsOrName);
      }
    }

    /**
     * 从池子中取出一个对象
     * @param $pname 池子标识
     */
    public acquire<T extends dict.IDict>($pname: string) {
      if (!this.has($pname)) {
        throw new Error(`${$pname} 未注册`);
      }
      return this.get<T>($pname)!.acquire() as T;
    }

    /**
     * 回收对象到池子
     * @param cls 对象
     */
    public recycle<T extends dict.IDict>(cls: T) {
      const pname = dict.get(cls, "$pname");
      if (be.literal(pname)) {
        if (dict.has(this.$pools, pname)) {
          this.get(pname)!.recycle(cls);
        } else {
          log.warn("未注册池子", pname, cls);
        }
      } else {
        log.warn("不是池子对象", cls);
      }
    }

    /**
     * 获取对象池对象数量
     * @param $pname 池子标识
     */
    public count($pname: string) {
      if (dict.has(this.$pools, $pname)) {
        return this.get($pname)!.count();
      }
      return 0;
    }
  }

  /** 适用于类的对象池 */
  export const specified = singletons.acquire<SpecifiedPool>(SpecifiedPool);

  /** 适用于所有对象的对象池 */
  export const anything = singletons.acquire<AnythingPool>(AnythingPool);
}
