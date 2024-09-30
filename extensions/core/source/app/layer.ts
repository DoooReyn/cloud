import { Color, EventTouch, Graphics, Node, screen, UITransform, Widget } from "cc";
import { app } from "./app";
import { constants } from "./constants";
import { logger } from "../logger";
import { delegates } from "../delegates";

export interface ILayerPreference {
    /** 层级名称 */
    name: string;
    /** 是否允许触摸穿透 */
    touch_cross: boolean;
    /** 显示半透层 */
    ui_opaque: boolean;
}

class TouchHook {
    public readonly on_began: delegates.Delegates = new delegates.Delegates();
    public readonly on_move: delegates.Delegates = new delegates.Delegates();
    public readonly on_ended: delegates.Delegates = new delegates.Delegates();
    public readonly on_leave: delegates.Delegates = new delegates.Delegates();
}

/**
 * 层级基类
 */
export class HierarchyLayer extends Node {
    public touch_hook: TouchHook = new TouchHook();
    protected ui_trans: UITransform;
    protected ui_adapter: Widget;
    protected ui_opaque: Graphics;

    constructor( public readonly preference: ILayerPreference ) {
        super( constants.hierarchy_layer + preference.name );

        this.ui_trans = this.addComponent( UITransform );
        this.ui_trans.setAnchorPoint( constants.anchor_center );

        this.ui_opaque = this.addComponent( Graphics );
        this.ui_opaque.enabled = false;

        this.ui_adapter = this.addComponent( Widget );
        this.ui_adapter.top = this.ui_adapter.bottom = this.ui_adapter.left = this.ui_adapter.right = 0;
        this.ui_adapter.isAlignTop = this.ui_adapter.isAlignBottom = this.ui_adapter.isAlignLeft = this.ui_adapter.isAlignRight = true;
        this.ui_adapter.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
    }

    public initialize() {
        logger.ui.debug( this.ui_trans.contentSize.toString() );
        this.adapt_screen();
        this.register_touch_events();
        this.show_modal(this.preference.ui_opaque);
    }

    public show_modal( enabled: boolean ) {
        if ( enabled ) {
            this.ui_opaque.enabled = true;
            const { width, height } = screen.windowSize;
            const rw = ( width + 0.5 ) | 0;
            const rh = ( height + 0.5 ) | 0;
            this.ui_opaque.fillColor = new Color( "#17171780" );
            this.ui_opaque.fillRect( -rw >> 1, -rh >> 1, rw, rh );
        } else {
            this.ui_opaque.enabled = false;
        }
    }

    protected adapt_screen() {
        this.ui_adapter.target = app.root!;
        this.ui_adapter.updateAlignment();
    }

    protected register_touch_events() {
        this.on( Node.EventType.TOUCH_START, this.touch_began, this );
        this.on( Node.EventType.TOUCH_END, this.touch_ended, this );
        this.on( Node.EventType.TOUCH_CANCEL, this.touch_leave, this );
        this.on( Node.EventType.TOUCH_MOVE, this.touch_moved, this );
    }

    private touch_began( touch: EventTouch ) {
        const target = touch.currentTarget.name;
        logger.ui.debug( target + " " + "触摸开始（落下）", touch );
        this.touch_hook.on_began.invoke( touch );
        if ( !this.preference.touch_cross ) {
            touch.propagationStopped = true;
            touch.propagationImmediateStopped = true;
            touch.preventSwallow = false;
            logger.ui.debug( target + " " + "禁止触摸继续传递" );
        } else {
            touch.preventSwallow = true;
            logger.ui.debug( target + " " + "允许触摸继续传递" );
        }
    }

    private touch_ended( touch: EventTouch ) {
        this.touch_hook.on_ended.invoke( touch );
        logger.ui.debug( touch.currentTarget.name + "触摸结束（抬起）", touch );
    }

    private touch_leave( touch: EventTouch ) {
        logger.ui.debug( touch.currentTarget.name + "触摸取消（离开）", touch );
        this.touch_hook.on_leave.invoke( touch );
    }

    private touch_moved( touch: EventTouch ) {
        logger.ui.debug( touch.currentTarget.name + "触摸移动（滑动）", touch );
        this.touch_hook.on_move.invoke( touch );
    }
}