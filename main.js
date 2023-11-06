import { MineSweeper } from "./game.js";
import { drawStaticBg } from "./draw.js";
import { renderDigit, loadDigitImages } from "./components/digit.js";
import { renderFace, loadFaceImages, drawFaceBg } from "./components/face.js";
import { renderBoard, loadBoardImages } from "./components/board.js";
import { levels, loadConfig } from './config.js';
import { EventManager, setAutoFlagText } from "./eventManager.js"

function setup() {
    var canvas = document.getElementById("game");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        const userConfig = loadConfig();
        render(ctx, userConfig.level || levels[userConfig.difficulty]);

        // 根据userConfig更新文字提示
        const gameTipsField = document.querySelector('#game-tips');
        const autoFlagBtn = document.querySelector('#autoflag-btn');
        setAutoFlagText(userConfig.autoFlag, autoFlagBtn, gameTipsField);
    }
}

setup();

// 根据data渲染游戏界面
export function render(ctx, level) {
    ctx.fillStyle = "#BDBDBD";
    ctx.fillRect(0, 0, 330, 494);
    const game = new MineSweeper(level.size, level.n);
    const w = 30;
    const h = 30;
    const x0 = 30;
    const y0 = 112;

    const boardHeight = game.size[0] * h;
    const boardWidth = game.size[1] * w;
    // 设置 canvas 的宽度和高度
    ctx.canvas.height = boardHeight + y0 * 2;
    ctx.canvas.width = boardWidth + x0 * 2;

    // 设置css确保显示的大小
    ctx.canvas.style.width = ctx.canvas.width + 'px';
    ctx.canvas.style.height = ctx.canvas.height + 'px';

    // 避免模糊
    const scaleFactor = window.devicePixelRatio;
    ctx.canvas.width = ctx.canvas.width * scaleFactor;
    ctx.canvas.height = ctx.canvas.height * scaleFactor;
    ctx.scale(scaleFactor, scaleFactor);


    // 画背景（不需要每帧更新的部分）
    const { digitPars: pars, onClickBtnGroups } = drawStaticBg(ctx, boardHeight, boardWidth, x0, y0);

    const facePars = {
        w: 36,
        x: x0 + boardWidth / 2 - 18,
        y: pars.y,
    }

    // 加载多个SVG图片
    const digitImages = loadDigitImages(update);
    const faceImage = loadFaceImages(update);
    const svgImages = loadBoardImages(() => {
        drawFaceBg(ctx, svgImages["E"], facePars);
        update();
    });

    function renderTime() {
        renderDigit(ctx, game.spentTime, digitImages, { ...pars, x: pars.xleft });
    }

    function update() {
        renderDigit(ctx, game.numMineCurr, digitImages, pars);
        renderTime();
        renderBoard(ctx, game.board, w, h, svgImages, x0, y0);
        renderFace(ctx, game.state, faceImage, facePars);
    }

    // 注册事件监听(todo: 不在render new这个对象？而是提供方法更新参数？)
    const eventManager = new EventManager(ctx, w, h, x0, y0, game, update, renderTime, facePars, onClickBtnGroups);
    eventManager.addEvents();
}
