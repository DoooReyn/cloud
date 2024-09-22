import { dict } from "./dict";
import { scheduler } from "./scheduler";
import { array } from "./array";
import { logger } from "./logger";

export namespace pool {

    type FactoryClass = { new(): any };
    type FactoryTemplate = () => any;

    class Factory {
        /** 商品 */
        private _classes: Map<string, FactoryClass>;
        private _templates: Map<string, FactoryTemplate>;

        constructor() {
            this._classes = new Map();
            this._templates = new Map();
        }

        register_class( tag: string, creator: FactoryClass ) {
            if ( !this._classes.has( tag ) ) {
                this._classes.set( tag, creator );
            }
        }

        register_template( tag: string, creator: FactoryTemplate ) {
            if ( !this._templates.has( tag ) ) {
                this._templates.set( tag, creator );
            }
        }

        unregister( tag: string ) {
            if ( this._templates.has( tag ) ) {
                this._templates.delete( tag );
            } else if ( this._classes.has( tag ) ) {
                this._classes.delete( tag );
            }
        }

        generate( tag: string ) {
            if ( this._classes.has( tag ) ) {
                const creator = this._classes.get( tag )!;
                return new creator();
            }
            if ( this._templates.has( tag ) ) {
                const creator = this._templates.get( tag )!;
                return creator();
            }
            return null;
        }
    }

    export const factory = new Factory();

    abstract class Pool {
        private _items: any[];

        constructor( public readonly tag: string ) {
            this._items = [];
        }

        abstract create(): any;

        acquire() {
            let item;
            if ( this._items.length ) {
                item = this._items.shift()!;
            } else {
                item = this.create();
            }

            dict.del( item, "$recycle" );
            dict.set( item, "$pool", this.tag );

            return item;
        }

        recycle( item: any ) {
            // 属于该对象池并且是未回收状态才可以被回收
            if ( dict.get( item, "$pool" ) === this.tag && !dict.get( item, "$recycle" ) ) {
                dict.set( item, "$recycle", true );
                scheduler.next_frame( this, this._items.push, item ); // 延迟一帧回收
            }
        }

        clear() {
            array.remove_all( this._items, ( item ) => {
                dict.del( item, "$recycle" );
                dict.del( item, "$pool" );
            } );
        }
    }

    class PoolClass extends Pool {
        constructor( public readonly tag: string, public readonly clazz: FactoryClass ) {
            super( tag );
        }

        public create(): any {
            return new this.clazz();
        }
    }

    class PoolTemplate extends Pool {
        constructor( public readonly tag: string, public readonly template: FactoryTemplate ) {
            super( tag );
        }

        public create(): any {
            return this.template();
        }
    }

    class ObjectPool {
        private _classes: Map<string, PoolClass>;
        private _templates: Map<string, PoolTemplate>;

        constructor() {
            this._classes = new Map();
            this._templates = new Map();
        }

        inject_clazz( tag: string, clazz?: FactoryClass ) {
            if ( !this._classes.has( tag ) ) {
                if ( clazz ) {
                    this._classes.set( tag, new PoolClass( tag, clazz ) );
                } else {
                    logger.use( "pool" ).error( `tag:${ tag } 注册对象池需提供 clazz!` );
                }
            }
        }

        inject_template( tag: string, template?: FactoryTemplate ) {
            if ( !this._templates.has( tag ) ) {
                if ( template ) {
                    this._templates.set( tag, new PoolTemplate( tag, template ) );
                } else {
                    logger.use( "pool" ).error( `tag:${ tag } 注册对象池需提供 template!` );
                }
            }
        }

        eject( tag: string ) {
            if ( this._classes.has( tag ) ) {
                this._classes.get( tag )!.clear();
                this._classes.delete( tag );
            } else if ( this._templates.has( tag ) ) {
                this._templates.get( tag )!.clear();
                this._templates.delete( tag );
            }
        }

        acquire( tag: string ) {
            if ( this._classes.has( tag ) ) {
                return this._classes.get( tag )!.acquire();
            } else if ( this._templates.has( tag ) ) {
                return this._templates.get( tag )!.acquire();
            }
            logger.use( "pool" ).warn( `tag:${ tag } 对象池未注册！` );
            return null;
        }

        recycle( item: any ) {
            if ( !dict.has( item, "$pool" ) ) {
                return logger.use( "pool" ).warn( "不是对象池对象", item );
            }

            const tag = dict.get( item, "$pool" );
            if ( this._classes.has( tag ) ) {
                this._classes.get( tag )!.recycle( item );
            } else if ( this._templates.has( tag ) ) {
                this._templates.get( tag )!.recycle( item );
            } else {
                logger.use( "pool" ).warn( `tag: ${ tag } 对象池可能已解散` );
            }
        }
    }

    export const pool = new ObjectPool();

    // TODO 添加委托：创建时、回收时
}