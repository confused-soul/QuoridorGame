import { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
    const {
        gameState,
        roomCode,
        playerIndex,
        winner,
        error,
        createRoom,
        joinRoom,
        movePawn,
        placeWall
    } = useGameSocket();

    const [joinCode, setJoinCode] = useState('');

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

    if (roomCode && gameState) {
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
                    onMove={movePawn}
                    onPlaceWall={placeWall}
                />
            </div>
        );
    }

    return (
        <div className="lobby-container">
            <h1>Quoridor Online</h1>
            <div className="card">
                <button className="primary-btn" onClick={() => createRoom()}>Create New Game</button>
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
