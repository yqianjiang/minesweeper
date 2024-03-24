import React, { useEffect, useState } from "react";
import AskNameModal from "../prompt/AskNameModal";
import userInfo from "../../utils/userInfo";
import { fetchLeaderBoard } from "../../utils/api";
import "./style.css";

const levelMap = {
  beginner: "初级",
  intermediate: "中级",
  expert: "高级"
};

const timeRanges = [
  { value: 'today', label: '今天' },
  { value: 'week', label: '本周' },
  { value: 'allTime', label: '所有时间' }
];

function LeaderBoard() {
  const handleRefreshLeaderboard = () => {
    updateLeaderBoard("beginner");
    updateLeaderBoard("intermediate");
    updateLeaderBoard("expert");
  }

  const [playerName, setPlayerName] = useState("");
  const [currentTimeRange, setCurrentTimeRange] = useState("today");
  const [showAskNameModal, setShowAskNameModal] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('---');
  const [leaderBoard, setLeaderBoard] = useState({
    all: { beginner: null, intermediate: null, expert: null },
    weekly: { beginner: null, intermediate: null, expert: null },
    today: { beginner: null, intermediate: null, expert: null }
  });

  const handleChangeName = () => {
    setShowAskNameModal(true);
  }

  async function updateLeaderBoard(level) {
    const topScores = await fetchLeaderBoard(level);
    // topScores 是一个对象，分别是几个时间段在某个 level 的数据
    // 比如 topScores = { all: [], weekly: [], today: [] }
    for (let timeRange in topScores) {
      if (topScores[timeRange].length) {
        setLeaderBoard(prevData => ({
          ...prevData,
          [timeRange]: {
            ...prevData[timeRange],
            [level]: topScores[timeRange].map(({ name, score, create_time: date }, index) => {
              // 把 date 从 UTC 时间转换成当地时间
              date = date ? new Date(date + "Z").toLocaleString("zh").split(" ")[0] : null;
              return `${index + 1}. ${name} - ${score}秒 - ${date || "N/A"}`;
            })
          }
        }));
      } else {
        setLeaderBoard(prevData => ({
          ...prevData,
          [timeRange]: {
            ...prevData[timeRange],
            [level]: []
          }
        }));
      }
    }
    setLastUpdateTime(new Date().toLocaleString("zh"));
  }

  const handleTimeRangeChange = (timeRange) => {
    setCurrentTimeRange(timeRange);
    // updateLeaderBoard("beginner");
    // updateLeaderBoard("intermediate");
    // updateLeaderBoard("expert");
  };

  // 初始化玩家姓名
  useEffect(() => {
    setPlayerName(userInfo.name);
    userInfo.onNameChange((newName) => {
      setPlayerName(newName);
    });
    updateLeaderBoard("beginner");
    updateLeaderBoard("intermediate");
    updateLeaderBoard("expert");
  }, []);

  return (
    <>
      <h2>扫雷英雄榜</h2>
      <p>* 本地成绩可以在游戏菜单的 "扫雷信息统计" 中查看。</p>
      <p>* 请注意，这个在线英雄榜功能只从 2024 年 1 月 14 日开始收集数据，且 2024 年 3 月 12 日附近的数据可能存在丢失的情况。</p>
      <div className="time-range-buttons">
      {timeRanges.map(({ value, label }) => (
        <button
          key={value}
          className={currentTimeRange === value ? 'selected' : ''}
          onClick={() => handleTimeRangeChange(value)}
        >
          {label}
        </button>
      ))}
      </div>
      <div className="leaderboard">
        {["beginner", "intermediate", "expert"].map((level) => (
          <div className="leaderboard-section" key={level}>
            <h3>{levelMap[level]}</h3>
            {leaderBoard[currentTimeRange][level] ? leaderBoard[currentTimeRange][level].length ? <ul>
              {leaderBoard[currentTimeRange][level].map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul> : 
            "暂时还没有分数，等你来刷榜哦！"
            : "数据加载中..."}
          </div>
        ))}
      </div>
      <p>
        最后更新时间：<span>{lastUpdateTime}</span>
        <button className="btn" onClick={handleRefreshLeaderboard}>刷新</button>
      </p>
      <p>
        我的昵称：<span>{playerName}</span>
        <button className="btn" onClick={
          handleChangeName
        }>修改</button>
      </p>
      <p>* 昵称用于展示在扫雷英雄榜中（可重名），修改后的昵称将会在下次游戏获胜上传成绩时生效，已提交的成绩的昵称不会被修改。</p>
      <AskNameModal
        open={showAskNameModal}
        setOpen={setShowAskNameModal}
        title="修改昵称"
        msg="请输入新的昵称"
        defaultName={playerName}
        onSubmit={(newName) => {
          userInfo.updateName(newName);
          setPlayerName(newName);
        }}
      />
    </>
  );
}

export default LeaderBoard;
