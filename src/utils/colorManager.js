// 标准色
// const COLORS = ["255,0,0", "255,128,0", "255,255,0", "0,200,0", "0,80,255", "128,0,255"];

// 选自 CIELCH color picker https://luncheon.github.io/lch-color-wheel/
const COLORS = [
  "255, 69, 240",
  "202, 142, 0",
  "23, 178, 0",
  "0, 160, 250",
  // "159, 135, 255", // 紫色，暂时感觉不需要
]

// 全局管理标记的颜色
class ColorManager {
  constructor() {
    this.currIdx = 0;
  }

  getCurrColor() {
    return `rgba(${COLORS[this.currIdx]}, 0.5)`;
  }

  switchNewColor() {
    this.currIdx = (this.currIdx + 1) % COLORS.length;
  }
}

const colorManager = new ColorManager();
export default colorManager;