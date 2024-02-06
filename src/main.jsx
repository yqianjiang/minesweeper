import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import GameBoard from "./components/GameBoard/index.js";

GameBoard();

ReactDOM.createRoot(document.getElementById('leaderboard')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
