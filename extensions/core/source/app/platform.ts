import { native as hybrid, sys } from "cc";
import { singletons } from "../singleton";

/**
 * 运行平台或环境
 */
export namespace platform {
    export const os = sys.os;
    export const android = os === sys.OS.ANDROID;
    export const ios = os === sys.OS.IOS;
    export const mac = os === sys.OS.OSX;
    export const win = os === sys.OS.WINDOWS;
    export const linux = os === sys.OS.LINUX;

    export const native = sys.isNative;
    export const mobile = sys.isMobile;
    export const browser = sys.isBrowser;
    export const desktop = linux || mac || win;

    export const name = sys.platform;
    export const wechat = name === sys.Platform.WECHAT_GAME;
    export const bytedance = name === sys.Platform.BYTEDANCE_MINI_GAME;
    export const baidu = name === sys.Platform.BAIDU_MINI_GAME;
    export const alipay = name === sys.Platform.ALIPAY_MINI_GAME;
    export const taobao = name === sys.Platform.TAOBAO_MINI_GAME;
    export const oppo = name === sys.Platform.OPPO_MINI_GAME;
    export const vivo = name === sys.Platform.VIVO_MINI_GAME;
    export const huawei = name === sys.Platform.HUAWEI_QUICK_GAME;
    export const harmony = name === sys.Platform.OPENHARMONY;
    export const xiaomi = name === sys.Platform.XIAOMI_QUICK_GAME;
    export const toutiao = name === sys.Platform.QTT_MINI_GAME;
    export const minigame = wechat || bytedance || baidu || alipay || taobao || oppo || vivo || huawei || harmony || xiaomi || toutiao;

    /**
     * 原生平台交互
     * @description 交互说明
     * ```
     * - JS与原生交互
     *   1. 在原生层注册事件 `JsbBridgeWrapper.addScriptEventListener`
     *   2. 在JS层发送消息 `platform.bridge.dispatch`
     * - 原生与JS交互
     *   1. 在JS层注册事件 `platform.bridge.register`
     *   2. 在原生层发送消息 `JsbBridgeWrapper.dispatchEventToScript`
     * ```
     * @warn 交互时只能传递字符串，如果需要传递对象，请先序列化成JSON字符串再传递
     * @example Android
     * ```java
     * JsbBridgeWrapper jbw = JsbBridgeWrapper.getInstance();
     * jbw.addScriptEventListener("requestLabelContent", arg ->{
     *     System.out.print("@JAVA: here is the argument transport in" + arg);
     *     jbw.dispatchEventToScript("changeLabelContent","Charlotte");
     * });
     * ```
     * @example iOS
     * ```objective-c
     * // Objective-C
     * JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
     * OnScriptEventListener requestLabelContent = ^void(NSString* arg){
     *     JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
     *     [m dispatchEventToScript:@"changeLabelContent" arg:@"Charlotte"];
     * };
     * [m addScriptEventListener:@"requestLabelContent" listener:requestLabelContent];
     * ```
     */
    export class Bridge {
        public static readonly $cname = "platform.bridge";

        /**
         * 注册原生平台事件监听
         * @param event 事件名称
         * @param callback 事件回调
         */
        public register(event: string, callback: (arg: string) => void) {
            native && hybrid.jsbBridgeWrapper.addNativeEventListener(event, callback);
        }

        /**
         * 注销原生平台事件监听
         * @param event 事件名称
         * @param callback 事件回调
         */
        public unregister(event: string, callback: (arg: string) => void) {
            native && hybrid.jsbBridgeWrapper.removeNativeEventListener(event, callback);
        }

        /**
         * 给原生平台发送消息
         * @param event 事件
         * @param command 参数（只能是字符串）
         */
        public dispatch(event: string, command?: string | { [key: string]: any }) {
            if (native) {
                if (typeof command === "object") {
                    command = JSON.stringify(command);
                }
                hybrid.jsbBridgeWrapper.dispatchEventToNative(event, command);
            }
        }
    }

    export const bridge = singletons.acquire<Bridge>(Bridge);
}