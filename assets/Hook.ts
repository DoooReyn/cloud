import { app, globals } from "core/exports";

app.on_engine_init.on({
    caller: null, handler() {
        // 可以在这里去 Hack 引擎代码
        // 也可以在这里注册全局变量或者引入第三方插件
        globals.register("app", app);
    }
});

app.initialize();