/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 精确定时器
 */

import { director, macro, Scheduler } from "cc";
import { delegates } from "./delegates";
import { datetime } from "./datetime";

export namespace timer {

    /** 全局定时器递增 ID */
    let global_tid: number = 200;

    /** 取下一个定时器 ID */
    function next_tid() {
        return ++global_tid;
    }

    class TimeInfo {
        public readonly id: number;
        private _total: number;
        private _ticks: number;

        public get over() {
            // 必须触发不少于已限定的次数
            return this._ticks >= this.ticks;
        }

        constructor(
            public readonly delay: number,
            public readonly interval: number,
            public readonly ticks: number,
            public readonly delegate: delegates.Delegate
        ) {
            this.id = next_tid();
            this._total = 0;
            this._ticks = 0;
        }

        public tick( dt: number ) {
            this._total += dt * datetime.TIME_SECOND;
            if ( this._ticks == 0 && this.delay > 0 ) {
                // 延迟时间大于零且未触发过
                if ( this._total - this.delay >= 0 ) {
                    this.invoke();
                }
            } else {
                // 累计时长-延迟时间-循环次数*时间间隔 >= 时间间隔
                if ( this._total - this.delay - this._ticks * this.interval >= this.interval ) {
                    this.invoke();
                }
            }
        }

        private invoke() {
            ++this._ticks;
            let args = this.delegate.args ? [ this._ticks, ...this.delegate.args ] : [ this._ticks ];
            this.delegate.handler.apply( this.delegate.caller, args );
        }
    }

    export class Timer {
        public readonly id: string;
        public readonly uuid: string;
        private readonly _scheduler: Scheduler;
        private readonly _list: TimeInfo[];

        public constructor() {
            const id = next_tid();
            this.uuid = "timer." + id;
            this.id = id.toString();
            this._scheduler = new Scheduler();
            this._list = [];
            director.registerSystem( this.uuid, this._scheduler, id );
            this._scheduler.scheduleUpdate( this, 0, false );
        }

        public next( delay: number, delegate: delegates.Delegate ) {
            const info = new TimeInfo( delay, 0, 1, delegate );
            this._list.push( info );
            return info.id;
        }

        public next_tick( delegate: delegates.Delegate ) {
            return this.next( datetime.TIME_ZERO, delegate );
        }

        public next_frame( delegate: delegates.Delegate ) {
            return this.next( datetime.TIME_FRAME, delegate );
        }

        public next_second( delegate: delegates.Delegate ) {
            return this.next( datetime.TIME_SECOND, delegate );
        }

        public cancel( tid: number ) {
            const idx = this._list.findIndex( v => v.id == tid );
            if ( idx > -1 ) {
                this._list.splice( idx, 1 );
            }
        }

        public repeat( delay: number, interval: number, ticks: number, delegate: delegates.Delegate ) {
            if ( ticks < 0 ) ticks = macro.REPEAT_FOREVER;
            const info = new TimeInfo( delay, interval, ticks, delegate );
            this._list.push( info );
            return info.id;
        }

        public repeat_forever( delay: number, interval: number, delegate: delegates.Delegate ) {
            this.repeat( delay, interval, macro.REPEAT_FOREVER, delegate );
        }

        public repeat_every_frame( delay: number, delegates: delegates.Delegate ) {
            this.repeat_forever( delay, datetime.TIME_FRAME, delegates );
        }

        public repeat_every_second( delay: number, delegates: delegates.Delegate ) {
            this.repeat_forever( delay, datetime.TIME_SECOND, delegates );
        }

        public update( dt: number ) {
            var timer_info: TimeInfo;
            var timers = this._list;
            for ( let i = 0, l = timers.length; i < l; i++ ) {
                timer_info = timers[i];
                timer_info.tick( dt );
                if ( timer_info.over ) {
                    timers.splice( i, 1 );
                    i--;
                }
            }
        }

        public running( tid: number ) {
            return this._list.findIndex( v => v.id == tid ) > -1;
        }

        public pause() {
            this._scheduler.pauseTarget( this );
        }

        public resume() {
            this._scheduler.resumeTarget( this );
        }
    }

    export const shared = new Timer();
}