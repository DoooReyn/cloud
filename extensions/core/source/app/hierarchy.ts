import { Node } from "cc";
import { HierarchyLayer, ILayerPreference } from "./layer";

export class Hierarchy {
    private static $temp: HierarchyLayer[] = [];
    public readonly bottom: HierarchyLayer = null!;
    public readonly map: HierarchyLayer = null!;
    public readonly ui: HierarchyLayer = null!;
    public readonly dialog: HierarchyLayer = null!;
    public readonly toast: HierarchyLayer = null!;
    public readonly guide: HierarchyLayer = null!;
    public readonly loading: HierarchyLayer = null!;
    public readonly warn: HierarchyLayer = null!;
    public readonly top: HierarchyLayer = null!;

    public static AddLayer( info: ILayerPreference ) {
        Hierarchy.$temp.push( new HierarchyLayer( info ) );
    }

    public static Build( root: Node ) {
        const hierarchy = new Hierarchy( root );
        const layers = this.$temp;
        var layer: HierarchyLayer;
        for ( let i = 0, l = layers.length; i < l; i++ ) {
            layer = layers[i];
            root.addChild( layer );
            layer.initialize();
            hierarchy._layers[layer.preference.name] = layer;
        }
        Hierarchy.$temp.length = 0;
        return hierarchy;
    }

    private _layers: Record<string, HierarchyLayer> = {};

    constructor( public readonly root: Node ) {}

    public get( name: string ) {
        return this._layers[name];
    }
}