import { HierarchyLayer, LayerCapability } from "../layer";
import { Constructor, Prefab, Node } from "cc";

abstract class UIWindow extends HierarchyLayer {
    private _content: Node = null!;

    constructor(public readonly path: string) {
        super( { name: path, touch_cross: false, visible: true, ui_opaque: false } );
    }

    public load() {
        // TODO::2 加载内容
    }
}

export class WindowCapability extends LayerCapability {

    private _windows: UIWindow[];

    constructor( layer: HierarchyLayer ) {
        super( layer );

        this._windows = [];
    }

    public open( win: Constructor<UIWindow> ) {}

    public close() {}

    public back() {}
}