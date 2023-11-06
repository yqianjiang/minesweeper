import { MineSweeper } from "./game.js";
import { drawStaticBg } from "./draw.js";
import { renderDigit, loadDigitImages } from "./components/digit.js";
import { renderFace, loadFaceImages, drawFaceBg } from "./components/face.js";
import { renderBoard, loadBoardImages } from "./components/board.js";
import { levels, loadConfig, updateUserConfig } from './config.js';
import { showCustomModal } from "./components/prompt.js";
import { checkClickBtn } from "./utils.js"

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
function render(ctx, level) {
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

    registerEvents(ctx, w, h, x0, y0, game, update, renderTime, facePars, onClickBtnGroups);
}

// 注册事件监听
function registerEvents(ctx, w, h, x0, y0, game, update, renderTime, facePars, onClickBtnGroups) {
    let mode = 0;
    // 0: 挖开的模式
    // 1: 插旗模式

    // 计算click到哪个格子
    function _getGridIndex(x, y, x0, y0) {
        // 获取点击位置相对于Canvas的坐标
        const rect = ctx.canvas.getBoundingClientRect();
        
        x -= rect.left;
        y -= rect.top;

        // 计算点击的格子坐标
        const scaleFactor = 1;
        const columnIndex = Math.floor((x - x0 * scaleFactor) / (scaleFactor * w));
        const rowIndex = Math.floor((y - y0 * scaleFactor) / (scaleFactor * h));

        return [rowIndex, columnIndex, x, y];
    }

    function handleClickBoard(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y, clickX, clickY] = _getGridIndex(event.clientX, event.clientY, x0, y0);
        if (x >= 0 && x < game.size[0] && y >= 0 && y < game.size[1]) {
            if (mode === 0) {
                if (event.button === 2) { // 右键点击，标记
                    game.toggleFlag(x, y);
                } else {
                    // 左键点击，揭开
                    game.updateBoard([x, y], renderTime);
                }
            } else { // 插旗模式
                game.toggleFlag(x, y);
            }

            // 重新绘制棋盘
            update();
        } else {
            // 格子外，判断是否点击笑脸坐标;
            const cx = clickX;
            const cy = clickY;
            if (checkClickBtn([cx, cy], {...facePars, h: facePars.w})) {
                game.restart();
                update();
            } else {
                // 判断是否点击下方工具栏
                const selectIdx = onClickBtnGroups(cx, cy);
                if (selectIdx !== -1) {
                    mode = selectIdx;
                }
            }
        }
    };

    // 双击
    function handleDoubleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y] = _getGridIndex(event.clientX, event.clientY, x0, y0);
        if (x >= 0 && x < game.size[0] && y >= 0 && y < game.size[1]) {
            game.revealAdjacentTiles(x, y);
            // TODO: 如果没有解开棋盘，就闪烁一下

            // 重新绘制棋盘
            update();
        }
    }
    ctx.canvas.addEventListener("mousedown", handleClickBoard);
    ctx.canvas.addEventListener("dblclick", handleDoubleClick);
    ctx.canvas.addEventListener("contextmenu", (e) => {
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
    const customBtn = document.querySelector('#custom-btn');
    function setLevel(level, customPars) {
        menuPopupGame.style.visibility = "hidden";

        // 更新用户配置
        updateUserConfig("difficulty", level);
        const pars = customPars || levels[level];
        updateUserConfig("level", pars);

        // 清除之前的eventListener
        removeAllEventListeners();

        // 停止游戏
        game.restart();

        // 清空 canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        render(ctx, pars);
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
    customBtn?.addEventListener?.("click", showCustomPopup)

    function removeAllEventListeners() {
        ctx.canvas.removeEventListener("mousedown", handleClickBoard);
        ctx.canvas.removeEventListener("dblclick", handleDoubleClick);
        menuBtnGame.removeEventListener("click", handleToggleMemu);
        beginnerBtn.removeEventListener("click", setLevelBeginner);
        intermediateBtn.removeEventListener("click", setLevelIntermediate);
        expertBtn.removeEventListener("click", setLevelExpert);
        customBtn?.removeEventListener?.("click", showCustomPopup);
        autoFlagBtn.removeEventListener("click", handleToggleAutoFlag);
    }
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