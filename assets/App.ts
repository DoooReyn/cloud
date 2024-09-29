/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: App 入口
 */

import { _decorator, Color, Component, instantiate, Label, Node } from "cc";
import cloud from "core/index";

const { ccclass } = _decorator;

class TestLabel extends Node {
    constructor() {
        super("label:test");
        const lab = this.addComponent(Label);
        lab.fontSize = 40;
        lab.color = Color.GREEN;
    }
}

@ccclass("App")
export class App extends Component {
    start() {
        cloud.logger.cloud.debug(cloud.information);

        const template = this.node.getChildByName("Label");
        const delegate = {
            on_acquire: {
                caller: this,
                handler(node: Node) {
                    const tag = cloud.dict.get(node, "$pool");
                    node.name = tag;
                    node.active = true;
                    node.getComponent(Label).string = tag + "." + Date.now().toString();
                    node.setPosition(
                        cloud.digit.random_integer(-520, 520),
                        cloud.digit.random_integer(-320, 320),
                    );
                }
            },
            on_recycle: {
                caller: this,
                handler(node: Node) {
                    node.getComponent(Label).string = "";
                    node.active = false;
                    node.removeFromParent();
                }
            }
        };
        cloud.pool.factory.inject_template(
            "label:template",
            () => instantiate(template),
            delegate
        );

        cloud.pool.factory.inject_clazz(
            "label:clazz",
            TestLabel,
            delegate
        );

        const test = () => {
            const node1 = cloud.pool.factory.acquire("label:template");
            this.node.addChild(node1);

            const node2 = cloud.pool.factory.acquire("label:clazz");
            this.node.addChild(node2);

            cloud.timer.shared.next_second({
                caller: this,
                handler() {
                    cloud.pool.factory.recycle(node1);
                    cloud.pool.factory.recycle(node2);
                    test();
                }
            });
        };

        test();
    }

    update(deltaTime: number) {
    }
}
