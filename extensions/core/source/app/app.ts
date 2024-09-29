/**
 * App 构建流程
 * 1. app.initialize
 * 2. app.start
 * 3. app.pause
 * 4. app.resume
 * 5. app.stop
 */

import { game, Game } from "cc";
import { delegates } from "../delegates";
import { logger } from "../logger";
import { singletons } from "../singleton";
import { platform } from "./platform";
import { globals } from "../globals";
import { runner } from "../runner";

/**
 * App
 */
class App {
    public static readonly $cname: string = "app";
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

    /**
     * 初始化
     */
    public initialize() {
        const that = this;
        game.once(Game.EVENT_ENGINE_INITED, function () {
            logger.cloud.debug(Game.EVENT_ENGINE_INITED, game.inited);
            that.on_engine_init!.invoke();
            that.on_engine_init!.off_all();
            that.on_engine_init = null;
        });
        game.once(Game.EVENT_GAME_INITED, function () {
            logger.cloud.debug(Game.EVENT_GAME_INITED, game.inited);
            that.on_app_init!.invoke();
            that.on_app_init!.off_all();
            that.on_app_init = null;
            that.start();
        });
        game.on(Game.EVENT_SHOW, function () {
            that.on_show!.invoke();
        });
        game.on(Game.EVENT_HIDE, function () {
            that.on_hide!.invoke();
        });
        game.on(Game.EVENT_CLOSE, function () {
            that.on_hide!.invoke();
            that.on_pause!.invoke();
        });
    }

    /**
     * 重启
     */
    public restart() {
        if (platform.native) {
            if (platform.ios || platform.android) {
                // iOS 和 Android 给原生层发送事件（需要开发者在原生层注册对应接口）
                platform.bridge.dispatch("restart");
                return;
            }
        } else if (platform.minigame) {
            if (platform.bytedance) {
                // 抖音提供了重启接口，可以直接调用
                runner.execute_in_safe_mode(null, null, () => {
                    globals.get<any>("tt").restartMiniProgramSync();
                });
                return;
            } else if (platform.wechat) {
                // 微信提供了重启接口，可以直接调用
                runner.execute_in_safe_mode(null, null, () => {
                    globals.get<any>("wx").restartMiniProgram({});
                });
                return;
            } else if (platform.alipay) {
                // 支付宝提供了重启接口，可以直接调用
                runner.execute_in_safe_mode(null, null, () => {
                    globals.get<any>("my").restartMiniProgram({});
                });
            } else {
                // TODO 其他小游戏
            }
        } else if (platform.browser) {
            // 网页版可以直接刷新页面
            location.reload();
            return;
        }

        logger.cloud.warn(`重启失败：不支持的平台 ${platform.os}-${platform.name}`);
    }

    /**
     * 退出
     */
    public stop() {
        if (game.inited) this.on_stop!.invoke();
        game.end();
    }

    /**
     * 暂停
     */
    public pause() {
        if (game.inited) this.on_pause!.invoke();
    }

    /**
     * 恢复
     */
    public resume() {
        if (game.inited) this.on_resume!.invoke();
    }

    /**
     * 开始
     * @protected
     */
    protected start() {
        if (game.inited) {
            this.on_start!.invoke();
            this.on_start!.off_all();
            this.on_start = null;
        }
    }
}

export const app = singletons.acquire<App>(App);
