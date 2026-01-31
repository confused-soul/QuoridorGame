import QuoridorGame from './QuoridorGame.js';

class RoomManager {
    constructor() {
        this.rooms = new Map(); // code -> QuoridorGame
    }

    createRoom() {
        const code = this.generateCode();
        const game = new QuoridorGame(code);
        this.rooms.set(code, game);
        return code;
    }

    getGame(code) {
        return this.rooms.get(code);
    }

    joinRoom(code, socketId) {
        const game = this.rooms.get(code);
        if (!game) return { error: 'Room not found' };

        const playerIndex = game.addPlayer(socketId);
        if (playerIndex === -1) return { error: 'Room full' };

        return { playerIndex, game };
    }

    removeRoom(code) {
        this.rooms.delete(code);
    }

    generateCode() {
        // Generate unique 4-letter code
        let code;
        do {
            code = Math.random().toString(36).substring(2, 6).toUpperCase();
        } while (this.rooms.has(code));
        return code;
    }
}

export default new RoomManager();
