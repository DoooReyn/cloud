import { UILayer } from "../layer";

export class UIBottomLayer extends UILayer {
    constructor() {
        super( { name: "bottom", touch_cross: false, translucency: false, visible: true } );
    }
}