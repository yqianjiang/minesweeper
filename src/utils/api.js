import userInfo from "./userInfo";

const host = 'https://api.minesweeperplay.online';
// const host = 'http://localhost:15004';

function isValidScore(difficulty, score) {
  // 根据难度设置合理范围
  const ranges = {
    beginner: { min: 0, max: 999 },
    intermediate: { min: 0, max: 999 },
    expert: { min: 5, max: 999 }
  };

  const { min, max } = ranges[difficulty] || {};
  return typeof score === 'number' && score >= min && score <= max;
}

export async function fetchLeaderBoard(level) {
  const url = host + '/api/v1/leaderboard/' + level;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return;
  }
}

export async function uploadScore({ difficulty, ...data }) {
  const score = data.score;
  // 客户端验证
  if (!isValidScore(difficulty, score)) {
    return;
  }

  const url = host + '/api/v1/leaderboard/' + difficulty;
  const headers = {
    'Content-Type': 'application/json',
  };
  const addition = {
    ua: navigator.userAgent,
    uuid: userInfo.uuid,
  };
  const body = JSON.stringify({ ...addition, ...data });
  try {
    const res = await fetch(url, { method: 'POST', headers, body });
    return res.json();
  } catch (err) {
    console.log(err);
    // 上传失败，暂时保存在 localStorage
    const key = `minesweeper-fail`;
    const localData = localStorage.getItem(key);
    const errorData = {
      date: new Date().toISOString(),
      difficulty,
      body,
      error: err,
    }
    if (localData) {
      const data = JSON.parse(localData);
      data.push(errorData);
      localStorage
        .setItem(key, JSON.stringify(data));
    } else {
      localStorage
        .setItem(key, JSON.stringify([errorData]));
    }
  }
}
