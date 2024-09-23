/**
 * @Author: Reyn jl88744653@gmail.com
 * @Description: 委托机制
 */

import { array } from "./array";

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
        private _list: IDelegate[];

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
        public on( d: IDelegate ) {
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
                ( item: IDelegate ) => caller === item.caller && handler === item.handler,
            );
            if ( matches.length ) {
                array.remove_indexes( this._list, matches );
            }
        }

        /**
         * 移除委托
         * @param d 委托
         */
        public off_by_delegate( d: IDelegate ) {
            this.off( d.caller, d.handler );
        }

        /**
         * 移除同调用者的所有委托
         * @param caller 调用者
         */
        public off_by_caller( caller: any ) {
            const matches: number[] = array.pick_indexes(
                this._list,
                caller,
                ( item: IDelegate ) => caller === item.caller,
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
        public invoke(...args: any[]) {
            for ( let i = 0, l = this._list.length, item: IDelegate; i < l; i++ ) {
                item = this._list[i];
                item.handler.apply( item.caller, args.concat(item.args) );
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
        private seek( d: IDelegate ) {
            return this._list.findIndex(
                ( v ) => v.caller === d.caller && v.handler === d.handler,
            );
        }
    }
}
