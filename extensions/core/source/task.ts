import { delegates } from "./delegates";
import { logger } from "./logger";

/**
 * 任务
 */
export namespace task {
  interface IDelayDelegate {
    onstart?: Function;
    onabort?: Function;
  }

  type TaskState = "idle" | "running" | "aborted" | "completed";

  class Task {
    private $flag: number;
    protected $handler: delegates.Delegates;
    protected $onstarts: delegates.Delegates;
    protected $onaborts: delegates.Delegates;
    protected $state: TaskState = "idle";

    constructor(
      private readonly $delay: number,
      delegate: delegates.IDelegate,
    ) {
      this.$flag = 0;
      this.$state = "idle";
      this.$handler = new delegates.Delegates();
      this.$onstarts = new delegates.Delegates();
      this.$onaborts = new delegates.Delegates();
      this.$handler.on(delegate);
    }

    public get running() {
      return this.$state === "running";
    }

    public get idle() {
      return this.$state === "idle";
    }

    public get aborted() {
      return this.$state === "aborted";
    }

    public get completed() {
      return this.$state === "completed";
    }

    public onbeforestart(d: delegates.IDelegate) {
      this.$handler.on(d);
    }

    public onstart(d: delegates.IDelegate) {
      this.$onstarts.on(d);
    }

    public onabort(d: delegates.IDelegate) {
      this.$onaborts.on(d);
    }

    public run() {
      if (this.$flag) {
        return logger.use("task").warn("任务已经运行了");
      }

      this.$state = "running";
      this.$flag = setTimeout(() => {
        this.$handler.invoke();
        this.$onstarts.invoke();
        this.$state = "completed";
      }, this.$delay);
    }

    /**
     * 取消任务
     * @returns 取消结果
     */
    public abort() {
      if (this.$flag) {
        clearTimeout(this.$flag);
        this.$flag = 0;
        this.$state = "aborted";
        this.$onaborts.invoke();
        return true;
      }
      return false;
    }

    public reset() {
      this.abort();
      this.$state = "idle";
    }
  }

  export class TaskNode extends Task {
    public $prev: TaskNode | null;
    public $next: TaskNode | null;

    constructor(
      public readonly $step: string,
      $delay: number,
      delegate: delegates.IDelegate,
    ) {
      super($delay, delegate);
      this.$prev = null;
      this.$next = null;
      this.$state = "idle";
      this.onbeforestart({ caller: this, handler: this.start });
      this.onstart({ caller: this, handler: this.next });
    }

    private start() {
      logger.use("task").debug(`步骤运行: ${this.$step}`);
    }

    private next() {
      logger.use("task").debug(`步骤完成: ${this.$step}`);
      if (this.$next) {
        this.$next.run();
      }
    }
  }

  export class TaskPipe {
    private $head: TaskNode | null;
    private $tail: TaskNode | null;
    private $paused_one: TaskNode | null;
    private $lock: boolean;

    constructor() {
      this.$head = null;
      this.$tail = null;
      this.$paused_one = null;
      this.$lock = false;
    }

    get chain() {
      let chain: string[] = [];

      if (!this.$head) {
        logger.use("task").warn("空的任务队列");
        return chain;
      }

      let curr: TaskNode | null = this.$head;
      while (true) {
        if (curr) {
          chain.push(curr.$step);
          curr = curr.$next;
        } else {
          break;
        }
      }

      return chain;
    }

    pipe(step: string, delay: number, delegate: delegates.IDelegate) {
      if (!this.$lock) {
        const node = new TaskNode(step, delay, delegate);
        if (!this.$head) {
          this.$head = node;
          this.$tail = node;
        } else {
          this.$tail!.$next = node;
          node.$prev = this.$tail!;
          this.$tail = node;
        }
      }

      return this;
    }

    /**
     * 查找正在运行的节点
     */
    private get node() {
      let ret: TaskNode | null = this.$head;
      let curr: TaskNode | null = this.$head;
      while (true) {
        if (!curr) {
          // 没有后置任务了
          break;
        }

        if (curr.running) {
          // 找到正在运行的任务了
          ret = curr;
          break;
        }

        if (!curr.completed) {
          // 只有已完成的任务才能继续
          break;
        }

        curr = curr.$next;
      }
      return ret;
    }

    start() {
      if (this.$lock) return;
      if (!this.$head) return;

      this.$lock = true;
      this.$head.run();
    }

    stop() {
      if (this.$lock) {
        const node = this.node;
        if (node) {
          node.abort();
        }

        // TODO::重置所有前置节点的状态
        let curr: TaskNode | null = this.$head;
        while (true) {
          if (!curr) {
            break;
          }
          curr.reset();
          curr = curr.$next;
        }
        this.$lock = false;
      }
    }

    pause() {
      if (this.$lock) {
        const node = this.node;
        if (node) {
          node.abort();
          this.$paused_one = node;
        }
      }
    }

    resume() {
      if (this.$lock && this.$paused_one && this.$paused_one.aborted) {
        this.$paused_one.run();
        this.$paused_one = null;
      }
    }
  }
}
