import {
    Color,
    Component,
    Constructor,
    EventTouch,
    Graphics,
    Node,
    screen,
    Tween,
    tween,
    UIOpacity,
    UITransform,
    Vec3,
    Widget
} from "cc";
import { app } from "./app";
import { constants } from "./constants";
import { logger } from "../logger";
import { delegates } from "../delegates";

/**
 * 层级初始预设值
 */
export interface ILayerPreference {
    /** 层级名称 */
    name: string;
    /** 是否允许触摸穿透 */
    touch_cross: boolean;
    /** 是否显示半透遮罩 */
    translucency: boolean;
    /** 是否可视 */
    visible: boolean;
}

class LayerHook {
    public readonly on_began: delegates.Delegates = new delegates.Delegates();
    public readonly on_move: delegates.Delegates = new delegates.Delegates();
    public readonly on_ended: delegates.Delegates = new delegates.Delegates();
    public readonly on_leave: delegates.Delegates = new delegates.Delegates();
    public readonly on_enable: delegates.Delegates = new delegates.Delegates();
    public readonly on_disable: delegates.Delegates = new delegates.Delegates();
    public readonly on_destroy: delegates.Delegates = new delegates.Delegates();
}

/**
 * 层级基类
 */
export class UILayer extends Node {
    public readonly hook: LayerHook;
    protected readonly ui_trans: UITransform;
    protected readonly ui_adapter: Widget;
    protected readonly ui_translucency: Graphics;

    public get visible() {
        return this.active;
    }

    public set visible( vis: boolean ) {
        if ( this.active !== vis ) {
            this.active = vis;
            vis ? this.hook.on_enable.invoke( this ) : this.hook.on_disable.invoke( this );
        }
    }

    constructor( public readonly preference: ILayerPreference ) {
        super( constants.hierarchy_layer + preference.name );

        this.ui_trans = this.addComponent( UITransform );
        this.ui_translucency = this.addComponent( Graphics );
        this.ui_adapter = this.addComponent( Widget );

        this.hook = new LayerHook();
    }

    public show() {
        this.visible = true;
    }

    public hide() {
        this.visible = false;
    }

    public setup_component<T extends Component>( com: Constructor<T> ) {
        return ( this.getComponent( com ) || this.addComponent( com ) )!;
    }

    public fade_in( animate: number = 0.3 ) {
        if ( this.active ) return;

        this.active = true;
        const target = this.setup_component( UIOpacity );
        target.opacity = 0;
        Tween.stopAllByTarget( target );
        tween( target ).to( animate, { opacity: 255 }, {
            easing: "smooth",
            onComplete: () => {
                this.active = true;
                this.hook.on_enable.invoke( this );
                target.destroy();
            }
        } ).start();
    }

    public fade_out( animate: number = 0.3, remove_self: boolean = false ) {
        if ( !this.active ) return;

        const target = this.setup_component( UIOpacity );
        target.opacity = 255;
        Tween.stopAllByTarget( target );
        tween( target ).to( animate, { opacity: 0 }, {
            easing: "smooth",
            onComplete: () => {
                this.active = false;
                this.hook.on_disable.invoke( this );
                target.destroy();
                remove_self && this.removeFromParent();
            }
        } ).start();
    }

    public zoom_in( animate: number = 0.3 ) {
        if ( this.active ) return;

        this.show_translucency( false );
        this.setScale( 0, 0 );
        this.active = true;
        const target = this.scale;
        Tween.stopAllByTarget( target );
        const one = new Vec3( 1, 1 );
        tween( target ).to( animate, one, {
            easing: "bounceIn",
            // @ts-ignore
            onUpdate: ( s: Vec3 ) => this.scale = s,
            onComplete: () => {
                this.scale = one;
                this.active = true;
                this.hook.on_enable.invoke( this );
                this.show_translucency( this.preference.translucency );
            }
        } ).start();
    }

    public zoom_out( animate: number = 0.3, remove_self: boolean = false ) {
        if ( !this.active ) return;

        this.show_translucency( false );
        this.setScale( 1, 1 );
        const target = this.scale;
        Tween.stopAllByTarget( target );
        const one = new Vec3( 0, 0 );
        tween( target ).to( animate, one, {
            easing: "bounceOut",
            // @ts-ignore
            onUpdate: ( s: Vec3 ) => this.scale = s,
            onComplete: () => {
                this.scale = one;
                this.active = false;
                this.hook.on_disable.invoke( this );
                remove_self && this.removeFromParent();
            }
        } ).start();
    }

