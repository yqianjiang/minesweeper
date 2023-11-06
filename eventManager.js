import { levels, updateUserConfig } from './config.js';
import { showCustomModal } from "./components/prompt.js";
import { checkClickBtn } from "./utils.js"
import { render } from "./main.js"

export class EventManager {
    constructor(ctx, w, h, x0, y0, game, update, renderTime, facePars, onClickBtnGroups) {
        this.ctx = ctx;
        this.game = game;
        this.update = update;
        this.renderTime = renderTime;
        this.facePars = facePars;
        this.onClickBtnGroups = onClickBtnGroups;

        this.w = w;
        this.h = h;
        this.x0 = x0;
        this.y0 = y0;
        this.scaleFactor = 1;
        this.mode = 0;
        // 0: 挖开的模式
        // 1: 插旗模式

        this.menuPopupGame = null;
        this.eventHandlers = {};
    }

    addEventListener(elementId, eventType, fn) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (!this.eventHandlers[elementId]) {
            this.eventHandlers[elementId] = {};
        }

        if (!this.eventHandlers[elementId][eventType]) {
            this.eventHandlers[elementId][eventType] = [];
        }

        element.addEventListener(eventType, fn);
        this.eventHandlers[elementId][eventType].push(fn);
    }

    removeAllEventListeners() {
        for (const elementId in this.eventHandlers) {
            const element = document.getElementById(elementId);
            if (!element) continue;

            for (const eventType in this.eventHandlers[elementId]) {
                this.eventHandlers[elementId][eventType].forEach((fn) => {
                    element.removeEventListener(eventType, fn);
                });
            }
        }
        this.eventHandlers = {}; // 清空已存的事件处理函数
    }

    addCanvasClickEvents() {
        this.addEventListener("game", "mousedown", this.handleClickBoard.bind(this));
        this.addEventListener("game", "dblclick", this.handleDoubleClick.bind(this));
        this.addEventListener("game", "contextmenu", (e) => {
            e.preventDefault();
        });
    }
    addEvents() {
        this.addCanvasClickEvents();
        this.addEventListener("menu-btn-game", "click", this.handleToggleMenu.bind(this));
        this.addEventListener("autoflag-btn", "click", (e) => {
            const gameTipsField = document.querySelector('#game-tips');
            this.handleToggleAutoFlag(e.target, gameTipsField);
        });
        this.addEventListener("beginner-btn", "click", () => {
            this.setLevel("BEGINNER");
        })
        this.addEventListener("intermediate-btn", "click", () => {
            this.setLevel("INTERMEDIATE");
        })
        this.addEventListener("expert-btn", "click", () => {
            this.setLevel("EXPERT");
        })
        this.addEventListener("custom-btn", "click", () => {
            showCustomModal("自定义", (pars) => {
                this.setLevel("CUSTOM", pars);
            });
        })
    }

    // 计算click到哪个格子
    _getGridIndex(x, y) {
        const rect = this.ctx.canvas.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
        const columnIndex = Math.floor((x - this.x0 * this.scaleFactor) / (this.scaleFactor * this.w));
        const rowIndex = Math.floor((y - this.y0 * this.scaleFactor) / (this.scaleFactor * this.h));
        return [rowIndex, columnIndex, x, y];
    }
    handleClickBoard(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y, clickX, clickY] = this._getGridIndex(event.clientX, event.clientY);
        if (x >= 0 && x < this.game.size[0] && y >= 0 && y < this.game.size[1]) {
            if (this.mode === 0) {
                if (event.button === 2) { // 右键点击，标记
                    this.game.toggleFlag(x, y);
                } else {
                    // 左键点击，挖开
                    this.game.updateBoard([x, y], this.renderTime);
                }
            } else { // 插旗模式
                this.game.toggleFlag(x, y);
            }
            // 重新绘制棋盘
            this.update();
        } else {
            // 棋盘外，工具栏点击
            const cx = clickX;
            const cy = clickY;
            if (checkClickBtn([cx, cy], { ...this.facePars, h: this.facePars.w })) {
                // 笑脸
                this.game.restart();
                this.update();
            } else {
                // 下方工具栏
                const selectIdx = this.onClickBtnGroups(cx, cy);
                if (selectIdx !== -1) {
                    this.mode = selectIdx;
                }
            }
        }
    }

    handleDoubleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y] = this._getGridIndex(event.clientX, event.clientY);
        if (x >= 0 && x < this.game.size[0] && y >= 0 && y < this.game.size[1]) {
            this.game.revealAdjacentTiles(x, y);
            // TODO: 如果没有解开棋盘，就闪烁一下

            // 重新绘制棋盘
            this.update();
        }
    }

    handleToggleMenu() {
        if (!this.menuPopupGame) {
            this.menuPopupGame = document.querySelector('.menu-popup-game');
        }
        if (this.menuPopupGame.style.visibility === "visible") {
            this.menuPopupGame.style.visibility = "hidden";
        } else {
            this.menuPopupGame.style.visibility = "visible";
        }
    }

    handleToggleAutoFlag(autoFlagBtn, gameTipsField) {
        this.game.isAutoFlag = !this.game.isAutoFlag;
        updateUserConfig("autoFlag", this.game.isAutoFlag);
        setAutoFlagText(this.game.isAutoFlag, autoFlagBtn, gameTipsField);
        // 收起菜单
        if (this.menuPopupGame) {
            this.menuPopupGame.style.visibility = "hidden";
        }
    }

    setLevel(level, customPars) {
        if (this.menuPopupGame) {
            this.menuPopupGame.style.visibility = "hidden";
        }

        // 更新用户配置
        updateUserConfig("difficulty", level);
        const pars = customPars || levels[level];
        updateUserConfig("level", pars);

        // 清除之前的eventListener
        this.removeAllEventListeners();

        // 停止游戏
        this.game.restart();

        // 清空 canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        render(this.ctx, pars);
    }
}

export function setAutoFlagText(isAutoFlag, autoFlagBtn, gameTipsField) {
    if (isAutoFlag) {
        autoFlagBtn.innerText = "关闭自动标雷";
        gameTipsField.innerText = "* 自动标雷模式已开启，可以在“游戏”菜单下关闭。";
    } else {
        autoFlagBtn.innerText = "打开自动标雷";
        gameTipsField.innerText = "* 自动标雷模式已关闭，可以在“游戏”菜单下开启。";
    }
}