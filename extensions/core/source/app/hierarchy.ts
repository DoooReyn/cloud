import { Node } from "cc";
import { UILayer, ILayerPreference } from "./layer";
import { UIBottomLayer } from "./layer/bottom";
import { UIWindowLayer } from "./layer/window";

export class Hierarchy {
    private static $temp: UILayer[] = [];
    public readonly bottom: UIBottomLayer = null!;
    public readonly window: UILayer = null!;
    public readonly dialog: UILayer = null!;
    public readonly toast: UILayer = null!;
    public readonly guide: UILayer = null!;
    public readonly loading: UILayer = null!;
    public readonly warn: UILayer = null!;
    public readonly top: UILayer = null!;

    public static AddLayer( info: ILayerPreference ) {
        Hierarchy.$temp.push( new UILayer( info ) );
    }

    public static Build( root: Node ) {
        const hierarchy = new Hierarchy( root );
        const layers = this.$temp;
        var layer: UILayer;
        for ( let i = 0, l = layers.length; i < l; i++ ) {
            layer = layers[i];
            root.addChild( layer );
            layer.initialize();
            hierarchy._layers[layer.preference.name] = layer;
        }
        Hierarchy.$temp.length = 0;
        return hierarchy;
    }

    private _layers: Record<string, UILayer> = {};

    constructor( public readonly root: Node ) {

        this.bottom = new UIBottomLayer();
        this.window = new UIWindowLayer();
        Hierarchy.AddLayer( { name: "window", touch_cross: true, translucency: false, visible: true } );
        Hierarchy.AddLayer( { name: "dialog", touch_cross: false, translucency: true, visible: false } );
        Hierarchy.AddLayer( { name: "toast", touch_cross: true, translucency: false, visible: false } );
        Hierarchy.AddLayer( { name: "waiting", touch_cross: false, translucency: false, visible: false } );
        Hierarchy.AddLayer( { name: "guide", touch_cross: false, translucency: true, visible: false } );
        Hierarchy.AddLayer( { name: "loading", touch_cross: false, translucency: true, visible: false } );
        Hierarchy.AddLayer( { name: "transition", touch_cross: false, translucency: false, visible: false } );
        Hierarchy.AddLayer( { name: "warning", touch_cross: false, translucency: true, visible: false } );
        Hierarchy.AddLayer( { name: "top", touch_cross: false, translucency: false, visible: true } );
    }

    public get( name: string ) {
        return this._layers[name];
    }
}