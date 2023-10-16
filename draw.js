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

function _drawDigitBg(ctx, boardWidth, x0, yTopBox) {
    // 显示数字
    ctx.fillStyle = "#000";
    const digitPars = {
        w: 18,
        h: 36,
        mx: 12,
        xgap: 4,
        my: 0,  // 居中
        p: 2,
        y0: yTopBox,
        x0left: x0,
        x: x0,
        xleft: x0,
        y: yTopBox,
    }
    digitPars.my = (H_TOPBOX - digitPars.h) / 2 - digitPars.p;
    digitPars.x0left += boardWidth - (digitPars.w + digitPars.xgap) * 3 - digitPars.mx;

    // 图片的x, y
    digitPars.x += digitPars.mx + digitPars.p;
    digitPars.xleft = digitPars.x0left + digitPars.p;
    digitPars.y += digitPars.my + digitPars.p;

    function drawDigitBg(ctx, [x0, y0], { w, h, my, p, xgap }) {
        ctx.fillRect(x0, y0 + my, (w + xgap) * 3, h + p * 2);
    }

    drawDigitBg(ctx, [x0 + digitPars.mx, yTopBox], digitPars);
    drawDigitBg(ctx, [digitPars.x0left, yTopBox], digitPars);

    return { digitPars };
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
    const { digitPars } = _drawDigitBg(ctx, boardWidth, x0, yTopBox);
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

export function loadBoardImages(callback) {
    const svgImages = {}
    // 未挖出的方块
    const ImageClosed = new Image();
    ImageClosed.src = "assets/closed.svg";
    ImageClosed.onload = callback;
    svgImages["E"] = ImageClosed;
    svgImages["M"] = ImageClosed;

    const ImageFlag = new Image();
    ImageFlag.src = "assets/flag.svg";
    svgImages["E*"] = ImageFlag;
    svgImages["M*"] = ImageFlag;

    const imageQuestion = new Image();
    imageQuestion.src = "assets/closed_flag.svg";
    svgImages["E?"] = imageQuestion;
    svgImages["M?"] = imageQuestion;

    // 已知的方块
    // 踩地雷
    const ImageMine = new Image();
    ImageMine.src = "assets/mine_red.svg";
    svgImages["X"] = ImageMine;

    // 数字
    const imageB = new Image();
    imageB.src = "assets/type0.svg";
    svgImages["B"] = imageB;

    for (const num in new Array(9).fill(0)) {
        if (num === "0") continue;
        const imageNum = new Image();
        imageNum.src = `assets/type${num}.svg`;
        svgImages[num] = imageNum;
    }
    return svgImages;
}

export function loadDigitImages(callback) {
    const svgImages = {};
    for (const num in new Array(10).fill(0)) {
        const imageNum = new Image();
        imageNum.src = `assets/d${num}.svg`;
        svgImages[num] = imageNum;
    }
    svgImages['0'].onload = callback;
    return svgImages;
}

export function loadFaceImages(callback) {
    const img = new Image();
    img.src = `assets/face.svg`;
    img.onload = callback;
    return img;
}