/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: App 入口
 */

import { _decorator, Color, Component, instantiate, Label, Node } from "cc";
import * as core from "core/exports";

const { ccclass, property } = _decorator;

class TestLabel extends Node {

    constructor() {
        super( "label:test" );
        const lab = this.addComponent( Label );
        lab.fontSize = 40;
        lab.color = Color.GREEN;
    }
}

@ccclass( "App" )
export class App extends Component {
    start() {
        core.logger.cloud.debug( core.information );

        const template = this.node.getChildByName( "Label" );
        const delegate = {
            on_acquire: {
                caller: this,
                handler( node: Node ) {
                    const tag = core.dict.get( node, "$pool" );
                    node.name = tag;
                    node.active = true;
                    node.getComponent( Label ).string = tag + "." + Date.now().toString();
                    node.setPosition(
                        core.digit.random_integer( -520, 520 ),
                        core.digit.random_integer( -320, 320 ),
                    );
                }
            },
            on_recycle: {
                caller: this,
                handler( node: Node ) {
                    node.getComponent( Label ).string = "";
                    node.active = false;
                    node.removeFromParent();
                }
            }
        };
        core.pool.factory.inject_template(
            "label:template",
            () => instantiate( template ),
            delegate
        );

        core.pool.factory.inject_clazz(
            "label:clazz",
            TestLabel,
            delegate
        );

        const test = () => {
            const node1 = core.pool.factory.acquire( "label:template" );
            this.node.addChild( node1 );

            const node2 = core.pool.factory.acquire( "label:clazz" );
            this.node.addChild( node2 );

            core.timer.shared.next_second( {
                                               caller: this,
                                               handler() {
                                                   core.pool.factory.recycle( node1 );
                                                   core.pool.factory.recycle( node2 );
                                                   test();
                                               }
                                           } );
        };

        test();

        // @ts-ignore
        window.core = core;
    }

    update( deltaTime: number ) {}
}
