class QuoridorGame {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.boardSize = 9;
        this.players = [
            { id: null, x: 4, y: 0, walls: 10, goalRow: 8 },
            { id: null, x: 4, y: 8, walls: 10, goalRow: 0 }
        ];
        this.walls = [];
        this.turn = 0; // 0 or 1
        this.winner = null;
    }

    addPlayer(socketId) {
        if (!this.players[0].id) {
            this.players[0].id = socketId;
            return 0;
        } else if (!this.players[1].id) {
            this.players[1].id = socketId;
            return 1;
        }
        return -1; // Full
    }

    isValidMove(playerId, x, y) {
        if (this.turn !== playerId) return false;
        if (this.winner !== null) return false;

        // Check bounds
        if (x < 0 || x >= this.boardSize || y < 0 || y >= this.boardSize) return false;

        const p = this.players[playerId];
        const opponent = this.players[1 - playerId];

        const dx = x - p.x;
        const dy = y - p.y;
        const dist = Math.abs(dx) + Math.abs(dy);

        // Basic move (1 step)
        if (dist === 1) {
            if (this.isBlocked(p.x, p.y, x, y)) return false;
            // Cannot move to opponent's square
            if (x === opponent.x && y === opponent.y) return false;
            return true;
        }

        // Jump Logic
        // If opponent is adjacent and in the way
        if (Math.abs(opponent.x - p.x) + Math.abs(opponent.y - p.y) === 1) {
            // Check if opponent is between us and target
            if (!this.isBlocked(p.x, p.y, opponent.x, opponent.y)) {
                // Straight jump
                if ((x === p.x + 2 * dx) || (y === p.y + 2 * dy)) {
                    if (x === opponent.x + (opponent.x - p.x) && y === opponent.y + (opponent.y - p.y)) {
                        // Verify no wall behind opponent
                        if (!this.isBlocked(opponent.x, opponent.y, x, y)) return true;
                    }
                }
                // Diagonal Jump
                const straightJumpX = opponent.x + (opponent.x - p.x);
                const straightJumpY = opponent.y + (opponent.y - p.y);

                const straightBlocked =
                    straightJumpX < 0 || straightJumpX >= this.boardSize ||
                    straightJumpY < 0 || straightJumpY >= this.boardSize ||
                    this.isBlocked(opponent.x, opponent.y, straightJumpX, straightJumpY);

                if (straightBlocked) {
                    if (Math.abs(x - opponent.x) + Math.abs(y - opponent.y) === 1) {
                        if (!this.isBlocked(opponent.x, opponent.y, x, y)) return true;
                    }
                }
            }
        }

        return false;
    }

    isBlocked(x1, y1, x2, y2) {
        for (let w of this.walls) {
            if (w.orientation === 'H') {
                if (y1 !== y2) {
                    const rowUp = Math.min(y1, y2);
                    if (w.y === rowUp && (w.x === x1 || w.x === x1 - 1)) {
                        if (x1 === x2) {
                            if (x1 === w.x || x1 === w.x + 1) return true;
                        }
                    }
                }
            } else {
                if (x1 !== x2) {
                    const colLeft = Math.min(x1, x2);
                    if (w.x === colLeft && (w.y === y1 || w.y === y1 - 1)) {
                        if (y1 === y2) {
                            if (y1 === w.y || y1 === w.y + 1) return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    isBlockedByWall(x1, y1, x2, y2) {
        const isH = (y1 !== y2);
        if (isH) {
            const r = Math.min(y1, y2);
            const c = x1;
            return this.walls.some(w => w.orientation === 'H' && w.y === r && (w.x === c || w.x === c - 1));
        } else {
            const c = Math.min(x1, x2);
            const r = y1;
            return this.walls.some(w => w.orientation === 'V' && w.x === c && (w.y === r || w.y === r - 1));
        }
    }

    isValidWall(x, y, orientation) {
        if (x < 0 || x >= this.boardSize - 1 || y < 0 || y >= this.boardSize - 1) return false;

        for (let w of this.walls) {
            if (w.x === x && w.y === y && w.orientation === orientation) return false;
            if (orientation === 'H' && w.orientation === 'H' && w.y === y && Math.abs(w.x - x) <= 1) return false;
            if (orientation === 'V' && w.orientation === 'V' && w.x === x && Math.abs(w.y - y) <= 1) return false;
            if (w.x === x && w.y === y && w.orientation !== orientation) return false;
        }
        return true;
    }

    canPlaceWall(playerId, x, y, orientation) {
        if (this.turn !== playerId) return false;
        if (this.players[playerId].walls <= 0) return false;
        if (!this.isValidWall(x, y, orientation)) return false;

        this.walls.push({ x, y, orientation });

        const p1Path = this.hasPath(0);
        const p2Path = this.hasPath(1);

        this.walls.pop();

        return p1Path && p2Path;
    }

    hasPath(playerId) {
        const p = this.players[playerId];
        const goalRow = p.goalRow;
        const visited = new Set();
        const queue = [{ x: p.x, y: p.y }];
        visited.add(`${p.x},${p.y}`);

        while (queue.length > 0) {
            const curr = queue.shift();
            if (curr.y === goalRow) return true;

            const neighbors = [
                { x: curr.x + 1, y: curr.y }, { x: curr.x - 1, y: curr.y },
                { x: curr.x, y: curr.y + 1 }, { x: curr.x, y: curr.y - 1 }
            ];

            for (let n of neighbors) {
                if (n.x >= 0 && n.x < 9 && n.y >= 0 && n.y < 9) {
                    const key = `${n.x},${n.y}`;
                    if (!visited.has(key)) {
                        if (!this.isBlockedByWall(curr.x, curr.y, n.x, n.y)) {
                            visited.add(key);
                            queue.push(n);
                        }
                    }
                }
            }
        }
        return false;
    }

    movePlayer(playerId, x, y) {
        if (this.isValidMove(playerId, x, y)) {
            this.players[playerId].x = x;
            this.players[playerId].y = y;
            if (y === this.players[playerId].goalRow) {
                this.winner = playerId;
            }
            this.turn = 1 - this.turn;
            return true;
        }
        return false;
    }

    placeWall(playerId, x, y, orientation) {
        if (this.canPlaceWall(playerId, x, y, orientation)) {
            this.walls.push({ x, y, orientation });
            this.players[playerId].walls--;
            this.turn = 1 - this.turn;
            return true;
        }
        return false;
    }

    getState() {
        return {
            players: this.players,
            walls: this.walls,
            turn: this.turn,
            winner: this.winner
        };
    }
}

export default QuoridorGame;
