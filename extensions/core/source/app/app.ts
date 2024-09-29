/**
 * App 构建流程
 * 1. app.initialize
 * 2. app.start
 * 3. app.pause
 * 4. app.resume
 * 5. app.stop
 */

import { director, Director, Game, game, Node, Scene } from "cc";
import { delegates } from "../delegates";
import { logger } from "../logger";
import { singletons } from "../singleton";
import { platform } from "./platform";
import { globals } from "../globals";
import { runner } from "../runner";
import { settings } from "./settings";
import { information } from "../information";
import { tips } from "./tips";
import { datetime } from "../datetime";
import { stat } from "./stat";

class AppHook {
    public on_engine_init: delegates.Delegates | null;
    public on_app_init: delegates.Delegates | null;
    public on_start: delegates.Delegates | null;
    public on_stop: delegates.Delegates | null;
    public on_pause: delegates.Delegates | null;
    public on_resume: delegates.Delegates | null;
    public on_show: delegates.Delegates | null;
    public on_hide: delegates.Delegates | null;

    public constructor() {
        this.on_engine_init = new delegates.Delegates();
        this.on_app_init = new delegates.Delegates();
        this.on_start = new delegates.Delegates();
        this.on_stop = new delegates.Delegates();
        this.on_pause = new delegates.Delegates();
        this.on_resume = new delegates.Delegates();
        this.on_show = new delegates.Delegates();
        this.on_hide = new delegates.Delegates();
    }
}

/**
 * App
 */
class App {
    public static readonly $cname: string = "app";
    public readonly hook: AppHook = new AppHook();
    public preferences: settings.IPreference | undefined;
    public scene: Scene | undefined;
    public root: Node | undefined;
    private _time_span: datetime.Record = new datetime.Record( App.$cname );

    /**
     * 初始化
     */
    public initialize( env: settings.Env ) {
        this.preferences = settings.initialize( env );
        logger.core.table( tips.information, information );
        logger.core.table( tips.preference, this.preferences );

        const that = this;
        game.once( Game.EVENT_ENGINE_INITED, function () {
            that.hook.on_engine_init!.invoke();
            that.hook.on_engine_init!.off_all();
            that.hook.on_engine_init = null;
            logger.core.debug( tips.engine_initialized );
        } );
        game.once( Game.EVENT_GAME_INITED, function () {
            that.hook.on_app_init!.invoke();
            that.hook.on_app_init!.off_all();
            that.hook.on_app_init = null;
            logger.core.debug( tips.app_initialized );
        } );
        game.on( Game.EVENT_SHOW, function () {
            logger.core.debug( tips.app_bring_to_foreground );
            that._time_span.end();
            logger.core.debug( `${ tips.app_stay_at_background } ${ that._time_span.elapsed / 1000 }s` );
            that.hook.on_show!.invoke();
        } );
        game.on( Game.EVENT_HIDE, function () {
            logger.core.debug( tips.app_come_to_background );
            that._time_span.start();
            that.hook.on_hide!.invoke();
        } );
        director.once( Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            logger.core.debug( tips.app_scene_launched );
            that.scene = director.getScene()!;
            that.root = that.scene.children.find( v => v.name == "Canvas" );

            game.frameRate = that.preferences!.fps - Number.EPSILON;

            stat.hack();
            that.preferences!.show_stat ? stat.show() : stat.hide();

            that.start();
        } );
    }

    /**
     * 重启
     */
    public restart() {
        logger.core.debug( tips.app_attempt_to_restart );
        if ( platform.native ) {
            if ( platform.ios || platform.android ) {
                // iOS 和 Android 给原生层发送事件（需要开发者在原生层注册对应接口）
                platform.bridge.dispatch( "restart" );
                return;
            }
        } else if ( platform.minigame ) {
            if ( platform.bytedance ) {
                // 抖音提供了重启接口，可以直接调用
                runner.execute_in_safe_mode( null, null, () => {
                    globals.get<any>( "tt" ).restartMiniProgramSync();
                } );
                return;
            } else if ( platform.wechat ) {
                // 微信提供了重启接口，可以直接调用
                runner.execute_in_safe_mode( null, null, () => {
                    globals.get<any>( "wx" ).restartMiniProgram( {} );
                } );
                return;
            } else if ( platform.alipay ) {
                // 支付宝提供了重启接口，可以直接调用
                runner.execute_in_safe_mode( null, null, () => {
                    globals.get<any>( "my" ).restartMiniProgram( {} );
                } );
            } else {
                // TODO 其他小游戏
            }
        } else if ( platform.browser ) {
            // 网页版可以直接刷新页面
            location.reload();
            return;
        }

        logger.core.warn( `${ tips.app_restart_failed } ${ platform.os }-${ platform.name }` );
    }

    /**
     * 退出
     */
    public stop() {
        if ( game.inited ) {
            this.hook.on_stop!.invoke();
        }
        logger.core.debug( tips.app_quited );
        game.end();
    }

    /**
     * 暂停
     */
    public pause() {
        if ( game.inited && !game.isPaused() ) {
            this.hook.on_pause!.invoke();
            logger.core.debug( tips.app_paused );
        }
    }

    /**
     * 恢复
     */
    public resume() {
        if ( game.inited && game.isPaused() ) {
            this.hook.on_resume!.invoke();
            logger.core.debug( tips.app_resumed );
        }
    }

    /**
     * 开始
     * @protected
     */
    protected start() {
        if ( game.inited ) {
            this.hook.on_start!.invoke();
            this.hook.on_start!.off_all();
            this.hook.on_start = null;
            logger.core.debug( tips.app_launched );
        }
    }
}

export const app = singletons.acquire<App>( App );