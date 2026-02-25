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
    const [copied, setCopied] = useState(false);

    const handleCreate = () => createRoom(timerDuration);

    const handleJoin = () => {
        if (joinCode.length > 0) {
            joinRoom(joinCode, (success) => {
                if (!success) alert('Failed to join room — check the code and try again.');
            });
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Game screen ──
    if (roomCode && gameState && playerIndex !== null) {
        return (
            <div className="app-wrapper">
                {winner !== null && (
                    <div className={`result-overlay ${winner === playerIndex ? 'victory' : 'defeat'}`}>
                        <div className="result-card">
                            <div className="result-emoji">{winner === playerIndex ? '🏆' : '💀'}</div>
                            <div className="result-text">{winner === playerIndex ? 'VICTORY!' : 'DEFEAT'}</div>
                            <button className="result-btn" onClick={() => window.location.reload()}>Play Again</button>
                        </div>
                    </div>
                )}
                <div className="copy-bar">
                    <button className="copy-btn" onClick={handleCopy}>
                        {copied ? '✅ Copied!' : '📋 Copy Room Code'}
                    </button>
                    <span className="player-chip p{playerIndex}">
                        You are <strong>{playerIndex === 0 ? '🔵 Player 1' : '🟠 Player 2'}</strong>
                    </span>
                </div>
                <GameBoard
                    gameState={gameState}
                    playerIndex={playerIndex}
                    timerSeconds={timerSeconds}
                    roomCode={roomCode}
                    onMove={movePawn}
                    onPlaceWall={placeWall}
                />
            </div>
        );
    }

    // Waiting for both players
    if (roomCode && playerIndex !== null) {
        return (
            <div className="app-wrapper lobby-wrapper">
                <div className="glow-orb orb-1" /><div className="glow-orb orb-2" />
                <div className="lobby-card">
                    <div className="waiting-icon">⏳</div>
                    <h2>Waiting for opponent…</h2>
                    <p className="waiting-sub">Share this code with your friend</p>
                    <div className="code-display">
                        <span className="code-text">{roomCode}</span>
                        <button className="inline-copy-btn" onClick={handleCopy}>
                            {copied ? '✅' : '📋'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Lobby screen ──
    return (
        <div className="app-wrapper lobby-wrapper">
            <div className="glow-orb orb-1" />
            <div className="glow-orb orb-2" />

            <div className="lobby-card">
                <div className="logo">
                    <span className="logo-icon">♟</span>
                    <h1 className="logo-title">Quoridor</h1>
                    <span className="logo-sub">ONLINE</span>
                </div>

                <div className="timer-section">
                    <p className="section-label">Turn Timer</p>
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

                <button className="primary-btn" onClick={handleCreate}>
                    ✦ Create New Game
                </button>

                <div className="divider"><span>OR</span></div>

                <div className="join-row">
                    <input
                        type="text"
                        placeholder="ROOM CODE"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="code-input"
                    />
                    <button className="join-btn" onClick={handleJoin}>Join</button>
                </div>

                {error && <div className="error-msg">{error}</div>}
            </div>
        </div>
    );
}

export default App;
