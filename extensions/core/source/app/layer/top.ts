// import { HierarchyLayer, LayerCapability } from "../layer";
// import { EventTouch } from "cc";
// import { logger } from "../../logger";
//
// export class TopCapability extends LayerCapability {
//     constructor( layer: HierarchyLayer ) {
//         super( layer );
//
//         layer.hook.on_ended.on( { caller: this, handler: this.on_tap_screen } );
//     }
//
//     private on_tap_screen( e: EventTouch ) {
//         logger.ui.debug( "点击屏幕", e.getLocationX(), e.getLocationY() );
//     }
// }