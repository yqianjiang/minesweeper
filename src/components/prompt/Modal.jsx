import React, { useEffect } from 'react';
import './style.css';

const Modal = ({ open, setOpen, title, content, onSubmit, onBeforeClose, onShow }) => {
  const closeModal = () => {
    setOpen(false);
  };

  const handleOnSubmit = () => {
    onSubmit();
    closeModal();
  };

  const handleClose = () => {
    onBeforeClose?.();
    closeModal();
  };

  useEffect(() => {
    if (open && onShow) {
      onShow();
    }
  }, [open]);

  return (
    <div 
      className="modal" 
      style={{
        display: open ? "block" : "none"
      }}
    >
      <div className="game-window modal-content">
        <span className="close" onClick={handleClose}>×</span>
        <h2 className="window-title-bar modal-title">{title}</h2>
        {typeof content === 'string' ? (
          <p>{content}</p>
        ) : (
          <div className="modal-content-container">{content}</div>
        )}
        <div className="modal-footer">
          {onSubmit && (
            <button id="submitBtn" onClick={handleOnSubmit}>确定</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
