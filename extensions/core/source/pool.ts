/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 通用对象池
 */

import { dict } from "./dict";
import { scheduler } from "./scheduler";
import { array } from "./array";
import { logger } from "./logger";
import { delegates } from "./delegates";
import { tips } from "./app/tips";

export namespace pool {
    /** 生产方法：类 */
    type FactoryClass = { new(): any };

    /** 生产方法：函数（模板） */
    type FactoryTemplate = () => any;

    /** 对象委托 */
    type FactoryDelegates = {
        /** 使用 */
        on_acquire?: delegates.Delegate,
        /** 回收 */
        on_recycle?: delegates.Delegate,
        /** 清理 */
        on_abort?: delegates.Delegate
    }

    /** 对象池基类 */
    abstract class Pool {
        /** 缓存对象列表 */
        private _items: any[];
        /** 委托：对象被使用 */
        private _on_acquire: delegates.Delegates | null = null;
        /** 委托：对象被回收 */
        private _on_recycle: delegates.Delegates | null = null;
        /** 委托：对象被弃用 */
        private _on_abort: delegates.Delegates | null = null;

        /** 对象池数量 */
        public get count() {
            return this._items.length;
        }

        /**
         * 对象池构造
         * @param tag 对象池唯一标识符
         * @param delegate 聚合委托
         */
        public constructor( public readonly tag: string, public delegate: FactoryDelegates ) {
            this._items = [];
            if ( delegate.on_acquire ) {
                this._on_acquire = new delegates.Delegates();
                this._on_acquire.onto( delegate.on_acquire );
            }
            if ( delegate.on_recycle ) {
                this._on_recycle = new delegates.Delegates();
                this._on_recycle.onto( delegate.on_recycle );
            }
            if ( delegate.on_abort ) {
                this._on_abort = new delegates.Delegates();
                this._on_abort.onto( delegate.on_abort );
            }
        }

        /** 使用对象 */
        public acquire() {
            let item;
            if ( this._items.length ) {
                item = this._items.shift()!;
            } else {
                item = this.create();
            }

            // 删除回收标识
            dict.del( item, "$recycle" );
            // 添加对象池标识
            dict.set( item, "$pool", this.tag );

            // logger.pool.debug( `对象池 ${ this.tag } 使用对象, 剩余 ${ this.count }` );

            // 触发委托
            if ( this._on_acquire ) this._on_acquire?.invoke( item );

            return item;
        }

        /**
         * 回收对象
         * @param item 对象
         */
        public recycle( item: any ) {
            // 属于该对象池并且是未回收状态才可以被回收
            if ( dict.get( item, "$pool" ) === this.tag && !dict.get( item, "$recycle" ) ) {
                dict.set( item, "$recycle", true );
                // 延迟一帧回收，避免出现一个对象在同一帧被回收了又被使用的情况
                scheduler.next_frame( this, () => {
                    this._items.push( item );
                    // logger.pool.debug( `对象池 ${ this.tag } 回收对象, 剩余 ${ this.count }` );
                    if ( this._on_recycle ) this._on_recycle.invoke( item );
                } );
            }
        }

        /**
         * 弃用对象
         * @param item 对象
         */
        public abort( item: any ) {
            dict.del( item, "$recycle" );
            dict.del( item, "$pool" );
            // logger.pool.debug( `对象池 ${ this.tag } 弃用对象` );
            if ( this._on_abort ) this._on_abort.invoke( item );
        }

        /** 清空对象池 */
        public clear() {
            array.remove_all( this._items, this.abort.bind( this ) );
        }

        /**
         * 最多保留指定数量的对象
         * @param count 数量
         */
        public purge( count: number ) {
            count = this._items.length - count;
            if ( count > 0 ) array.remove_many( this._items, count, this.abort.bind( this ) );
        }

        /** 生产对象 */
        protected abstract create(): any;
    }

