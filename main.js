import { MineSweeper } from "./game.js";
import { drawOuterBox, loadBoardImages, loadDigitImages, loadFaceImages } from "./draw.js";
import { levels, loadConfig, updateUserConfig } from './config.js';

function setup() {
    var canvas = document.getElementById("game");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        const userConfig = loadConfig();
        render(ctx, canvas, userConfig.difficulty);

        // 根据userConfig更新文字提示
        const gameTipsField = document.querySelector('#game-tips');
        const autoFlagBtn = document.querySelector('#autoflag-btn');
        setAutoFlagText(userConfig.autoFlag, autoFlagBtn, gameTipsField);
    }
}

setup();

// 根据data渲染游戏界面
function render(ctx, canvas, level) {
    const game = new MineSweeper(level.size, level.n);
    const w = 30;
    const h = 30;
    const x0 = 30;
    const y0 = 112;


    const boardHeight = game.size[0] * h;
    const boardWidth = game.size[1] * w;
    // 设置 canvas 的宽度和高度
    canvas.height = boardHeight + y0 + x0;
    canvas.width = boardWidth + x0 * 2;

    // 画外层背景
    const { digitPars: pars } = drawOuterBox(ctx, boardHeight, boardWidth, x0, y0);

    // 加载多个SVG图片
    const digitImages = loadDigitImages(update);
    const faceImage = loadFaceImages(update);
    const svgImages = loadBoardImages(update);

    const facePars = {
        w: 36,
        x: x0 + boardWidth / 2 - 18,
        y: pars.y,
    }

    function renderTime() {
        renderDigit(ctx, game.spentTime, digitImages, { ...pars, x: pars.xleft });
    }

    function update() {
        renderDigit(ctx, game.numMineCurr, digitImages, pars);
        renderTime();
        renderBoard(ctx, game.board, w, h, svgImages, x0, y0);
        renderFeedback(ctx, game.state, faceImage, facePars);
    }

    registerEvents(canvas, w, h, x0, y0, game, update, renderTime, facePars, ctx);
}

// 渲染board
function renderBoard(ctx, board, w, h, svgImages, x, y) {
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

// 渲染数字
function renderDigit(ctx, num, svgImages, { x, y, w, h, xgap }) {
    // num 数字 渲染对应的图片
    if (num > 999) {
        num = 999;  // 最多显示三位数
    }
    const str = Math.round(num).toString().split('');  // 转成数组，可以从后往前渲染

    for (let i = 2; i >= 0; i--) {
        const svgImage = svgImages[str.pop() || 0];
        ctx.drawImage(svgImage, x + i * (w + xgap), y, w, h);
    }
}

// 渲染笑脸
function renderFeedback(ctx, state, svgImage, { w, x, y }) {
    const stateMap = {
        "unpressed": 0,
        "active": 1,  // 揭开新的，持续一下就变回unpressed
        "win": 2,
        "lose": 3,
    }
    const originW = 20;
    ctx.drawImage(svgImage, originW * stateMap[state], 0, originW, originW, x, y, w, w);
}

// 注册事件监听
function registerEvents(canvas, w, h, x0, y0, game, update, renderTime, facePars, ctx) {
    // 计算click到哪个格子
    function _getGridIndex(x, y) {
        // 获取点击位置相对于Canvas的坐标
        const rect = canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;

        // 计算点击的格子坐标
        const columnIndex = Math.floor(x / w);
        const rowIndex = Math.floor(y / h);

        return [rowIndex, columnIndex, x, y];
    }

    function handleClickBoard(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y, clickX, clickY] = _getGridIndex(event.clientX - x0, event.clientY - y0);
        if (x >= 0 && x < game.size[0] && y >= 0 && y < game.size[1]) {
            if (event.button === 2) { // 右键点击，标记
                game.toggleFlag(x, y);
            } else {
                // 左键点击，揭开
                game.updateBoard([x, y], renderTime);
            }

            // 重新绘制棋盘
            update();
        } else {
            // 格子外，判断是否点击笑脸坐标;
            const cx = clickX + x0;
            const cy = clickY + y0;
            if (cx > facePars.x && cx < facePars.x + facePars.w && cy > facePars.y && cy < facePars.y + facePars.w) {
                game.restart();
                update();
            }
        }
    };

    // 双击
    function handleDoubleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y] = _getGridIndex(event.clientX - x0, event.clientY - y0);
        if (x >= 0 && x < game.size[0] && y >= 0 && y < game.size[1]) {
            game.revealRemainingE(x, y);
            // TODO: 如果没有解开棋盘，就闪烁一下

            // 重新绘制棋盘
            update();
        }
    }
    canvas.addEventListener("mousedown", handleClickBoard);
    canvas.addEventListener("dblclick", handleDoubleClick);
    canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    const menuBtnGame = document.querySelector('#menu-btn-game');
    const menuPopupGame = document.querySelector('.menu-popup-game');
    function handleToggleMemu() {
        if (menuPopupGame.style.visibility === "visible") {
            menuPopupGame.style.visibility = "hidden";
        } else {
            menuPopupGame.style.visibility = "visible";
        }
    }
    menuBtnGame.addEventListener("click", handleToggleMemu);

    const gameTipsField = document.querySelector('#game-tips');
    const autoFlagBtn = document.querySelector('#autoflag-btn');
    function handleToggleAutoFlag() {
        game.isAutoFlag = !game.isAutoFlag;
        updateUserConfig("autoFlag", game.isAutoFlag);
        setAutoFlagText(game.isAutoFlag, autoFlagBtn, gameTipsField);
        // 收起菜单？
        menuPopupGame.style.visibility = "hidden";
    }
    autoFlagBtn.addEventListener("click", handleToggleAutoFlag);

    const beginnerBtn = document.querySelector('#beginner-btn');
    const intermediateBtn = document.querySelector('#intermediate-btn');
    const expertBtn = document.querySelector('#expert-btn');
    function setLevel(level) {
        menuPopupGame.style.visibility = "hidden";
        updateUserConfig("difficulty", level);
        // 清除之前的eventListener
        canvas.removeEventListener("mousedown", handleClickBoard);
        canvas.removeEventListener("dblclick", handleDoubleClick);
        menuBtnGame.removeEventListener("click", handleToggleMemu);
        beginnerBtn.removeEventListener("click", setLevelBeginner);
        intermediateBtn.removeEventListener("click", setLevelIntermediate);
        expertBtn.removeEventListener("click", setLevelExpert);
        autoFlagBtn.removeEventListener("click", handleToggleAutoFlag);

        // 停止游戏
        game.restart();

        // 清空 canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        render(ctx, canvas, level);
    }
    function setLevelBeginner() {
        setLevel(levels.BEGINNER);
    }
    function setLevelIntermediate() {
        setLevel(levels.INTERMEDIATE);
    }
    function setLevelExpert() {
        setLevel(levels.EXPERT);
    }
    beginnerBtn.addEventListener("click", setLevelBeginner)
    intermediateBtn.addEventListener("click", setLevelIntermediate)
    expertBtn.addEventListener("click", setLevelExpert)
}

function setAutoFlagText(isAutoFlag, autoFlagBtn, gameTipsField) {
    if (isAutoFlag) {
        autoFlagBtn.innerText = "关闭自动标雷";
        gameTipsField.innerText = "* 自动标雷模式已开启，可以在“游戏”菜单下关闭。";
    } else {
        autoFlagBtn.innerText = "打开自动标雷";
        gameTipsField.innerText = "* 自动标雷模式已关闭，可以在“游戏”菜单下开启。";
    }
}