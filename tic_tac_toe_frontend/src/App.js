import React, { useState, useEffect } from "react";
import "./App.css";

// Color/Theme Constants
const COLORS = {
  accent: "#ff5722",
  primary: "#008080",
  secondary: "#f5f5f5",
};

/**
 * PUBLIC_INTERFACE
 * Represents a single Tic Tac Toe cell (button).
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className={`ttt-square${highlight ? " highlight" : ""}`}
      onClick={onClick}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
      tabIndex={0}
    >
      {value}
    </button>
  );
}

/**
 * PUBLIC_INTERFACE
 * Main game board with 3x3 squares.
 */
function Board({ squares, onSquareClick, winningLine, disabled }) {
  return (
    <div className="ttt-board" role="grid" aria-label="Tic tac toe board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row} role="row">
          {[0, 1, 2].map((col) => {
            const idx = row * 3 + col;
            const isHighlight = winningLine && winningLine.includes(idx);
            return (
              <Square
                key={idx}
                value={squares[idx]}
                highlight={isHighlight}
                onClick={() => !disabled && onSquareClick(idx)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * List of previous games with win/draw result.
 */
function GameHistory({ history }) {
  return (
    <div className="side-history">
      <h3>Game History</h3>
      {history.length === 0 && (
        <div className="side-history-empty">No past games yet.</div>
      )}
      <ul>
        {history.map((item, idx) => (
          <li key={idx}>
            <span className={`result-badge result-${item.result}`}>
              {item.result === "draw"
                ? "Draw"
                : item.result === "X"
                ? "X wins"
                : "O wins"}
            </span>
            <span className="history-vs">
              {item.mode === "AI"
                ? " (vs AI)"
                : " (PvP)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Score display and controls in side panel.
 */
function SidePanel({
  scores,
  opponentMode,
  onModeChange,
  onRestart,
  currentTurn,
}) {
  return (
    <div className="side-panel">
      <h2 className="side-title">Tic Tac Toe</h2>
      <div className="score-group">
        <div className="score-label">
          X: <span className="side-score-x">{scores.X}</span>
        </div>
        <div className="score-label">
          O: <span className="side-score-o">{scores.O}</span>
        </div>
      </div>
      <div className="turn-indicator">
        Turn:{" "}
        <span className="current-turn-badge">
          {currentTurn === "X" ? "X" : "O"}
        </span>
      </div>
      <div className="mode-group">
        <label className="mode-label">Opponent:</label>
        <select
          className="mode-select"
          value={opponentMode}
          onChange={onModeChange}
        >
          <option value="PVP">Player vs Player</option>
          <option value="AI">Player vs AI</option>
        </select>
      </div>
      <button className="restart-btn" onClick={onRestart}>
        Restart Game
      </button>
    </div>
  );
}

/**
 * AI Algorithm: simple random or win-block-first AI.
 */
function computerMove(squares, aiLetter, playerLetter) {
  // Win if possible
  for (let idx = 0; idx < 9; idx++) {
    if (!squares[idx]) {
      const copy = squares.slice();
      copy[idx] = aiLetter;
      if (calculateWinner(copy).winner === aiLetter) return idx;
    }
  }
  // Block player win if possible
  for (let idx = 0; idx < 9; idx++) {
    if (!squares[idx]) {
      const copy = squares.slice();
      copy[idx] = playerLetter;
      if (calculateWinner(copy).winner === playerLetter) return idx;
    }
  }
  // Take center if available
  if (!squares[4]) return 4;
  // Take any corner
  const corners = [0, 2, 6, 8].filter((i) => !squares[i]);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  // Fallback: pick any available
  const empties = squares
    .map((v, i) => (v ? null : i))
    .filter((v) => v !== null);
  const idx = empties[Math.floor(Math.random() * empties.length)];
  return idx;
}

/**
 * PUBLIC_INTERFACE
 * Return {winner: "X"/"O"/null, line: [indexes]/null, draw: bool}
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6], // diags
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return { winner: squares[a], line, draw: false };
    }
  }
  if (squares.every((x) => x)) {
    return { winner: null, line: null, draw: true };
  }
  return { winner: null, line: null, draw: false };
}

/**
 * PUBLIC_INTERFACE
 * Main App for Tic Tac Toe Game.
 *
 * Features:
 * - Player vs Player/AI selection
 * - Score tracking
 * - Game history
 * - Responsive design
 * - Modern light style
 */
function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [opponent, setOpponent] = useState("PVP");
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [history, setHistory] = useState([]);
  const [gameDone, setGameDone] = useState(false);
  const [aiThinking, setAIThinking] = useState(false);

  // Winner and Highlight
  const { winner, line: winningLine, draw } = calculateWinner(squares);

  // On game end, log outcome and update scores
  useEffect(() => {
    if ((winner || draw) && !gameDone) {
      setGameDone(true);
      if (winner) {
        setScores((s) => ({
          ...s,
          [winner]: s[winner] + 1,
        }));
      }
      setHistory((h) => [
        { result: winner ? winner : "draw", mode: opponent },
        ...h.slice(0, 14), // Keep 15 max
      ]);
    }
  }, [winner, draw, gameDone, setGameDone, opponent]);

  // AI move effect
  useEffect(() => {
    if (
      opponent === "AI" &&
      !gameDone &&
      !winner &&
      !draw &&
      !aiThinking &&
      !xIsNext
    ) {
      setAIThinking(true);
      // Simulate delay for realism
      setTimeout(() => {
        const idx = computerMove(squares, "O", "X");
        if (idx !== undefined && squares[idx] === null) {
          const newSquares = squares.slice();
          newSquares[idx] = "O";
          setSquares(newSquares);
          setXIsNext(true);
        }
        setAIThinking(false);
      }, 450);
    }
  }, [
    xIsNext,
    opponent,
    squares,
    winner,
    draw,
    gameDone,
    aiThinking,
    setXIsNext,
    setAIThinking,
  ]);

  // PUBLIC_INTERFACE
  const handleSquareClick = (idx) => {
    if (squares[idx] || winner || draw || (opponent === "AI" && !xIsNext))
      return;
    const nextSquares = squares.slice();
    nextSquares[idx] = xIsNext ? "X" : "O";
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameDone(false);
  };

  // PUBLIC_INTERFACE
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setOpponent(newMode);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setGameDone(false);
  };

  // Responsive: mobile or desktop layout
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 800
  );
  useEffect(() => {
    const resize = () => setIsMobile(window.innerWidth <= 800);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Turn status text
  let status = "";
  if (winner) status = `Winner: ${winner}`;
  else if (draw) status = "Draw game";
  else if (opponent === "AI" && !xIsNext)
    status = "AI's Turn (O)...";
  else status = `Next player: ${xIsNext ? "X" : "O"}`;

  return (
    <div
      className="tic-tac-app-root"
      style={{
        background: COLORS.secondary,
        minHeight: "100vh",
      }}
    >
      <div
        className={`tic-tac-layout${isMobile ? " mobile" : ""}`}
      >
        {/* Side Panel */}
        <SidePanel
          scores={scores}
          opponentMode={opponent}
          onModeChange={handleModeChange}
          onRestart={handleRestart}
          currentTurn={xIsNext ? "X" : "O"}
        />
        {/* Main Board */}
        <main className="main-content">
          <div className="game-board-area">
            <Board
              squares={squares}
              onSquareClick={handleSquareClick}
              winningLine={winningLine}
              disabled={!!winner || !!draw || (opponent === "AI" && !xIsNext)}
            />
            <div className="status-text">{status}</div>
          </div>
        </main>
        {/* History Panel (side or under board) */}
        <aside className="history-area">
          <GameHistory history={history} />
        </aside>
      </div>
      <footer className="ttt-footer">
        <span>
          Tic Tac Toe &copy; {new Date().getFullYear()} &mdash; Modern UI
        </span>
      </footer>
    </div>
  );
}

export default App;
