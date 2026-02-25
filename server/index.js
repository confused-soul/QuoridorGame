import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import roomManager from "./game/RoomManager.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://onlinequoridorgame.onrender.com",
];

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    })
);

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3001;

// Per-room timer state: code -> { interval, remaining }
const roomTimers = new Map();

function clearRoomTimer(code) {
    if (roomTimers.has(code)) {
        clearInterval(roomTimers.get(code).interval);
        roomTimers.delete(code);
    }
}

function startRoomTimer(code) {
    clearRoomTimer(code);

    const room = roomManager.getRoom(code);
    if (!room) return;

    const { game, timerDuration } = room;
    let remaining = timerDuration;

    // Emit the initial tick immediately so both clients see the full count
    io.to(code).emit("timer_tick", { remaining });

    const interval = setInterval(() => {
        remaining -= 1;
        io.to(code).emit("timer_tick", { remaining });

        if (remaining <= 0) {
            clearRoomTimer(code);
            if (game.winner === null) {
                game.skipTurn();
                io.to(code).emit("game_update", game.getState());
                // Start the next turn's timer
                startRoomTimer(code);
            }
        }
    }, 1000);

    roomTimers.set(code, { interval, remaining });
}

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("create_room", ({ timerDuration } = {}, callback) => {
        const duration = [15, 30, 60].includes(timerDuration) ? timerDuration : 30;
        const code = roomManager.createRoom(duration);
        const result = roomManager.joinRoom(code, socket.id);

        socket.join(code);
        callback({ code, playerIndex: result.playerIndex });

        io.to(code).emit("game_update", result.game.getState());
    });

    socket.on("join_room", (code, callback) => {
        const result = roomManager.joinRoom(code, socket.id);

        if (result.error) return callback({ error: result.error });

        socket.join(code);
        callback({ code, playerIndex: result.playerIndex });

        io.to(code).emit("game_update", result.game.getState());

        // Both players are now in — start the timer
        const room = roomManager.getRoom(code);
        if (room && room.game.players[0].id && room.game.players[1].id) {
            startRoomTimer(code);
        }
    });

    socket.on("move", ({ code, x, y }) => {
        const game = roomManager.getGame(code);
        if (!game) return;

        const p0 = game.players[0];
        const p1 = game.players[1];
        let playerId = -1;

        if (p0?.id === socket.id) playerId = 0;
        else if (p1?.id === socket.id) playerId = 1;

        if (playerId !== -1) {
            if (game.movePlayer(playerId, x, y)) {
                clearRoomTimer(code);
                io.to(code).emit("game_update", game.getState());
                if (game.winner !== null) {
                    io.to(code).emit("game_over", { winner: playerId });
                } else {
                    startRoomTimer(code);
                }
            }
        }
    });

    socket.on("place_wall", ({ code, x, y, orientation }) => {
        const game = roomManager.getGame(code);
        if (!game) return;

        const p0 = game.players[0];
        const p1 = game.players[1];
        let playerId = -1;

        if (p0?.id === socket.id) playerId = 0;
        else if (p1?.id === socket.id) playerId = 1;

        if (playerId !== -1) {
            if (game.placeWall(playerId, x, y, orientation)) {
                clearRoomTimer(code);
                io.to(code).emit("game_update", game.getState());
                startRoomTimer(code);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});
