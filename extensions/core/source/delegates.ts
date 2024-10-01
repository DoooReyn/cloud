/**
 * @Author: Reyn jl88744653@gmail.com
 * @Description: 委托机制
 */

import { array } from "./array";
import { pool } from "./pool";

export namespace delegates {
    export class Delegate {
        public caller: any = null!;
        public handler: Function = null!;
        public args: any[] = null!;
        public once: boolean = false;

        public set( caller: any, handler: Function, args: any[], once: boolean = false ) {
            this.caller = caller;
            this.handler = handler;
            this.args = args;
            this.once = once;
        }

        public reset() {
            this.caller = null;
            // @ts-ignore
            this.handler = null;
            // @ts-ignore
            this.args = null;
            this.once = false;
        }

        public invoke() {
            if ( this.handler ) {
                this.handler.apply( this.caller, this.args );
                if ( this.once ) {
                    this.reset();
                }
            }
        }
    }

    /**
     * 委托管理
     */
    export class Delegates {
        /** 委托列表 */
        private _list: Delegate[];

        /**
         * 当前委托数量
         */
        public get count() {
            return this._list.length;
        }

        public constructor() {
            this._list = [];
        }

        /**
         * 添加委托
         * @param d 委托
         */
        public on( caller: any, handler: Function, ...args: any[] ) {
            const d = create( caller, handler, args );
            this.onto( d );
        }

        public once( caller: any, handler: Function, ...args: any[] ) {
            const d = once( caller, handler, args );
            this.onto( d );
        }

        public onto( d: Delegate ) {
            if ( this.seek( d ) < 0 ) {
                this._list.push( d );
            }
        }

        /**
         * 移除委托
         * @param caller 调用者
         * @param handler 调用方法
         */
        public off( caller: any, handler: Function ) {
            const matches: number[] = array.pick_indexes(
                this._list,
                caller,
                ( item: Delegate ) => caller === item.caller && handler === item.handler,
            );
            if ( matches.length ) {
                array.remove_indexes( this._list, matches );
            }
        }

        /**
         * 移除委托
         * @param d 委托
         */
        public off_by_delegate( d: Delegate ) {
            this.off( d.caller, d.handler! );
        }

        /**
         * 移除同调用者的所有委托
         * @param caller 调用者
         */
        public off_by_caller( caller: any ) {
            const matches: number[] = array.pick_indexes(
                this._list,
                caller,
                ( item: Delegate ) => caller === item.caller,
            );
            if ( matches.length ) {
                array.remove_indexes( this._list, matches );
            }
        }

        /**
         * 移除所有委托
         */
        public off_all() {
            this._list.length = 0;
        }

        /**
         * 激活委托
         */
        public invoke( ...args: any[] ) {
            for ( let i = 0, l = this._list.length, item: Delegate; i < l; i++ ) {
                item = this._list[i];
                item.handler!.apply( item.caller, args.concat( item.args ) );
                if ( item.once ) {
                    this._list.splice( i, 1 );
                    --i;
                }
            }
        }

        /**
         * 查询委托
         * @param d 委托
         */
        private seek( d: Delegate ) {
            return this._list.findIndex(
                ( v ) => v.caller === d.caller && v.handler === d.handler,
            );
        }

    }

    export function create( caller: any, handler: Function, ...args: any[] ) {
        const d = pool.factory.acquire( "delegate" );
        d.set( caller, handler, args, false );
        return d;
    }

    export function once( caller: any, handler: Function, ...args: any[] ) {
        const d = pool.factory.acquire( "delegate" );
        d.set( caller, handler, args, true );
        return d;
    }

    pool.factory.inject_clazz( "delegate", Delegate, {} );
}
