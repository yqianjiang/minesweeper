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

function LeaderBoard() {
  const handleRefreshLeaderboard = () => {
    updateLeaderBoard("beginner");
    updateLeaderBoard("intermediate");
    updateLeaderBoard("expert");
  }

  const [playerName, setPlayerName] = useState("");
  const [showAskNameModal, setShowAskNameModal] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('---');
  const [leaderBoard, setLeaderBoard] = useState({
    beginner: null,
    intermediate: null,
    expert: null
  });

  const handleChangeName = () => {
    setShowAskNameModal(true);
  }

  async function updateLeaderBoard(level) {
    const topScores = await fetchLeaderBoard(level);
    if (topScores.length) {
      setLeaderBoard(prevLeaderBoard => ({
        ...prevLeaderBoard,
        [level]: topScores.map(({ name, score, create_time: date }, index) => {
          // 把 date 从 UTC 时间转换成当地时间
          date = date ? new Date(date + "Z").toLocaleString("zh").split(" ")[0] : null;
          return `${index + 1}. ${name} - ${score}秒 - ${date || "N/A"}`;
        })
      }));
    } else {
      setLeaderBoard(prevLeaderBoard => ({
        ...prevLeaderBoard,
        [level]: []
      }));
    }
    
    setLastUpdateTime(new Date().toLocaleString("zh"));
  }

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
      {/* <p>* 请注意，这个在线英雄榜功能只从 2024 年 1 月 14 日开始收集数据。</p> */}
      <p>从 2024 年 3 月 12 日开始，由于服务器迁移，在线英雄榜功能暂不可用。</p>
      {/* <div className="leaderboard">
        {Object.keys(leaderBoard).map((level) => (
          <div className="leaderboard-section" key={level}>
            <h3>{levelMap[level]}</h3>
            {leaderBoard[level] ? leaderBoard[level].length ? <ul>
              {leaderBoard[level].map((item, index) => (
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
        <button onClick={handleRefreshLeaderboard}>刷新</button>
      </p> */}
      <p>
        我的昵称：<span>{playerName}</span>
        <button onClick={
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