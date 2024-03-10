import React, { useEffect, useState } from "react";
import Modal from "./Modal";

// 英雄榜留名弹窗
const AskNameModal = ({open, setOpen, title, msg, onSubmit, defaultName="匿名"}) => {
  const [playerName, setPlayerName] = useState(defaultName);

  const handleOnSubmit = () => {
    onSubmit(playerName);
  };

  useEffect(() => {
    setPlayerName(defaultName);
  }, [defaultName]);

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title}
      content={
        <div>
          <p className="modal-msg">{msg}</p>
          <input
            type="text"
            className="player-name-input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
      }
      onSubmit={handleOnSubmit}
    />
  );
};

export default AskNameModal;
