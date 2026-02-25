import QuoridorGame from './QuoridorGame.js';

class RoomManager {
    constructor() {
        this.rooms = new Map(); // code -> { game, timerDuration }
    }

    createRoom(timerDuration = 30) {
        const code = this.generateCode();
        const game = new QuoridorGame(code);
        this.rooms.set(code, { game, timerDuration });
        return code;
    }

    getGame(code) {
        const room = this.rooms.get(code);
        return room ? room.game : null;
    }

    getRoom(code) {
        return this.rooms.get(code) || null;
    }

    joinRoom(code, socketId) {
        const room = this.rooms.get(code);
        if (!room) return { error: 'Room not found' };

        const { game } = room;
        const playerIndex = game.addPlayer(socketId);
        if (playerIndex === -1) return { error: 'Room full' };

        return { playerIndex, game };
    }

    removeRoom(code) {
        this.rooms.delete(code);
    }

    generateCode() {
        let code;
        do {
            code = Math.random().toString(36).substring(2, 6).toUpperCase();
        } while (this.rooms.has(code));
        return code;
    }
}

export default new RoomManager();