    public animate_in(
        animate: number = 0.3,
        oncomplete: ( layer: UILayer ) => void | null,
        cin: ( layer: UILayer, time: number, oncomplete: ( layer: UILayer ) => void | null ) => void
    ) {
        if ( this.active ) return;
        cin( this, animate, () => {
            this.active = true;
            this.hook.on_enable.invoke( this );
            oncomplete && oncomplete( this );
        } );
    }

    public animate_out(
        animate: number = 0.3,
        oncomplete: ( layer: UILayer ) => void | null,
        cout: ( layer: UILayer, time: number, oncomplete: ( layer: UILayer ) => void | null ) => void
    ) {
        if ( !this.active ) return;
        cout( this, animate, () => {
            this.active = false;
            this.hook.on_destroy.invoke( this );
            oncomplete && oncomplete( this );
        } );
    }

    public initialize() {
        logger.ui.debug( this.name, this.preference );
        this.ui_trans.setAnchorPoint( constants.anchor_center );
        this.register_events();
        this.adapt_screen();
        this.show_translucency( this.preference.translucency );
        this.active = this.preference.visible;
    }

    public show_translucency( vis: boolean ) {
        if ( vis ) {
            this.ui_translucency.enabled = true;
            const { width, height } = screen.windowSize;
            const rw = ( width + 0.5 ) | 0;
            const rh = ( height + 0.5 ) | 0;
            this.ui_translucency.fillColor = new Color( "#17171780" );
            this.ui_translucency.fillRect( -rw >> 1, -rh >> 1, rw, rh );
        } else {
            this.ui_translucency.enabled = false;
        }
    }

    protected adapt_screen() {
        const widget = this.ui_adapter;
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
        widget.target = app.root!;
        widget.updateAlignment();
    }

    protected register_events() {
        this.on( Node.EventType.TOUCH_START, this.touch_began, this );
        this.on( Node.EventType.TOUCH_END, this.touch_ended, this );
        this.on( Node.EventType.TOUCH_CANCEL, this.touch_leave, this );
        this.on( Node.EventType.TOUCH_MOVE, this.touch_moved, this );
        this.on( Node.EventType.CHILD_ADDED, this.check_visibility, this );
        this.on( Node.EventType.CHILD_REMOVED, this.check_visibility, this );
    }

    /**
     * 检查可视性
     * @private
     */
    private check_visibility() {
        // 如果预设值是可视的，那么它就是一直可见，不需要处理
        if ( this.preference.visible ) return;
        // 否则，根据子节点的数量及可视情况决定是否显示
        const children = this.children;
        const count = children.length;
        if ( count == 0 ) {
            this.active = false;
            return;
        }
        let child: Node;
        let v2: boolean = false;
        for ( let i = 0; i < count; i++ ) {
            child = children[i];
            if ( child.active ) {
                v2 = true;
                break;
            }
        }
        this.active = v2;
    }

    private touch_began( touch: EventTouch ) {
        // const target = touch.currentTarget.name;
        // logger.ui.debug( target + tips.touch_began, touch );
        this.hook.on_began.invoke( touch );
        if ( !this.preference.touch_cross ) {
            touch.propagationStopped = true;
            touch.propagationImmediateStopped = true;
            touch.preventSwallow = false;
            // logger.ui.debug( target + tips.touch_cross_not_allow );
        } else {
            touch.preventSwallow = true;
            // logger.ui.debug( target + tips.touch_cross_allow );
        }
    }

    private touch_ended( touch: EventTouch ) {
        this.hook.on_ended.invoke( touch );
        // logger.ui.debug( touch.currentTarget.name + tips.touch_ended, touch );
    }

    private touch_leave( touch: EventTouch ) {
        // logger.ui.debug( touch.currentTarget.name + tips.touch_leave, touch );
        this.hook.on_leave.invoke( touch );
    }

    private touch_moved( touch: EventTouch ) {
        // logger.ui.debug( touch.currentTarget.name + tips.touch_moved, touch );
        this.hook.on_move.invoke( touch );
    }
}