import React, { useState } from 'react';
import './GameBoard.css';

const GameBoard = ({ gameState, playerIndex, timerSeconds, roomCode, onMove, onPlaceWall }) => {
    const [mode, setMode] = useState('move');

    if (!gameState || playerIndex === null) {
        return <div className="loading">Waiting for opponent…</div>;
    }

    const { players, walls, turn } = gameState;
    const myTurn = turn === playerIndex;
    const isUrgent = timerSeconds !== null && timerSeconds <= 5;
    const timerDisplay = timerSeconds !== null ? timerSeconds : '--';

    const handleCellClick = (r, c) => {
        if (!myTurn) return;
        const isRowEven = r % 2 === 0;
        const isColEven = c % 2 === 0;

        if (isRowEven && isColEven) {
            if (mode === 'move') onMove(c / 2, r / 2);
        } else {
            if (mode === 'h-wall' && !isRowEven) {
                let x = Math.floor(c / 2);
                if (x >= 8) x = 7;
                onPlaceWall(x, (r - 1) / 2, 'H');
            } else if (mode === 'v-wall' && !isColEven) {
                let y = Math.floor(r / 2);
                if (y >= 8) y = 7;
                onPlaceWall((c - 1) / 2, y, 'V');
            }
        }
    };

    const renderCells = () => {
        const cells = [];
        for (let r = 0; r < 17; r++) {
            for (let c = 0; c < 17; c++) {
                const isRowEven = r % 2 === 0;
                const isColEven = c % 2 === 0;
                const tileX = Math.floor(c / 2);
                const tileY = Math.floor(r / 2);
                let className = 'cell';
                let content = null;

                if (isRowEven && isColEven) {
                    className += ' tile';
                    if (players[0].x === tileX && players[0].y === tileY)
                        content = <div className="player-pawn p0" title="Player 1" />;
                    if (players[1].x === tileX && players[1].y === tileY)
                        content = <div className="player-pawn p1" title="Player 2" />;
                } else if (!isRowEven && isColEven) {
                    className += ' h-gap';
                } else if (isRowEven && !isColEven) {
                    className += ' v-gap';
                } else {
                    className += ' corner-gap';
                }

                cells.push(
                    <div
                        key={`${r}-${c}`}
                        className={className}
                        onClick={() => handleCellClick(r, c)}
                        style={{ gridColumn: c + 1, gridRow: r + 1 }}
                    >
                        {content}
                    </div>
                );
            }
        }
        return cells;
    };

    const renderWalls = () => walls.map((w, i) => {
        const style = w.orientation === 'H'
            ? { gridRow: (2 * w.y) + 2, gridColumn: `${(2 * w.x) + 1} / span 3` }
            : { gridColumn: (2 * w.x) + 2, gridRow: `${(2 * w.y) + 1} / span 3` };
        return <div key={`w-${i}`} className="wall" style={style} />;
    });

    return (
        <div className="game-container">

            {/* ── TOP BAR ── */}
            <div className="top-bar">
                <div className="room-badge">
                    <span className="room-label">ROOM</span>
                    <span className="room-code">{roomCode}</span>
                </div>

                <div className={`timer-ring ${isUrgent ? 'urgent' : ''}`}>
                    <svg viewBox="0 0 44 44" className="timer-svg">
                        <circle cx="22" cy="22" r="18" className="timer-track" />
                    </svg>
                    <span className="timer-number">{timerDisplay}</span>
                </div>

                <div className={`turn-badge ${myTurn ? 'my-turn' : 'opp-turn'}`}>
                    <span className="turn-dot" />
                    <span>{myTurn ? 'YOUR TURN' : "OPP TURN"}</span>
                </div>
            </div>

            {/* ── BOARD ── */}
            <div className="board">
                {renderCells()}
                {renderWalls()}
            </div>

            {/* ── BOTTOM CONTROLS ── */}
            <div className="bottom-controls">
                <div className="mode-group">
                    <button
                        className={`mode-btn ${mode === 'move' ? 'active move-active' : ''}`}
                        onClick={() => setMode('move')}
                    >
                        <span className="mode-icon">🚶</span>
                        <span>Move</span>
                    </button>
                    <button
                        className={`mode-btn ${mode === 'h-wall' ? 'active wall-active' : ''}`}
                        onClick={() => setMode('h-wall')}
                    >
                        <span className="mode-icon">━</span>
                        <span>H-Wall</span>
                    </button>
                    <button
                        className={`mode-btn ${mode === 'v-wall' ? 'active wall-active' : ''}`}
                        onClick={() => setMode('v-wall')}
                    >
                        <span className="mode-icon">┃</span>
                        <span>V-Wall</span>
                    </button>
                </div>

                <div className="walls-counter">
                    <div className="walls-pips">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <span
                                key={i}
                                className={`pip ${i < players[playerIndex]?.walls ? 'pip-on' : 'pip-off'}`}
                            />
                        ))}
                    </div>
                    <span className="walls-label">{players[playerIndex]?.walls} walls left</span>
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
