import { profiler, Profiler, screen } from "cc";

export namespace stat {
    export function hack() {
        const showStats = Profiler.prototype.showStats;
        Profiler.prototype.showStats = function () {
            // 显示节点
            showStats.call( this );
            // 重新创建节点
            const stats: any = profiler;
            const ctx: CanvasRenderingContext2D = stats._ctx;
            const font_size = ( 36 / screen.devicePixelRatio ) | 0;
            ctx.font = `${ font_size }px Arial`;
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
            ctx.lineWidth = 2;
            const fillText = CanvasRenderingContext2D.prototype.fillText;
            ctx.fillText = ( text, x, y, maxWidth ) => {
                ctx.strokeText( text, x, y );
                fillText.call( ctx, text, x, y );
            };
            ctx.clearRect( 0, 0, 280, 280 );
            stats._statsDone = false;
            stats.generateStats();
            stats._rootNode.destroy();
            stats._rootNode = null;
            profiler.generateNode();
            // 还原回去
            Profiler.prototype.showStats = showStats;
        };
    }

    export function show() {
        profiler.showStats();
    }

    export function hide() {
        profiler.hideStats();
    }
}

