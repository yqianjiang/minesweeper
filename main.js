import { MineSweeper } from "./game.js";
import { drawOuterBox } from "./draw.js";
import { renderDigit, loadDigitImages } from "./components/digit.js";
import { renderFace, loadFaceImages, drawFaceBg } from "./components/face.js";
import { renderBoard, loadBoardImages } from "./components/board.js";
import { levels, loadConfig, updateUserConfig } from './config.js';
import { showCustomModal } from "./components/prompt.js";

function setup() {
    var canvas = document.getElementById("game");
    if (canvas.getContext) {
        var ctx = canvas.getContext("2d");
        const userConfig = loadConfig();
        render(ctx, canvas, userConfig.level || levels[userConfig.difficulty]);

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

    // 画背景（不需要每帧更新的部分）
    const { digitPars: pars } = drawOuterBox(ctx, boardHeight, boardWidth, x0, y0);

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

    registerEvents(canvas, w, h, x0, y0, game, update, renderTime, facePars, ctx);
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
    // const customBtn = document.querySelector('#custom-btn');
    function setLevel(level, customPars) {
        menuPopupGame.style.visibility = "hidden";
        updateUserConfig("difficulty", level);
        const pars = customPars || levels[level];
        updateUserConfig("level", pars);
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
        render(ctx, canvas, pars);
    }
    function setLevelBeginner() {
        setLevel("BEGINNER");
    }
    function setLevelIntermediate() {
        setLevel("INTERMEDIATE");
    }
    function setLevelExpert() {
        setLevel("EXPERT");
    }
    function showCustomPopup() {
        showCustomModal("自定义", (pars) => {
            setLevel("CUSTOM", pars);
        });
    }
    beginnerBtn.addEventListener("click", setLevelBeginner)
    intermediateBtn.addEventListener("click", setLevelIntermediate)
    expertBtn.addEventListener("click", setLevelExpert)
    // customBtn.addEventListener("click", showCustomPopup)
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