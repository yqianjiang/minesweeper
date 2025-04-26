import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import GameBoard from "./components/game/GameBoard/index.js";

GameBoard();

ReactDOM.createRoot(document.getElementById('leaderboard')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
