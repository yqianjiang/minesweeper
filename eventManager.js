import { levels, updateUserConfig } from './config.js';
import { showCustomModal, showStatsModal } from "./components/prompt.js";
import { checkClickBtn } from "./utils.js"
import { render } from "./main.js"

export class EventManager {
    constructor(ctx, w, h, x0, y0, game, update, renderTime, facePars, onClickBtnGroups) {
        this.ctx = ctx;
        this.game = game;
        this.update = (...pars) => requestAnimationFrame(() => update(...pars));
        this.renderTime = renderTime;
        this.facePars = facePars;
        this.onClickBtnGroups = onClickBtnGroups;

        this.w = w;
        this.h = h;
        this.x0 = x0;
        this.y0 = y0;
        this.scaleFactor = 1;
        this.pressing = false;
        this.mode = 0;
        // 0: 挖开的模式
        // 1: 插旗模式

        this.menuPopupGame = null;
        this.eventHandlers = {};
    }

    _getElement(elementId) {
        let element;
        if (elementId === "document") {
            element = document;
        } else {
            element = document.getElementById(elementId);
        }
        return element;
    }

    addEventListener(elementId, eventType, fn) {
        const element = this._getElement(elementId);
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
            const element = this._getElement(elementId);
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
        this.addEventListener("game", "mousedown", (event) => {
            this.handleClick(event, false);
        });
        this.addEventListener("game", "mousemove", (event) => {
            if (this.pressing) {
                this.handleClick(event, false);
            }
        });
        this.addEventListener("game", "mouseup", (event) => {
            this.pressing = false;
            this.handleClick(event, true);
        });
        // this.addEventListener("game", "dblclick", (event)=>{
        //     this.pressing = false;
        //     this.handleClick(event, true, true);
        // });
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
            this._hideMenuPopup();
            this.setLevel("BEGINNER");
        })
        this.addEventListener("intermediate-btn", "click", () => {
            this._hideMenuPopup();
            this.setLevel("INTERMEDIATE");
        })
        this.addEventListener("expert-btn", "click", () => {
            this._hideMenuPopup();
            this.setLevel("EXPERT");
        })
        this.addEventListener("custom-btn", "click", () => {
            this._hideMenuPopup();
            showCustomModal("自定义雷区", (pars) => {
                this.setLevel("CUSTOM", pars);
            });
        })        
        this.addEventListener("stats-btn", "click", () => {
            this._hideMenuPopup();
            showStatsModal();
        })
        
        this.addEventListener("start-btn", 'click', () => {
            this._hideMenuPopup();
            this._restartGame();
        });
        this.addEventListener('document', 'keydown', (event) => {
            if (event.key === 'F2') {
                // F2键被按下,在这里执行你的代码
                event.preventDefault();
                this._restartGame();
            }
        });
    }

    _hideMenuPopup() {
        if (this.menuPopupGame) {
            this.menuPopupGame.style.visibility = "hidden";
        }
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
    _restartGame() {
        this.game.restart();
        this.update();
    }
    _handleClickBoard(event, x, y, isMouseUp) {
        if (this.mode === 1 || event.button === 2) {  // 右键或插旗模式，标记
            if (!isMouseUp) {
                this.game.toggleFlag(x, y);
            }
        } else {  // mode===0且左键点击，挖开
            if (isMouseUp) {
                this.game.handleClick([x,y], this.renderTime);
            } else {
                // 按住的状态
                this._handlePressBoard(x, y);
                return; // 避免重新绘制棋盘
            }
        }
        // 重新绘制棋盘
        this.update();
    }
    _handlePressBoard(x, y) {
        this.pressing = true;  // todo: 节流？
        // console.log('pressing', x, y);
        if (this.game.isNumTile(x, y)) {   // 双击
            const pressPositions = this.game.getAdjacentTiles(x, y);
            if (pressPositions.length) {
                this.update({ pressPositions });
            }
        } else {
            this.update({ pressPositions: [[x, y]] });
        }
    }
    handleClick(event, isMouseUp, dbClick) {
        event.preventDefault();
        event.stopPropagation();
        const [x, y, clickX, clickY] = this._getGridIndex(event.clientX, event.clientY);
        if (x >= 0 && x < this.game.size[0] && y >= 0 && y < this.game.size[1]) {
            this._handleClickBoard(event, x, y, isMouseUp);
        } else {
            // 棋盘外，工具栏点击
            const cx = clickX;
            const cy = clickY;
            if (checkClickBtn([cx, cy], { ...this.facePars, h: this.facePars.w })) {
                // 笑脸
                this._restartGame();
            } else {
                // 下方工具栏
                const selectIdx = this.onClickBtnGroups(cx, cy);
                if (selectIdx !== -1) {
                    this.mode = selectIdx;
                }
            }
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
        this._hideMenuPopup();
    }

    _reRender(pars) {
        // 清除之前的eventListener
        this.removeAllEventListeners();

        // 停止游戏
        this.game.restart();

        // 清空 canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        render(this.ctx, pars);
    }
    setLevel(level, customPars) {
        // 更新用户配置
        updateUserConfig("difficulty", level);
        const pars = customPars || levels[level];
        updateUserConfig("level", pars);

        this._reRender(pars);
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