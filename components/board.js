import closedImageSrc from '../assets/closed.svg';
import flagImageSrc from '../assets/flag.svg';
import questionImageSrc from '../assets/closed_flag.svg';
import mineRedImageSrc from '../assets/mine_red.svg';
import mineImageSrc from '../assets/mine.svg';
import numImageSrc0 from '../assets/type0.svg';
import numImageSrc1 from '../assets/type1.svg';
import numImageSrc2 from '../assets/type2.svg';
import numImageSrc3 from '../assets/type3.svg';
import numImageSrc4 from '../assets/type4.svg';
import numImageSrc5 from '../assets/type5.svg';
import numImageSrc6 from '../assets/type6.svg';
import numImageSrc7 from '../assets/type7.svg';
import numImageSrc8 from '../assets/type8.svg';

const numsImageSrc = [numImageSrc0, numImageSrc1, numImageSrc2, numImageSrc3, numImageSrc4, numImageSrc5, numImageSrc6, numImageSrc7, numImageSrc8];

export function loadBoardImages(callback) {
    const svgImages = {}
    // 未挖出的方块
    const imageClosed = new Image();
    imageClosed.src = closedImageSrc;
    imageClosed.onload = callback;
    svgImages["E"] = imageClosed;
    svgImages["M"] = imageClosed;

    const imageFlag = new Image();
    imageFlag.src = flagImageSrc;
    svgImages["E*"] = imageFlag;
    svgImages["M*"] = imageFlag;

    const imageQuestion = new Image();
    imageQuestion.src = questionImageSrc;
    svgImages["E?"] = imageQuestion;
    svgImages["M?"] = imageQuestion;

    // 已知的方块
    // 踩地雷
    const imageMineRed = new Image();
    imageMineRed.src = mineRedImageSrc;
    svgImages["X"] = imageMineRed;

    // 输的时候揭开的雷
    const imageMine = new Image();
    imageMine.src = mineImageSrc;
    svgImages["X*"] = imageMine;

    // 数字
    const imageB = new Image();
    imageB.src = numsImageSrc[0];
    svgImages["B"] = imageB;

    for (const num in new Array(9).fill(0)) {
        if (num === "0") continue;
        const imageNum = new Image();
        imageNum.src = numsImageSrc[num];
        svgImages[num] = imageNum;
    }
    return svgImages;
}

// 渲染board
export function renderBoard(ctx, board, w, h, svgImages, x, y, pressPositions) {
    // w, h为每个格子的宽高
    for (const i in board) {
        for (const j in board[i]) {
            let cellValue = board[i][j];
            const xPos = x + w * j;
            const yPos = y + h * i;
            if (cellValue in svgImages) {
                // 根据值获取对应的SVG图像
                const svgImage = svgImages[cellValue];
                ctx.drawImage(svgImage, xPos, yPos, w, h);
            }
        }
    }

    if (!pressPositions) return;
    for (const pressPosition of pressPositions) {
        const [i, j] = pressPosition;
        if (["M", "E"].includes(board[i][j])) {
            const xPos = x + w * j;
            const yPos = y + h * i;
            const svgImage = svgImages["B"];
            if (svgImage) {
                ctx.drawImage(svgImage, xPos, yPos, w, h);
            }
        }
    }
}

export function renderColorMark(ctx, board, colorMark, w, h, x, y) {
    for (const i in colorMark) {
        for (const j in colorMark[i]) {
            const color = colorMark[i][j];
            const xPos = x + w * j;
            const yPos = y + h * i;
            if (!color || !["M", "E"].includes(board[i][j])) {
                
            } else {
                // 填充颜色
                ctx.fillStyle = color;
                ctx.fillRect(xPos, yPos, w, h);
            }
        }
    }
}