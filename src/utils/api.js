const host = 'https://webgames.fun';
// const host = 'http://localhost:15004';

export async function fetchLeaderBoard(level) {
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

export async function submitScore(data) {
  const url = host + '/api/v1/leaderboard/' + data.difficulty;
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
  }
}