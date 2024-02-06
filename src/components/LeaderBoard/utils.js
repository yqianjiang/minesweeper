import { showModal, showWinModal } from "../prompt/index.js";
import gameStats from "../../utils/gameStats.js";
import userInfo from "../../utils/userInfo.js";
import { fetchLeaderBoard } from "../../utils/api.js";

// 获取按钮和英雄榜元素
const domLastUpdateTime = document.getElementById("leaderboard-update-time");
const leaderBoard = {
  beginner: document.getElementById("beginner-leaderboard"),
  intermediate: document.getElementById("intermediate-leaderboard"),
  expert: document.getElementById("expert-leaderboard"),
}

// 更新页面上的英雄榜数据
export async function updateLeaderBoard(level) {
  const topScores = await fetchLeaderBoard(level);
  if (topScores.length) {
    leaderBoard[level].innerHTML = "";
    topScores.forEach(({ name, score, create_time: date }, index) => {
      const listItem = document.createElement("li");
      // 把 date 从 UTC 时间转换成当地时间
      date = date ? new Date(date + "Z").toLocaleString("zh").split(" ")[0] : null;
      listItem.textContent = `${index + 1}. ${name} - ${score}秒 - ${date || "N/A"}`;
      leaderBoard[level].appendChild(listItem);
    });
  } else {
    leaderBoard[level].innerHTML = `暂时还没有分数，等你来刷榜哦！`;
  }
  domLastUpdateTime.textContent = new Date().toLocaleString("zh");
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

  if (gameData.win && !userInfo.name) {
    showModal("游戏胜利", `请留尊姓大名`, (playerName) => {
      userInfo.updateName(playerName);
      gameStats.recordGame(gameData, playerName);
      showWinModal(gameData, gameStats);
    });
  } else {
    gameStats.recordGame(gameData);
    if (gameData.win) {
      showWinModal(gameData, gameStats);
    }
  }
}