/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 日志记录
 */

export namespace logger {
    /**
     * 是否在控制台使用颜色
     * @warning 有些平台不支持，需要开发者手动关掉
     */
    let use_color: boolean = true;

    /**
     * 日志等级
     */
    export enum LOG_LEVEL {
        /** 一般 */
        DEBUG /** 提示 */,
        INFO /** 警报 */,
        WARN /** 异常 */,
        ERROR /** 关闭 */,
        None,
    }

    /**
     * 日志
     */
    class Logger {
        /** 所有日志记录器 */
        private static readonly ALL: Record<string, Logger> = Object.create( null );

        /**
         * 获取一个日志记录器
         * @param tag 日志标识
         */
        public static use( tag: string ) {
            return ( Logger.ALL[tag] ??= new Logger( tag ) );
        }

        /**
         * 销毁一个日志记录器
         * @param tag 日志标识
         */
        public static unuse( tag: string ) {
            delete Logger.ALL[tag];
        }

        /**
         * 暂停输出
         * @param tag 日志标识
         */
        public static pause( tag?: string ) {
            if ( tag !== undefined ) {
                if ( Logger.ALL[tag] ) {
                    // @ts-ignore
                    Logger.ALL[tag]["STACK"] = Logger.ALL[tag].level;
                    Logger.ALL[tag].level = LOG_LEVEL.None;
                }
            } else {
                for ( let t in Logger.ALL ) {
                    // @ts-ignore
                    Logger.ALL[t]["STACK"] = Logger.ALL[t].level;
                    Logger.ALL[t].level = LOG_LEVEL.None;
                }
            }
        }

        /**
         * 恢复输出
         * @param tag 日志标识
         */
        public static resume( tag?: string ) {
            if ( tag !== undefined ) {
                if ( Logger.ALL[tag] ) {
                    // @ts-ignore
                    Logger.ALL[tag].level = Logger.ALL[tag]["STACK"];
                }
            } else {
                for ( let t in Logger.ALL ) {
                    // @ts-ignore
                    Logger.ALL[t].level = Logger.ALL[t]["STACK"];
                }
            }
        }

        /**
         * 日志标识
         * @private
         */
        private _tag: string;

        /**
         * 日志等级
         * @private
         */
        private _level: LOG_LEVEL;

        /**
         * 日志等级
         * @getter
         */
        public get level() {
            return this._level;
        }

        /**
         * 设置日志等级
         * @setter
         * @param l 日志等级
         */
        public set level( l: LOG_LEVEL ) {
            this._level = l;
        }

        /**
         * 日志构造器
         * @param tag
         * @param level
         */
        public constructor( tag: string, level: LOG_LEVEL = LOG_LEVEL.DEBUG ) {
            this._tag = tag;
            this._level = level;
        }

        /**
         * 输出原始日志
         * @param outputs
         */
        public raw( ...outputs: any[] ) {
            console.debug( ...outputs );
        }

        /**
         * 输出一般日志
         * @param outputs 日志内容
         */
        public debug( ...outputs: any[] ) {
            if ( this._level <= LOG_LEVEL.DEBUG ) {
                if ( use_color ) {
                    console.debug(
                        "%c D ",
                        "color:white;background-color:rgb(102,109,117)",
                        ...outputs,
                    );
                } else {
                    console.debug( "[D]", ...outputs );
                }
            }
        }

        /**
         * 输出提示日志
         * @param outputs 日志内容
         */
        public info( ...outputs: any[] ) {
            if ( this._level <= LOG_LEVEL.INFO ) {
                if ( use_color ) {
                    console.info(
                        "%c I ",
                        "color:white;background-color:rgb(61,132,247)",
                        ...outputs,
                    );
                } else {
                    console.info( "[I]", ...outputs );
                }
            }
        }

        /**
         * 输出一般日志
         * @param outputs 日志内容
         */
        public warn( ...outputs: any[] ) {
            if ( this._level <= LOG_LEVEL.WARN ) {
                if ( use_color ) {
                    console.warn(
                        "%c W ",
                        "color:white;background-color:rgb(234,166,68)",
                        ...outputs,
                    );
                } else {
                    console.warn( "[W]", ...outputs );
                }
            }
        }

        /**
         * 输出一般日志
         * @param outputs 日志内容
         */
        public error( ...outputs: any[] ) {
            if ( this._level <= LOG_LEVEL.ERROR ) {
                if ( use_color ) {
                    console.error(
                        "%c E ",
                        "color:white;background-color:rgb(231,74,97)",
                        ...outputs,
                    );
                } else {
                    console.error( "[E]", ...outputs );
                }
            }
        }
    }

    /**
     * 创建日志记录器
     * @param tag 日志标识
     * @param level 默认日志等级
     */
    export function create( tag: string, level: LOG_LEVEL = LOG_LEVEL.DEBUG ) {
        const log = Logger.use( tag );
        log.level = level;
        return log;
    }

    /**
     * 使用日志记录器
     * @param tag 日志标识
     */
    export function use( tag: string ) {
        return Logger.use( tag );
    }

    /**
     * 销毁日志记录器
     * @param tag 日志标识
     */
    export function unuse( tag: string ) {
        Logger.unuse( tag );
    }

    /**
     * 暂停日志输出
     * @param tag 日志标识
     */
    export function pause( tag?: string ) {
        Logger.pause( tag );
    }

    /**
     * 恢复日志输出
     * @param tag 日志标识
     */
    export function resume( tag?: string ) {
        Logger.resume( tag );
    }

    /** 初始化 */
    export function initialize( color: boolean ) {
        use_color = color;
    }

    /**
     * 默认日志记录器
     */
    export const cloud = create( "cloud" );
}
