export const color = {
    BG_COLOR_MAIN: "#BDBDBD",
    BORDER_COLOR_LIGHT: "#fff",
    BORDER_COLOR_DARK: "#7B7B7B",
}
export const size = {
    BORDER_INNER: 6,
    BORDER_MAIN: 18,
}

export class BoxDrawer {
    constructor(ctx, contentHeight, contentWidth, x0, y0) {
        this.ctx = ctx;
        this.contentHeight = contentHeight;
        this.contentWidth = contentWidth;
        this.x0 = x0;
        this.y0 = y0;
    }

    drawLeft(w) {
        this.ctx.fillRect(this.x0 - w, this.y0 - w, w, this.contentHeight + w * 2); // 左边框
    }

    drawRight(isTri, w) {
        if (isTri) {
            drawTriRT(this.ctx, [this.x0 + this.contentWidth, this.y0], w);
            this.ctx.fillRect(this.x0 + this.contentWidth, this.y0, w, this.contentHeight + w);  // 右边框
        } else {
            this.ctx.fillRect(this.x0 + this.contentWidth, this.y0 - w, w, this.contentHeight + w * 2);  // 右边框
        }
    }

    drawTop(w) {
        this.ctx.fillRect(this.x0 - w, this.y0 - w, this.contentWidth + w * 2, w);  // 上边框
    }

    drawBottom(isTri, w) {
        if (isTri) {
            drawTriLB(this.ctx, [this.x0, this.y0 + this.contentHeight], w);
            this.ctx.fillRect(this.x0, this.y0 + this.contentHeight, this.contentWidth, w);
        } else {
            this.ctx.fillRect(this.x0, this.y0 + this.contentHeight, this.contentWidth, w);
        }
    }

    drawInner() {
        // 画内边框
        let w = size.BORDER_INNER;
        this.ctx.fillStyle = color.BORDER_COLOR_DARK;
        this.drawTop(w);
        this.drawLeft(w);
        this.ctx.fillStyle = color.BORDER_COLOR_LIGHT;
        this.drawBottom(true, w);
        this.drawRight(true, w);
    }

    drawOuter() {
        // 画外边框
        let w = size.BORDER_INNER * 2 + size.BORDER_MAIN;
        this.ctx.fillStyle = color.BORDER_COLOR_LIGHT;
        this.drawLeft(w);
        this.drawTop(w);
        this.ctx.fillStyle = color.BORDER_COLOR_DARK;
        this.drawRight(true, w);
        this.drawBottom(true, w);
    }

    drawMiddle() {
        // 画中间部分
        let w = size.BORDER_INNER + size.BORDER_MAIN;
        this.ctx.fillStyle = color.BG_COLOR_MAIN;
        this.drawLeft(w);
        this.drawTop(w);
        this.drawRight(false, w);
        this.drawBottom(false, w);
    }
}


// 左下角三角形
function drawTriLB(ctx, [x, y], w) {
    ctx.beginPath();
    ctx.moveTo(x - w, y + w);
    ctx.lineTo(x, y + w);
    ctx.lineTo(x, y);
    ctx.fill();
}
// 右上角三角形
function drawTriRT(ctx, [x, y], w) {
    ctx.beginPath();
    ctx.moveTo(x + w, y - w);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.fill();
}

