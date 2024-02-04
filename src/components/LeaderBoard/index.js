import { showModal, showWinModal } from "../prompt/index.js";
import gameStats from "../../utils/gameStats.js";
import userInfo from "../../utils/userInfo.js";

const host = 'https://webgames.fun';
// const host = 'http://localhost:15004';

// 获取按钮和英雄榜元素
const domLastUpdateTime = document.getElementById("leaderboard-update-time");
const domBtnRefresh = document.getElementById("btn-refresh-leaderboard");
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

async function fetchLeaderBoard(level) {
  const url = host + '/api/v1/leaderboard/' + level;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.allTime || [];
  } catch (err) {
    console.log(err);
    return [];
  }
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
      domPlayerName.textContent = playerName;
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

// 初始化英雄榜
updateLeaderBoard("beginner");
updateLeaderBoard("intermediate");
updateLeaderBoard("expert");

// 绑定刷新英雄榜按钮事件
domBtnRefresh.addEventListener("click", () => {
  updateLeaderBoard("beginner");
  updateLeaderBoard("intermediate");
  updateLeaderBoard("expert");
});

// 展示玩家昵称
const domBtnChangeName = document.getElementById("btn-change-name");
const domPlayerName = document.getElementById("player-name");
domPlayerName.textContent = userInfo.name;

// 绑定修改昵称按钮事件
domBtnChangeName.addEventListener("click", () => {
  showModal("修改昵称", `请输入新的昵称`, (playerName) => {
    userInfo.updateName(playerName);
    domPlayerName.textContent = playerName;
  });
});