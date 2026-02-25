import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const ENDPOINT = 'http://localhost:3001';

export const useGameSocket = () => {
    const socketRef = useRef(null);
    const [gameState, setGameState] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    // Use a ref to keep playerIndex in sync immediately (avoids stale closure
    // race condition where gameState updates before playerIndex state is set).
    const playerIndexRef = useRef(null);
    const [playerIndex, setPlayerIndex] = useState(null);
    const [winner, setWinner] = useState(null);
    const [error, setError] = useState(null);
    const [timerSeconds, setTimerSeconds] = useState(null);

    useEffect(() => {
        socketRef.current = io(ENDPOINT);

        socketRef.current.on('game_update', (state) => {
            setGameState(state);
        });

        socketRef.current.on('game_over', ({ winner }) => {
            setWinner(winner);
        });

        socketRef.current.on('timer_tick', ({ remaining }) => {
            setTimerSeconds(remaining);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    const createRoom = (timerDuration, callback) => {
        socketRef.current.emit('create_room', { timerDuration }, (res) => {
            if (res.error) {
                setError(res.error);
            } else {
                playerIndexRef.current = res.playerIndex;
                setPlayerIndex(res.playerIndex);
                setRoomCode(res.code);
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
                playerIndexRef.current = res.playerIndex;
                setPlayerIndex(res.playerIndex);
                setRoomCode(res.code);
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
        timerSeconds,
        createRoom,
        joinRoom,
        movePawn,
        placeWall
    };
};
