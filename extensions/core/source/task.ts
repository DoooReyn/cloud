/**
 * @Author: Reyn jl88744653@gmail.com
 * @Description: 任务
 */

import { delegates } from "./delegates";
import { logger } from "./logger";

export namespace task {
    interface IDelayDelegate {
        onstart?: Function;
        onabort?: Function;
    }

    type TaskState = "idle" | "running" | "aborted" | "completed";

    class Task {
        protected _handler: delegates.Delegates;
        protected _onstarts: delegates.Delegates;
        protected _onaborts: delegates.Delegates;
        protected _state: TaskState = "idle";
        private _flag: number;

        public get running() {
            return this._state === "running";
        }

        public get idle() {
            return this._state === "idle";
        }

        public get aborted() {
            return this._state === "aborted";
        }

        public get completed() {
            return this._state === "completed";
        }

        constructor(
            private readonly $delay: number,
            delegate: delegates.IDelegate,
        ) {
            this._flag = 0;
            this._state = "idle";
            this._handler = new delegates.Delegates();
            this._onstarts = new delegates.Delegates();
            this._onaborts = new delegates.Delegates();
            this._handler.on( delegate );
        }

        public onbeforestart( d: delegates.IDelegate ) {
            this._handler.on( d );
        }

        public onstart( d: delegates.IDelegate ) {
            this._onstarts.on( d );
        }

        public onabort( d: delegates.IDelegate ) {
            this._onaborts.on( d );
        }

        public run() {
            if ( this._flag ) {
                return logger.use( "task" ).warn( "任务已经运行了" );
            }

            this._state = "running";
            this._flag = setTimeout( () => {
                this._handler.invoke();
                this._onstarts.invoke();
                this._state = "completed";
            }, this.$delay );
        }

        /**
         * 取消任务
         * @returns 取消结果
         */
        public abort() {
            if ( this._flag ) {
                clearTimeout( this._flag );
                this._flag = 0;
                this._state = "aborted";
                this._onaborts.invoke();
                return true;
            }
            return false;
        }

        public reset() {
            this.abort();
            this._state = "idle";
        }
    }

    export class TaskNode extends Task {
        public prev_node: TaskNode | null;
        public next_node: TaskNode | null;

        constructor(
            public readonly $step: string,
            $delay: number,
            delegate: delegates.IDelegate,
        ) {
            super( $delay, delegate );
            this.prev_node = null;
            this.next_node = null;
            this._state = "idle";
            this.onbeforestart( { caller: this, handler: this.start } );
            this.onstart( { caller: this, handler: this.next } );
        }

        private start() {
            logger.use( "task" ).debug( `步骤运行: ${ this.$step }` );
        }

        private next() {
            logger.use( "task" ).debug( `步骤完成: ${ this.$step }` );
            if ( this.next_node ) {
                this.next_node.run();
            }
        }
    }

    export class TaskPipe {
        private _head_node: TaskNode | null;
        private _tail_node: TaskNode | null;
        private _paused_node: TaskNode | null;
        private _locked: boolean;

        /**
         * 查找正在运行的节点
         */
        private get node() {
            let ret: TaskNode | null = this._head_node;
            let curr: TaskNode | null = this._head_node;
            while ( true ) {
                if ( !curr ) {
                    // 没有后置任务了
                    break;
                }

                if ( curr.running ) {
                    // 找到正在运行的任务了
                    ret = curr;
                    break;
                }

                if ( !curr.completed ) {
                    // 只有已完成的任务才能继续
                    break;
                }

                curr = curr.next_node;
            }
            return ret;
        }

        get chain() {
            let chain: string[] = [];

            if ( !this._head_node ) {
                logger.use( "task" ).warn( "空的任务队列" );
                return chain;
            }

            let curr: TaskNode | null = this._head_node;
            while ( true ) {
                if ( curr ) {
                    chain.push( curr.$step );
                    curr = curr.next_node;
                } else {
                    break;
                }
            }

            return chain;
        }

        constructor() {
            this._head_node = null;
            this._tail_node = null;
            this._paused_node = null;
            this._locked = false;
        }

        public pipe( step: string, delay: number, delegate: delegates.IDelegate ) {
            if ( !this._locked ) {
                const node = new TaskNode( step, delay, delegate );
                if ( !this._head_node ) {
                    this._head_node = node;
                    this._tail_node = node;
                } else {
                    this._tail_node!.next_node = node;
                    node.prev_node = this._tail_node!;
                    this._tail_node = node;
                }
            }

            return this;
        }

        public start() {
            if ( this._locked ) return;
            if ( !this._head_node ) return;

            this._locked = true;
            this._head_node.run();
        }

        public stop() {
            if ( this._locked ) {
                const node = this.node;
                if ( node ) {
                    node.abort();
                }

                // TODO::重置所有前置节点的状态
                let curr: TaskNode | null = this._head_node;
                while ( true ) {
                    if ( !curr ) {
                        break;
                    }
                    curr.reset();
                    curr = curr.next_node;
                }
                this._locked = false;
            }
        }

        public pause() {
            if ( this._locked ) {
                const node = this.node;
                if ( node ) {
                    node.abort();
                    this._paused_node = node;
                }
            }
        }

        public resume() {
            if ( this._locked && this._paused_node && this._paused_node.aborted ) {
                this._paused_node.run();
                this._paused_node = null;
            }
        }
    }
}
