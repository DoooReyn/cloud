import { UILayer } from "../layer";
import { UIView } from "../view";

abstract class UIWindow extends UILayer {
    private _view: UIView = null!;

    constructor( public readonly path: string, protected data: any ) {
        super( { name: path, touch_cross: false, visible: true, translucency: false } );
    }

    public load() {
        if ( this._view ) return;

        // TODO::加载预制体
    }

    private load_remote(path: string) {

    }

    private load_from_bundle(bundle: string, path: string) {

    }

    private load_from_local(path: string) {
        this.load_from_bundle("resources", path);
    }
}

export class UIWindowLayer extends UILayer {

    private _windows: UIWindow[];

    constructor() {
        super( { name: "window", touch_cross: true, translucency: false, visible: true } );

        this._windows = [];
    }

    public open( path: string, data?: any ) {}

    public close( path: string ) {}

    public back() {}

    public save() {}
}