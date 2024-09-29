import cloud from "core/index";

cloud.app.hook.on_engine_init.on({
    caller: null, handler() {
        // 可以在这里：
        // 1. Hack 引擎代码
        // 2. 注册全局变量（不建议注册太多全局的东西，避免混乱）
        // 3. 引入第三方插件
    }
});

cloud.app.initialize("debug");