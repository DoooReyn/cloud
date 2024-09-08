/**
 * @Author: doooreyn jl88744653@gmail.com
 * @Description: App 入口
 */

import { _decorator, Component, instantiate, Label, Node, Pool } from "cc";
import * as core from "core/exports";

const { ccclass, property } = _decorator;

class TestLabel extends Node implements core.pool.IPoolItem {
  public static readonly $cname = "label:test";
  private $lable: Label;

  constructor() {
    super("label:test");
    this.$lable = this.addComponent(Label);
  }

  $init(): void {
    this.$lable.string = TestLabel.$cname + Date.now().toString();
    this.active = true;
    this.setPosition(
      core.digit.random_integer(-520, 520),
      core.digit.random_integer(-320, 320),
    );
  }

  $deinit(): void {
    this.$lable.string = "";
    this.active = false;
    this.removeFromParent();
  }
}

@ccclass("App")
export class App extends Component {
  start() {
    console.log(core.information);
    console.log(core.pool.anything);

    const template = this.node.getChildByName("Label");
    core.pool.anything.inject<Node>(
      "label",
      template,
      function () {
        console.log("anything count: ", core.pool.anything.count("label"));
        const node = instantiate(template);
        node.active = true;
        node.getComponent(Label).string = Date.now().toString();
        node.setPosition(
          core.digit.random_integer(-520, 520),
          core.digit.random_integer(-320, 320),
        );
        return node;
      },
      function (label) {
        label.getComponent(Label).string = "";
        label.active = false;
        label.removeFromParent();
      },
    );

    core.pool.specified.inject(
      TestLabel,
      function () {
        console.log("specified count: ", core.pool.specified.count(TestLabel));
        return new TestLabel();
      },
      function (label) {
        console.log(TestLabel.$cname + " removed.");
      },
    );

    const test = () => {
      const node1 = core.pool.anything.acquire<Node>("label");
      this.node.addChild(node1);

      const node2 = core.pool.specified.acquire(TestLabel);
      this.node.addChild(node2);

      this.scheduleOnce(() => {
        core.pool.anything.recycle(node1);
        core.pool.specified.recycle(node2);
        test();
      }, 1);
    };

    test();
  }

  update(deltaTime: number) {}
}
