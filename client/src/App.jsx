import { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import GameBoard from './components/GameBoard';
import './App.css';

const TIMER_OPTIONS = [
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '1 min', value: 60 },
];

function App() {
    const {
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
    } = useGameSocket();

    const [joinCode, setJoinCode] = useState('');
    const [timerDuration, setTimerDuration] = useState(30);

    const handleCreate = () => {
        createRoom(timerDuration);
    };

    const handleJoin = () => {
        if (joinCode.length > 0) {
            joinRoom(joinCode, (success) => {
                if (!success) alert('Failed to join room');
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        alert('Room code copied!');
    };

    // Only render the game board once we have both gameState AND playerIndex confirmed
    if (roomCode && gameState && playerIndex !== null) {
        return (
            <div className="app-container">
                <header className="game-header">
                    <h1>Room: {roomCode}</h1>
                    <button className="copy-btn" onClick={handleCopy}>Copy Code</button>
                    {winner !== null && (
                        <div className="winner-banner">
                            {winner === playerIndex ? 'VICTORY!' : 'DEFEAT'}
                        </div>
                    )}
                </header>
                {error && <div className="error">{error}</div>}
                <GameBoard
                    gameState={gameState}
                    playerIndex={playerIndex}
                    timerSeconds={timerSeconds}
                    onMove={movePawn}
                    onPlaceWall={placeWall}
                />
            </div>
        );
    }

    // Show a waiting screen if we've joined/created a room but playerIndex isn't set yet
    if (roomCode && gameState && playerIndex === null) {
        return (
            <div className="lobby-container">
                <h1>Quoridor Online</h1>
                <div className="card">
                    <p>Connecting to room <strong>{roomCode}</strong>…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lobby-container">
            <h1>Quoridor Online</h1>
            <div className="card">
                <div className="timer-select">
                    <p className="timer-label">Choose Turn Timer:</p>
                    <div className="timer-options">
                        {TIMER_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                className={`timer-btn ${timerDuration === opt.value ? 'active' : ''}`}
                                onClick={() => setTimerDuration(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="primary-btn" onClick={handleCreate}>Create New Game</button>
                <div className="divider">OR</div>
                <div className="join-form">
                    <input
                        type="text"
                        placeholder="Enter Room Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={4}
                    />
                    <button className="secondary-btn" onClick={handleJoin}>Join Game</button>
                </div>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
}

export default App;
