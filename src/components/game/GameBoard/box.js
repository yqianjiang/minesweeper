import { defaultSizes, defaultStyles } from "../config.js";

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
    this.ctx.beginPath();
    this.ctx.moveTo(x - w, y + w);
    this.ctx.lineTo(x, y + w);
    this.ctx.lineTo(x, y);
    this.ctx.fill();
  }

  drawTriRT(x, y, w, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w, y - w);
    this.ctx.lineTo(x + w, y);
    this.ctx.lineTo(x, y);
    this.ctx.fill();
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

  drawText(x, y, text, fontSize = 16, color = "#333") {
    this.ctx.font = `${fontSize}px sans-serif`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(text, x, y);
  }

}
