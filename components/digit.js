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

// 渲染数字
export function renderDigit(ctx, num, svgImages, { x, y, w, h, xgap }) {
    // num 数字 渲染对应的图片
    if (num > 999) {
        num = 999;  // 最多显示三位数
    }
    const str = Math.round(num).toString().split('');  // 转成数组，可以从后往前渲染

    for (let i = 2; i >= 0; i--) {
        const svgImage = svgImages[str.pop() || 0];
        if (svgImage) {
            ctx.drawImage(svgImage, x + i * (w + xgap), y, w, h);
        }
    }
}

export function drawDigitBg(ctx, boardWidth, x0, yTopBox, H_TOPBOX) {
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