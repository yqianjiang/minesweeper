import { loadConfig } from './config.js';
import { EventManager, setAutoFlagText } from "./eventManager.js";
import { render } from "./render.js";

function setup() {
    const canvas = document.getElementById("game");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");

        // 根据userConfig更新文字提示
        const userConfig = loadConfig();
        const gameTipsField = document.querySelector('#game-tips');
        const autoFlagBtn = document.querySelector('#autoflag-btn');
        setAutoFlagText(userConfig.autoFlag, autoFlagBtn, gameTipsField);

        const eventManager = new EventManager();
        render(ctx, null, eventManager);
    }
}

setup();