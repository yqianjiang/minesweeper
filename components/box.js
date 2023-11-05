export const defaultStyles = {
    BORDER_COLOR_LIGHT: "#fff",
    BORDER_COLOR_DARK: "#7B7B7B",
    BG_COLOR_MAIN: "#BDBDBD",
};

export const defaultSizes = {
    BORDER_INNER: 6,
    BORDER_MAIN: 18,
};

export class BoxDrawer {
    constructor(ctx, contentHeight, contentWidth, x0, y0, styles = defaultStyles, sizes = defaultSizes) {
        this.ctx = ctx;
        this.contentHeight = contentHeight;
        this.contentWidth = contentWidth;
        this.x0 = x0;
        this.y0 = y0;
        this.styles = styles;
        this.sizes = sizes;
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }
    
    drawTriLB(x, y, w, color) {
        this.ctx.fillStyle = color;
        drawTriLB(this.ctx, x, y, w);
    }
    
    drawTriRT(x, y, w, color) {
        this.ctx.fillStyle = color;
        drawTriRT(this.ctx, x, y, w);
    }

    drawLeft(w, color) {
        this.drawRect(this.x0 - w, this.y0 - w, w, this.contentHeight + w * 2, color);
    }

    drawRight(isTri, w, color) {
        const x = this.x0 + this.contentWidth;
        const y = this.y0;
        if (isTri) {
            this.drawTriRT(x, y, w, color);
            this.drawRect(x, y, w, this.contentHeight + w, color);
        } else {
            this.drawRect(x, y - w, w, this.contentHeight + w * 2, color);
        }
    }

    drawTop(w, color) {
        this.drawRect(this.x0 - w, this.y0 - w, this.contentWidth + w * 2, w, color);
    }

    drawBottom(isTri, w, color) {
        const x = this.x0;
        const y = this.y0 + this.contentHeight;
        if (isTri) {
            this.drawTriLB(x, y, w, color);
            this.drawRect(x, y, this.contentWidth, w, color);
        } else {
            this.drawRect(x, y, this.contentWidth, w, color);
        }
    }

    drawInner(w) {
        w = w || this.sizes.BORDER_INNER;
        this.drawTop(w, this.styles.BORDER_COLOR_DARK);
        this.drawLeft(w, this.styles.BORDER_COLOR_DARK);
        this.drawBottom(true, w, this.styles.BORDER_COLOR_LIGHT);
        this.drawRight(true, w, this.styles.BORDER_COLOR_LIGHT);
    }

    drawOuter(w) {
        w = w || this.sizes.BORDER_INNER * 2 + this.sizes.BORDER_MAIN;
        this.drawLeft(w, this.styles.BORDER_COLOR_LIGHT);
        this.drawTop(w, this.styles.BORDER_COLOR_LIGHT);
        this.drawRight(true, w, this.styles.BORDER_COLOR_DARK);
        this.drawBottom(true, w, this.styles.BORDER_COLOR_DARK);
    }

    drawMiddle(w) {
        w = w || this.sizes.BORDER_INNER + this.sizes.BORDER_MAIN;
        this.drawRect(this.x0 - w, this.y0 - w, this.contentWidth + w * 2, this.contentHeight + w * 2, this.styles.BG_COLOR_MAIN);
    }
}

// 左下角三角形
function drawTriLB(ctx, x, y, w) {
    ctx.beginPath();
    ctx.moveTo(x - w, y + w);
    ctx.lineTo(x, y + w);
    ctx.lineTo(x, y);
    ctx.fill();
}

// 右上角三角形
function drawTriRT(ctx, x, y, w) {
    ctx.beginPath();
    ctx.moveTo(x + w, y - w);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.fill();
}
