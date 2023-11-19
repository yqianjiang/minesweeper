import { showModal, showWinModal } from "./components/prompt.js";
import gameStats from "./gameStats.js";

// 获取按钮和英雄榜元素
const beginnerLeaderboard = document.getElementById("beginner-leaderboard");
const intermediateLeaderboard = document.getElementById("intermediate-leaderboard");
const expertLeaderboard = document.getElementById("expert-leaderboard");
const leaderboard = {
    beginner: beginnerLeaderboard,
    intermediate: intermediateLeaderboard,
    expert: expertLeaderboard,
}

// 更新页面上的英雄榜数据
export function updateLeaderboard(level) {

    // const stats = gameStats.getStats(level);

    const topScores = gameStats.getBestScore(level);
    if (!topScores.length) {
        return;
    }
    // 清空英雄榜
    leaderboard[level].innerHTML = "";

    topScores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${score.name} - ${score.time}秒 - ${score.date || "2023/10/22前"}`;
        leaderboard[level].appendChild(listItem);
    });
}

// 处理提交成绩事件
export function submitScore(gameData) {
    const level = gameData.difficulty;
    if (level === "custom") {
        if (gameData.win) {
            showWinModal(gameData.time);
        }
        return;
    }

    if (gameData.win && gameStats.checkNewBestScore(level, gameData.time)) {
        showModal("新记录", `请在英雄榜留下你的名字（可选）`, (playerName) => {
            gameStats.recordGame(gameData, playerName);
            updateLeaderboard(level);
        });
    } else {
        gameStats.recordGame(gameData);
        if (gameData.win) {
            showWinModal(gameData.time);
        }
    }
}

// 初始化英雄榜
updateLeaderboard("beginner");
updateLeaderboard("intermediate");
updateLeaderboard("expert");
