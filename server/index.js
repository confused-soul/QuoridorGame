import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import roomManager from "./game/RoomManager.js";

const app = express();

/**
 * ✅ Allow requests from your frontend
 * Add your frontend URL after deployment (Render Static Site URL)
 */
const allowedOrigins = [
    "http://localhost:5173",
    "https://onlinequoridorgame.onrender.com", // <-- change this after frontend deploy
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

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("create_room", (callback) => {
        const code = roomManager.createRoom();
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
                io.to(code).emit("game_update", game.getState());
                if (game.winner !== null) {
                    io.to(code).emit("game_over", { winner: playerId });
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
                io.to(code).emit("game_update", game.getState());
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

