import { drawDigitBg } from "./components/digit.js"
import { BoxDrawer } from "./components/box.js"
import { defaultSizes as size, defaultStyles as color } from "./config.js"
import { checkClickBtn } from "./utils.js"

const H_TOOLBOX = 52;
const OUTER_SIZE = size.BORDER_INNER * 2 + size.BORDER_MAIN;

// 绘制背景框框
export function drawStaticBg(ctx, contentHeight, contentWidth, x0, y0) {
    ctx.fillStyle = color.BG_COLOR_MAIN;
    ctx.fillRect(0, 0, contentWidth + x0 * 2, contentHeight + y0 * 2);
    const toolBoxOuterH = H_TOOLBOX + OUTER_SIZE;
    const yTopBox = y0 - toolBoxOuterH;  // 顶部ToolBox的Y

    // 最外层的边框
    const boxDrawer = new BoxDrawer(ctx, contentHeight + toolBoxOuterH * 2, contentWidth, x0, yTopBox);
    boxDrawer.drawOuter();

    // 上方工具栏外框
    const topToolbox = new BoxDrawer(ctx, H_TOOLBOX, contentWidth, x0, yTopBox);
    topToolbox.drawMiddle();
    topToolbox.drawInner();

    // 下方工具栏外框
    const yBottomBox = y0 + x0 + contentHeight;
    const bottomToolbox = new BoxDrawer(ctx, H_TOOLBOX, contentWidth, x0, yBottomBox);
    bottomToolbox.drawMiddle();
    bottomToolbox.drawInner();

    // 下方工具栏按钮
    function drawBtn (ctx, x0, y0, {w, h, borderWidth, text}, checked=false) {
        // 清除画布
        ctx.clearRect(x0, y0 + h / 2, w, h);

        const bottomToolboxBtn = new BoxDrawer(ctx, h, w, x0, y0 + h / 2);
        bottomToolboxBtn.drawMiddle(borderWidth);
        if (checked) {
            // 选中状态
            bottomToolboxBtn.drawInner(borderWidth);
        } else {
            // 未选中状态
            bottomToolboxBtn.drawOuter(borderWidth);
        }

        // 绘制按钮上的文本
        bottomToolboxBtn.drawText(x0 + w / 2, y0 + h, text);
    }
    const btnPars = {
        w: 24 * 2,
        h: 24,
        borderWidth: 4,
        px: 16,
    }
    const btns = [
        {
            x: x0 + contentWidth/2 - btnPars.w - btnPars.px,
        },
        {
            x: x0 + contentWidth/2 + btnPars.px,
        },
    ]
    const renderBtnGroups = (selectIdx) => {
        btnPars.text = "挖开";
        drawBtn(ctx, btns[0].x, yBottomBox, btnPars, selectIdx===0);
        btnPars.text = "插旗";
        drawBtn(ctx, btns[1].x, yBottomBox, btnPars, selectIdx===1);
    }
    renderBtnGroups(0);
    const onClickBtnGroups = (x, y) => {
        let selectIdx = -1;
        for (const i in btns) {
            if (checkClickBtn([x, y], {x: btns[i].x, y: yBottomBox + btnPars.h / 2, w: btnPars.w, h: btnPars.h})) {
                selectIdx = +i;
            }
        }
        if (selectIdx>=0) {
            renderBtnGroups(selectIdx);
        }
        return selectIdx;
    }

    // 主要内容（content）的边框
    const mainBoxDrawer = new BoxDrawer(ctx, contentHeight, contentWidth, x0, y0);
    mainBoxDrawer.drawMiddle();
    mainBoxDrawer.drawInner();

    // 上方工具栏内的数字背景
    const { digitPars } = drawDigitBg(ctx, contentWidth, x0, yTopBox, H_TOOLBOX);

    return { digitPars, onClickBtnGroups };
}
