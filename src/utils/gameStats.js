import userInfo from "./userInfo";
const statsKey = 'minesweeper_stats';

// const host = 'https://minesweeper.webgames.fun';
const host = 'https://webgames.fun';
// const host = 'http://localhost:15004';

// 记录单个难度的统计
class DifficultyStats {
  constructor(difficulty) {
    this.difficulty = difficulty;

    this.reset();
    this.clearLeaderBoard();
  }

  clearLeaderBoard() {
    this.bestScores = [];
  }

  reset() {
    this.totalGames = 0;
    this.totalWins = 0;
    this.winRate = 0; // 胜率
    this.maxWinStreak = 0; // 最长连胜次数
    this.maxLoseStreak = 0; // 最长连败次数
    this.currentWinStreak = 0; // 当前连胜次数
    this.currentLoseStreak = 0; // 当前连败次数
    this.highestEfficiency = 0; // 最高效率
    this.record = [];       // 最近100局的胜负，1=胜, 0=负
    this.movingWinRate = 0; // 动态胜率(最近100局的胜率)
  }

  checkNewBestScore(score) {
    return this.bestScores.length < 5 || score < this.bestScores.slice(-1)[0].time;
  }

  uploadScore(data) {
    const url = host + '/api/v1/leaderboard/' + this.difficulty;
    const headers = {
      // 'X-Bmob-Application-Id': 'f6d5e6f1f6b8c5b5f0e3f0a1f3d5a1e9',
      // 'X-Bmob-REST-API-Key': 'd8e8e0b6d4c1d4b0d9c2a1b7f0d7c9c7',
      'Content-Type': 'application/json',
    };
    const addition = {
      ua: navigator.userAgent,
      uuid: userInfo.uuid,
    };
    const body = JSON.stringify({ ...addition, ...data });
    fetch(url, { method: 'POST', headers, body })
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  recordGame({ win, score, playerName }) {
    if (playerName) {
      userInfo.updateName(playerName);
    }
    this.totalGames++;
    if (win) {
      this.record.push(1);
      this.totalWins++;
      this.currentWinStreak++;
      this.currentLoseStreak = 0;
      this.maxWinStreak = Math.max(this.maxWinStreak, this.currentWinStreak);
      // 更新leaderboard
      if (this.checkNewBestScore(score)) {
        const day = new Date();
        const curr = { name: userInfo.name || '匿名', time: score, date: day.toLocaleDateString() };
        const idx = searchInsert(this.bestScores, score);
        // keep top 5 only
        this.bestScores = [...this.bestScores.slice(0, idx), curr, ...this.bestScores.slice(idx, 4)];
      }
      this.uploadScore({ name: userInfo.name || '匿名', score: score });
    } else {
      this.record.push(0);
      this.currentWinStreak = 0;
      this.currentLoseStreak++;
      this.maxLoseStreak = Math.max(this.maxLoseStreak, this.currentLoseStreak);
    }
    this.winRate = this.totalWins / this.totalGames;

    if (this.totalGames <= 100) {
      this.movingWinRate = this.winRate;
    } else {
      this.record.shift();  // 超过100，丢弃更远的数据
      this.movingWinRate = this.record.filter(x => x).length / 100;
    }
  }

  // 在本地存储中加载统计数据
  loadFromStorage() {
    try {
      const savedStats = JSON.parse(localStorage.getItem(statsKey + 'Stats' + this.difficulty));
      for (const key in savedStats) {
        this[key] = savedStats[key];
      }
      const scores = JSON.parse(localStorage.getItem(`${this.difficulty}-scores`)) || [];
      this.bestScores = scores.slice(0, 5);
    } catch (error) {
      console.log("Error loading data from local storage:", error);
    }
  }

  // 保存统计数据到本地存储
  saveToStorage() {
    localStorage.setItem(statsKey + 'Stats' + this.difficulty, JSON.stringify(this.getStats()));
    localStorage.setItem(`${this.difficulty}-scores`, JSON.stringify(this.bestScores));
  }

  getStats() {
    return {
      totalGames: this.totalGames,
      totalWins: this.totalWins,
      winRate: this.winRate, // 胜率
      maxWinStreak: this.maxWinStreak, // 最长连胜次数
      maxLoseStreak: this.maxLoseStreak, // 最长连败次数
      currentWinStreak: this.currentWinStreak, // 当前连胜次数
      currentLoseStreak: this.currentLoseStreak, // 当前连败次数
      highestEfficiency: this.highestEfficiency, // 最高效率
      record: this.record,      // 最近100局的胜负，1=胜, 0=负
      movingWinRate: this.movingWinRate,
    };
  }
}

// 记录所有难度统计
class GameStats {
  constructor() {
    this.beginnerStats = new DifficultyStats('beginner');
    this.intermediateStats = new DifficultyStats('intermediate');
    this.expertStats = new DifficultyStats('expert');

    this.gameRecords = [];
    this.loadFromStorage();
  }

  // 记录一局游戏数据
  recordGame(gameData, playerName) {
    gameData.timestamp = Date.now();
    gameData.clicks.total = gameData.clicks.active + gameData.clicks.wasted;
    gameData.efficiency = gameData.currBV / gameData.clicks.total;
    this.gameRecords.push(gameData);

    const { difficulty } = gameData;
    this[`${difficulty}Stats`].recordGame({ win: gameData.win, score: gameData.time, playerName });

    this.saveToStorage();
  }

  checkNewBestScore(difficulty, score) {
    return this[`${difficulty}Stats`].checkNewBestScore(score);
  }

  getStats(difficulty) {
    return this[`${difficulty}Stats`].getStats();
  }

  getBestScore(difficulty) {
    return this[`${difficulty}Stats`].bestScores;
  }

  // 在本地存储中加载统计数据
  loadFromStorage() {
    try {
      const savedRecords = JSON.parse(localStorage.getItem(statsKey + 'Records'));
      if (savedRecords) {
        this.gameRecords = savedRecords;
      }
      this.beginnerStats.loadFromStorage();
      this.intermediateStats.loadFromStorage();
      this.expertStats.loadFromStorage();
    } catch (error) {
      console.log("Error loading data from local storage:", error);
    }
  }

  // 保存统计数据到本地存储
  saveToStorage() {
    localStorage.setItem(statsKey + 'Records', JSON.stringify(this.gameRecords));
    this.beginnerStats.saveToStorage();
    this.intermediateStats.saveToStorage();
    this.expertStats.saveToStorage();
  }

  // 重置扫雷统计信息（包括 gameStats 和英雄榜），不清空 gameRecords
  resetStats(difficulty) {
    this[`${difficulty}Stats`].reset();
    this[`${difficulty}Stats`].clearLeaderBoard();
    this.saveToStorage();
  }

  clearRecords() {
    this.gameRecords = [];
    this.saveToStorage();
  }
}

const gameStats = new GameStats();
export default gameStats;

// 使用:
// gameStats.recordGame({
//   difficulty: 'beginner',
//   win: true,
//   clicks: {
//     active: 180,
//     wasted: 20,
//   },
//   time: 60000, // 毫秒
//   bv: 12,
//   currBV: 12,
// });
// gameStats.getStats("beginner");

function searchInsert(nums, target) {
  // nums有序：二分法
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    if (target === nums[middle].time) {
      return middle;
    }
    if (target > nums[middle].time) {
      left = middle + 1;
    } else {
      right = middle - 1;
    }
  }
  return left;
};