import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const useGameSocket = () => {
    const socketRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [playerIndex, setPlayerIndex] = useState(null);
    const [winner, setWinner] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        socketRef.current = io(ENDPOINT);

        socketRef.current.on('game_update', (state) => {
            setGameState(state);
        });

        socketRef.current.on('game_over', ({ winner }) => {
            setWinner(winner);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const createRoom = (callback) => {
        socketRef.current.emit('create_room', (res) => {
            if (res.error) setError(res.error);
            else {
                setRoomCode(res.code);
                setPlayerIndex(res.playerIndex);
                if (callback) callback(res.code);
            }
        });
    };

    const joinRoom = (code, callback) => {
        socketRef.current.emit('join_room', code, (res) => {
            if (res.error) {
                setError(res.error);
                if (callback) callback(false);
            } else {
                setRoomCode(res.code);
                setPlayerIndex(res.playerIndex);
                if (callback) callback(true);
            }
        });
    };

    const movePawn = (x, y) => {
        if (roomCode) {
            socketRef.current.emit('move', { code: roomCode, x, y });
        }
    };

    const placeWall = (x, y, orientation) => {
        if (roomCode) {
            socketRef.current.emit('place_wall', { code: roomCode, x, y, orientation });
        }
    };

    return {
        socket: socketRef.current,
        gameState,
        roomCode,
        playerIndex,
        winner,
        error,
        createRoom,
        joinRoom,
        movePawn,
        placeWall
    };
};