    /** 适用于类的对象池 */
    class PoolClass extends Pool {
        /**
         * 对象池构造
         * @param tag 对象池唯一标识
         * @param delegate 对象委托
         * @param clazz 生产方法：类
         */
        constructor( public readonly tag: string, public readonly delegate: FactoryDelegates, public readonly clazz: FactoryClass ) {
            super( tag, delegate );
        }

        public create(): any {
            return new this.clazz();
        }
    }

    /** 适用于函数的对象池 */
    class PoolTemplate extends Pool {
        /**
         * 对象池构造
         * @param tag 对象池唯一标识
         * @param delegate 对象委托
         * @param template 生产方法：函数（模板）
         */
        constructor( public readonly tag: string, public readonly delegate: FactoryDelegates, public readonly template: FactoryTemplate ) {
            super( tag, delegate );
        }

        public create(): any {
            return this.template();
        }
    }

    /** 对象工厂 */
    class ObjectFactory {
        /** 类工厂 */
        private _classes: Map<string, PoolClass>;
        /** 模板工厂 */
        private _templates: Map<string, PoolTemplate>;

        /** 对象工厂构造 */
        public constructor() {
            this._classes = new Map();
            this._templates = new Map();
        }

        /**
         * 注册对象池（类）
         * @param tag 对象池唯一标识
         * @param clazz 类
         * @param delegate 委托
         */
        public inject_clazz( tag: string, clazz: FactoryClass, delegate: FactoryDelegates ) {
            if ( !this._classes.has( tag ) ) {
                this._classes.set( tag, new PoolClass( tag, delegate, clazz ) );
            } else {
                logger.pool.warn( `${ tips.pool_registered } ${ tag }` );
            }
        }

        /**
         * 注册对象池（模板）
         * @param tag 对象池唯一标识
         * @param template 模板
         * @param delegate 委托
         */
        public inject_template( tag: string, template: FactoryTemplate, delegate: FactoryDelegates ) {
            if ( !this._templates.has( tag ) ) {
                this._templates.set( tag, new PoolTemplate( tag, delegate, template ) );
            } else {
                logger.pool.warn( `${ tips.pool_registered } ${ tag }` );
            }
        }

        /**
         * 注销对象池
         * @param tag 对象池唯一标识
         */
        public eject( tag: string ) {
            if ( this._classes.has( tag ) ) {
                this._classes.get( tag )!.clear();
                this._classes.delete( tag );
            } else if ( this._templates.has( tag ) ) {
                this._templates.get( tag )!.clear();
                this._templates.delete( tag );
            }
        }

        /**
         * 使用对象
         * @param tag 对象池唯一标识
         */
        public acquire( tag: string ) {
            if ( this._classes.has( tag ) ) {
                return this._classes.get( tag )!.acquire();
            } else if ( this._templates.has( tag ) ) {
                return this._templates.get( tag )!.acquire();
            }
            logger.pool.warn( `${ tips.pool_unregistered } ${ tag }` );
            return null;
        }

        /**
         * 回收对象
         * @param item 对象
         */
        public recycle( item: any ) {
            if ( !dict.has( item, "$pool" ) ) {
                return logger.pool.warn( tips.pool_not_myself, item );
            }

            const tag = dict.get( item, "$pool" );
            if ( this._classes.has( tag ) ) {
                this._classes.get( tag )!.recycle( item );
            } else if ( this._templates.has( tag ) ) {
                this._templates.get( tag )!.recycle( item );
            } else {
                logger.pool.warn( `${ tips.pool_maybe_dismiss } ${ tag }` );
            }
        }

        /**
         * 对象池中剩余的对象数量
         * @param tag 对象池唯一标识
         */
        public count( tag: string ) {
            if ( this._classes.has( tag ) ) {
                return this._classes.get( tag )!.count;
            } else if ( this._templates.has( tag ) ) {
                return this._templates.get( tag )!.count;
            }
            return 0;
        }
    }

    /** 对象工厂 */
    export const factory = new ObjectFactory();
}