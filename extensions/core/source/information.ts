/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: 基础信息
 */

import { EDITOR } from "cc/env";
import { literal } from "./literal";
import { runner } from "./runner";
import { logger } from "./logger";

/** 基础信息 */
export const information = {
    /** 扩展名称 */
    extension: "core",
    /** 版本号 */
    version: "1.0.0",
    /** Github */
    github: "https://github.com/doooreyn/cloud.git",
    /** Gitee */
    gitee: "https://gitee.com/reyn/cloud.git",
    /** 作者 */
    author: "doooreyn",
    /** 贡献者 */
    contributors: [],
};

/** 导入时向控制台输出一次基础信息 */
runner.execute_not_in( EDITOR, function () {
    logger.cloud.raw(
        literal.join_lines(
            "~~~~~ cloud ~~~~~",
            "  扩展: " + information.extension,
            "  版本: " + information.version,
            "~~~~~~~~~~~~~~~~~",
        ),
    );
} );
