import { drawDigitBg } from "./components/digit.js"

const color = {
    BG_COLOR_MAIN: "#BDBDBD",
    BORDER_COLOR_LIGHT: "#fff",
    BORDER_COLOR_DARK: "#7B7B7B",
}
const size = {
    BORDER_INNER: 6,
    BORDER_MAIN: 18,
}
const H_TOPBOX = 52;
const OUTER_SIZE = size.BORDER_INNER * 2 + size.BORDER_MAIN;

function _drawBox(ctx, boardHeight, boardWidth, x0, y0) {
    function drawLeft() {
        ctx.fillRect(x0 - w, y0 - w, w, boardHeight + w * 2); // 左边框
    }
    function drawRight(isTri) {
        if (isTri) {
            drawTopriRT(ctx, [x0 + boardWidth, y0], w);
            ctx.fillRect(x0 + boardWidth, y0, w, boardHeight + w);  // 右边框
        } else {
            ctx.fillRect(x0 + boardWidth, y0 - w, w, boardHeight + w * 2);  // 右边框
        }
    }
    function drawTop() {
        ctx.fillRect(x0 - w, y0 - w, boardWidth + w * 2, w);  // 上边框
    }
    function drawBottom(isTri) {
        if (isTri) {
            drawTopriLB(ctx, [x0, y0 + boardHeight], w);
            ctx.fillRect(x0, y0 + boardHeight, boardWidth, w);
        } else {
            ctx.fillRect(x0, y0 + boardHeight, boardWidth, w);
        }
    }

    function drawInner() {
        // 画内边框
        w = size.BORDER_INNER;
        ctx.fillStyle = color.BORDER_COLOR_DARK;
        drawTop();
        drawLeft();
        ctx.fillStyle = color.BORDER_COLOR_LIGHT;
        drawBottom(true);
        drawRight(true);
    }

    function drawOutter() {
        w = size.BORDER_INNER * 2 + size.BORDER_MAIN;
        ctx.fillStyle = color.BORDER_COLOR_LIGHT;
        drawLeft();
        drawTop();
        ctx.fillStyle = color.BORDER_COLOR_DARK;
        drawRight(true);
        drawBottom(true);
    }

    function drawMiddle() {
        w = size.BORDER_INNER + size.BORDER_MAIN;
        ctx.fillStyle = color.BG_COLOR_MAIN;
        drawLeft();
        drawTop();
        drawRight(false);
        drawBottom(false);
    }

    let w;
    return { drawOutter, drawMiddle, drawInner };
}

export function drawOuterBox(ctx, boardHeight, boardWidth, x0, y0) {
    ctx.fillStyle = color.BG_COLOR_MAIN;
    ctx.fillRect(0, 0, boardWidth + x0 * 2, boardHeight + y0 * 2);
    const yTopBox = y0 - H_TOPBOX - OUTER_SIZE;
    const { drawOutter } = _drawBox(ctx, boardHeight + H_TOPBOX + OUTER_SIZE, boardWidth, x0, y0 - H_TOPBOX - OUTER_SIZE);
    drawOutter();
    const drawTop = _drawBox(ctx, H_TOPBOX, boardWidth, x0, yTopBox);
    drawTop.drawMiddle();
    drawTop.drawInner();
    const { drawMiddle, drawInner } = _drawBox(ctx, boardHeight, boardWidth, x0, y0);
    drawMiddle();
    drawInner();
    const { digitPars } = drawDigitBg(ctx, boardWidth, x0, yTopBox, H_TOPBOX);
    // const {drawInner:drawDigitInnerL} = _drawBox(ctx, digitPars.h + digitPars.p*2, (digitPars.w+digitPars.xgap)*3, x0 + digitPars.mx, yTopBox);
    // drawDigitInnerL();
    // const {drawInner:drawDigitInnerR} = _drawBox(ctx, digitPars.h + digitPars.p*2, (digitPars.w+digitPars.xgap)*3, x0 + digitPars.x0left, yTopBox);
    // drawDigitInnerR();

    return { digitPars };
}

// 左下角三角形
function drawTopriLB(ctx, [x, y], w) {
    ctx.beginPath();
    ctx.moveTo(x - w, y + w);
    ctx.lineTo(x, y + w);
    ctx.lineTo(x, y);
    ctx.fill();
}
// 右上角三角形
function drawTopriRT(ctx, [x, y], w) {
    ctx.beginPath();
    ctx.moveTo(x + w, y - w);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x, y);
    ctx.fill();
}
