import React, { useState } from 'react';
import './GameBoard.css';

const GameBoard = ({ gameState, playerIndex, onMove, onPlaceWall }) => {
    const [mode, setMode] = useState('move'); // 'move', 'h-wall', 'v-wall'
    const [hover, setHover] = useState(null); // {x, y}

    if (!gameState) return <div className="loading">Waiting for game state...</div>;

    const { players, walls, turn } = gameState;
    const myTurn = turn === playerIndex;

    // Helper to check if a wall exists at specific grid coords
    const isWallAt = (r, c) => {
        // Not straightforward, we render walls as overlay or fill
        // Better to iterate walls and render them
        return false;
    };

    const handleCellClick = (r, c) => {
        if (!myTurn) return;

        // Determine if r,c is a Tile or Gap
        const isRowEven = r % 2 === 0;
        const isColEven = c % 2 === 0;

        // Tile: r even, c even
        // H-Gap: r odd, c even
        // V-Gap: r even, c odd
        // Corner: r odd, c odd

        if (isRowEven && isColEven) {
            // Tile -> Move
            const x = c / 2;
            const y = r / 2;
            if (mode === 'move') {
                onMove(x, y);
            }
        } else {
            // Gap -> Wall
            // We need to map clicked gap to Wall Coordinates (x,y)
            // Wall Logic:
            // H-Wall at (x,y) is BELOW Row y. Spans Col x, x+1.
            // V-Wall at (x,y) is RIGHT of Col x. Spans Row y, y+1.

            if (mode === 'h-wall' && !isRowEven) {
                // Clicked a horizontal gap row
                // Row index r corresponding to gap below Tile Row (r-1)/2
                const y = (r - 1) / 2;
                // Col index c. If c is even (Tile col), then x = c/2.
                // This gap is directly below Tile(x,y).
                // So it starts the wall at x.
                // If c is odd (Corner), maybe snap to left?
                // Let's assume user clicks ANY part of the gap area.
                let x = Math.floor(c / 2);
                // Ensure x is within bounds (0..7)
                if (x >= 8) x = 7;
                onPlaceWall(x, y, 'H');
            }
            else if (mode === 'v-wall' && !isColEven) {
                // Clicked a vertical gap col
                // Col index c corresponds to gap right of Tile Col (c-1)/2
                const x = (c - 1) / 2;
                // Row index r.
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
        // 17x17 grid
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
                    // Check Player
                    if (players[0].x === tileX && players[0].y === tileY) {
                        content = <div className="player-pawn p0" title="Player 1" />;
                    }
                    if (players[1].x === tileX && players[1].y === tileY) {
                        content = <div className="player-pawn p1" title="Player 2" />;
                    }
                    // Highlight valid moves? (Optional, requires logic duplication or server hint)
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
                // Row: 2*y + 2 (The gap row)
                // Col: 2*x + 1 (Start of tile x) -> Span 3 (Tile x, Gap, Tile x+1)
                // Actually my gap logic above:
                // H-Wall fills Gap(x,y) + Corner(x,y) + Gap(x+1,y)
                // Gap(x,y) is at r=2y+1, c=2x+1? No.
                // Gap row is r=2y+1 (0-indexed).
                // Col starts at 2x. (0-indexed).
                // Let's re-verify grid indices.
                // Grid is 1-indexed for CSS.
                // Row 1 (Tile 0), Row 2 (Gap 0), Row 3 (Tile 1)...
                // Gap Row index = (2 * w.y) + 2.
                // Col Start = (2 * w.x) + 1. 
                // Span 3 (Tile col + Gap col + Tile col).
                // Width of wall is 2 tiles + 1 gap.
                // CSS: grid-column: start / span 3.
                style = {
                    gridRow: (2 * w.y) + 2,
                    gridColumn: `${(2 * w.x) + 1} / span 3`
                };
            } else {
                // V-Wall
                // Col: 2*x + 2 (The gap col)
                // Row: 2*y + 1 (Start of tile y)
                // Span 3 rows.
                style = {
                    gridColumn: (2 * w.x) + 2,
                    gridRow: `${(2 * w.y) + 1} / span 3`
                };
            }
            return <div key={`w-${i}`} className="wall" style={style} />;
        });
    };

    return (
        <div className="game-container">
            <div className="controls">
                <button className={`btn ${mode === 'move' ? 'active' : ''}`} onClick={() => setMode('move')}>Move</button>
                <button className={`btn ${mode === 'h-wall' ? 'active' : ''}`} onClick={() => setMode('h-wall')}>Wall Horizontal</button>
                <button className={`btn ${mode === 'v-wall' ? 'active' : ''}`} onClick={() => setMode('v-wall')}>Wall Vertical</button>
                <div>Walls Left: {players[playerIndex]?.walls}</div>
                <div style={{ color: myTurn ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                    {myTurn ? "YOUR TURN" : "OPPONENT'S TURN"}
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
