/**
 * 游戏预设值
 */
export namespace settings {
    /**
     * 基础预设值
     */
    export interface IPreference {
        /** 环境 */
        env: string;
        /** 日志开关 */
        log: boolean;
        /** 游戏名称 */
        app_name: string;
        /** 游戏版本 */
        app_version: string;
        /** 资源服务器地址 */
        server_addr_res: string;
        /** 登录服务器地址 */
        server_addr_login: string;
        /** 游戏服务器地址 */
        server_addr_game: string;
        /** SDK 标识符 */
        sdk: string;
        /** 是否超级账号 */
        admin: boolean;
        /** 本地存储密钥 */
        storage_kv: Array<string | 2>;
        /** 语言 */
        lang: string;
        /** GM 开关 */
        gm: boolean;
        /** 连接超时 */
        timeout: number;
        /** 自动登录开关 */
        auto_login: boolean;
        /** 游戏 LOGO */
        logo: string;
    }

    /**
     * 预设值映射
     * @private
     */
    const preferences_map = {
        debug: {
            env: "debug",
            log: true,
            app_name: "cloud",
            app_version: "0.0.1",
            storage_kv: [ "cloud-storage-key-debug", "cloud-storage-iv-debug" ],
            server_addr_res: "http://127.0.0.1:9001/res/",
            server_addr_login: "http://127.0.0.1:9001/login/",
            server_addr_game: "ws://127.0.0.1:9001/ws/",
            sdk: "",
            logo: "",
            lang: "zh",
            admin: true,
            gm: true,
            timeout: 7200,
            auto_login: false
        },
        release: {
            env: "release",
            log: false,
            app_name: "cloud",
            app_version: "0.0.1",
            storage_kv: [ "cloud-storage-key-release", "cloud-storage-iv-release" ],
            server_addr_res: "https://127.0.0.1:9001/res/",
            server_addr_login: "https://127.0.0.1:9001/login/",
            server_addr_game: "wss://127.0.0.1:9001/wss/",
            sdk: "",
            logo: "",
            lang: "zh",
            admin: false,
            gm: false,
            timeout: 3000,
            auto_login: false
        }
    };

    /** 环境类型 */
    export type Env = keyof typeof preferences_map;

    /**
     * 初始化预设值配置
     * @param env 环境
     */
    export function initialize(env: Env) {
        return preferences_map[env];
    }
}