import { drawDigitBg } from "./components/digit.js"
import { BoxDrawer, size, color } from "./components/box.js"

const H_TOOLBOX = 52;
const OUTER_SIZE = size.BORDER_INNER * 2 + size.BORDER_MAIN;

// 绘制背景框框
export function drawStaticBg(ctx, contentHeight, contentWidth, x0, y0) {
    ctx.fillStyle = color.BG_COLOR_MAIN;
    ctx.fillRect(0, 0, contentWidth + x0 * 2, contentHeight + y0 * 2);
    const toolBoxOuterH = H_TOOLBOX + OUTER_SIZE;
    const yTopBox = y0 - toolBoxOuterH;  // 顶部ToolBox的Y

    // 最外层的边框
    const boxDrawer = new BoxDrawer(ctx, contentHeight + toolBoxOuterH, contentWidth, x0, yTopBox);
    boxDrawer.drawOuter();

    // 上方工具栏外框
    const topToolbox = new BoxDrawer(ctx, H_TOOLBOX, contentWidth, x0, yTopBox);
    topToolbox.drawMiddle();
    topToolbox.drawInner();

    // 下方工具栏外框
    // const yBottomBox = y0 + x0 + contentHeight;
    // const bottomToolbox = new BoxDrawer(ctx, H_TOOLBOX, contentWidth, x0, yBottomBox);
    // bottomToolbox.drawMiddle();
    // bottomToolbox.drawInner();

    // // 按钮
    // const bottomToolboxBtn = new BoxDrawer(ctx, 36, 36, x0 + contentWidth/2 - 36, yBottomBox);
    // bottomToolboxBtn.drawOuter();

    // 主要内容（content）的边框
    const mainBoxDrawer = new BoxDrawer(ctx, contentHeight, contentWidth, x0, y0);
    mainBoxDrawer.drawMiddle();
    mainBoxDrawer.drawInner();

    // 上方工具栏内的数字背景
    const { digitPars } = drawDigitBg(ctx, contentWidth, x0, yTopBox, H_TOOLBOX);

    return { digitPars };
}
