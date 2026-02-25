import React, { useState } from 'react';
import './GameBoard.css';

const GameBoard = ({ gameState, playerIndex, timerSeconds, onMove, onPlaceWall }) => {
    const [mode, setMode] = useState('move'); // 'move', 'h-wall', 'v-wall'
    const [hover, setHover] = useState(null); // {r, c}

    // Guard: don't render until playerIndex is confirmed — prevents turn display glitch
    if (!gameState || playerIndex === null) {
        return <div className="loading">Waiting for game state…</div>;
    }

    const { players, walls, turn } = gameState;
    const myTurn = turn === playerIndex;

    const handleCellClick = (r, c) => {
        if (!myTurn) return;

        const isRowEven = r % 2 === 0;
        const isColEven = c % 2 === 0;

        if (isRowEven && isColEven) {
            const x = c / 2;
            const y = r / 2;
            if (mode === 'move') {
                onMove(x, y);
            }
        } else {
            if (mode === 'h-wall' && !isRowEven) {
                const y = (r - 1) / 2;
                let x = Math.floor(c / 2);
                if (x >= 8) x = 7;
                onPlaceWall(x, y, 'H');
            }
            else if (mode === 'v-wall' && !isColEven) {
                const x = (c - 1) / 2;
                let y = Math.floor(r / 2);
                if (y >= 8) y = 7;
                onPlaceWall(x, y, 'V');
            }
        }
    };

    const handleMouseEnter = (r, c) => {
        setHover({ r, c });
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
                    if (players[0].x === tileX && players[0].y === tileY) {
                        content = <div className="player-pawn p0" title="Player 1" />;
                    }
                    if (players[1].x === tileX && players[1].y === tileY) {
                        content = <div className="player-pawn p1" title="Player 2" />;
                    }
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
                        onMouseEnter={() => handleMouseEnter(r, c)}
                        style={{ gridColumn: c + 1, gridRow: r + 1 }}
                    >
                        {content}
                    </div>
                );
            }
        }
        return cells;
    };

    const renderWalls = () => {
        return walls.map((w, i) => {
            let style = {};
            if (w.orientation === 'H') {
                style = {
                    gridRow: (2 * w.y) + 2,
                    gridColumn: `${(2 * w.x) + 1} / span 3`
                };
            } else {
                style = {
                    gridColumn: (2 * w.x) + 2,
                    gridRow: `${(2 * w.y) + 1} / span 3`
                };
            }
            return <div key={`w-${i}`} className="wall" style={style} />;
        });
    };

    // Timer display helpers
    const isUrgent = timerSeconds !== null && timerSeconds <= 5;
    const timerDisplay = timerSeconds !== null ? timerSeconds : '--';

    return (
        <div className="game-container">
            <div className="controls">
                <div className="controls-left">
                    <button className={`btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}>Move</button>
                    <button className={`btn ${mode === 'h-wall' ? 'active' : ''}`} onClick={() => setMode('h-wall')}>Wall ↔</button>
                    <button className={`btn ${mode === 'v-wall' ? 'active' : ''}`} onClick={() => setMode('v-wall')}>Wall ↕</button>
                    <div className="walls-left">🧱 {players[playerIndex]?.walls} walls</div>
                </div>
                <div className="controls-right">
                    <div className={`timer-display ${isUrgent ? 'urgent' : ''}`}>
                        ⏱ {timerDisplay}s
                    </div>
                    <div className={`turn-indicator ${myTurn ? 'my-turn' : 'opp-turn'}`}>
                        {myTurn ? '✅ YOUR TURN' : "⏳ OPPONENT'S TURN"}
                    </div>
                </div>
            </div>
            <div className="board">
                {renderCells()}
                {renderWalls()}
            </div>
        </div>
    );
};

export default GameBoard;
