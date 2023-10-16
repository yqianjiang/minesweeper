export function loadBoardImages(callback) {
    const svgImages = {}
    // 未挖出的方块
    const imageClosed = new Image();
    imageClosed.src = "assets/closed.svg";
    imageClosed.onload = callback;
    svgImages["E"] = imageClosed;
    svgImages["M"] = imageClosed;

    const imageFlag = new Image();
    imageFlag.src = "assets/flag.svg";
    svgImages["E*"] = imageFlag;
    svgImages["M*"] = imageFlag;

    const imageQuestion = new Image();
    imageQuestion.src = "assets/closed_flag.svg";
    svgImages["E?"] = imageQuestion;
    svgImages["M?"] = imageQuestion;

    // 已知的方块
    // 踩地雷
    const imageMineRed = new Image();
    imageMineRed.src = "assets/mine_red.svg";
    svgImages["X"] = imageMineRed;

    // 输的时候揭开的雷
    const imageMine = new Image();
    imageMine.src = "assets/mine.svg";
    svgImages["X*"] = imageMine;

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

// 渲染board
export function renderBoard(ctx, board, w, h, svgImages, x, y) {
    // w, h为每个格子的宽高
    for (const i in board) {
        for (const j in board[i]) {
            const cellValue = board[i][j];
            const xPos = x + w * j;
            const yPos = y + h * i;
            if (cellValue in svgImages) {
                // 根据值获取对应的SVG图像
                const svgImage = svgImages[cellValue];
                ctx.drawImage(svgImage, xPos, yPos, w, h);
            }
        }
    }
}