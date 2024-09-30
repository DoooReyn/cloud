import cloud from "core/index";
import { EDITOR } from "cc/env";
import { delegates } from "core/delegates";

if ( !EDITOR ) {
    const engine_init: delegates.IDelegate = {
        caller: null,
        handler() {
            // 可以在这里：
            // 1. Hack 引擎代码
            // 2. 注册全局变量（不建议注册太多全局的东西，避免混乱）
            // 3. 引入第三方插件
        }
    }
    cloud.app.hook.on_engine_init.on( engine_init );

    cloud.app.initialize( "debug" );
}
