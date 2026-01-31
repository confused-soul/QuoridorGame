# Quoridor Online

A real-time multiplayer implementation of the classic board game Quoridor.

## Features
- **1v1 Online Multiplayer**: Play against friends in real-time.
- **Room System**: Create a private room and share the code to join.
- **Classic Rules**: Full implementation of movement, walls, and jumps.
- **Fair Play Enforcement**: Algorithms ensure a path to the goal always exists.
- **Responsive UI**: Built with React and CSS Grid.

## Tech Stack
- **Frontend**: React (Vite), Socket.io Client
- **Backend**: Node.js, Express, Socket.io Server

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone/Open the project**
   Ensure you are in the project root directory.

2. **Install Dependencies**
   ```bash
   # Install root/client dependencies
   npm install

   # Install server dependencies
   cd server
   npm install
   ```

### Running the Project

You need to run the **Backend** and **Frontend** in separate terminals.

**1. Start the Backend Server**
```bash
cd server
node index.js
# Or for development with auto-restart:
npx nodemon index.js
```
*Server runs on port 3001*

**2. Start the Frontend Client**
```bash
# In the project root
npm run dev
```
*Client runs on http://localhost:5173*

## How to Play

1. **Start**: Open the client URL.
2. **Lobby**:
   - **Player 1**: Click "Create New Game". Copy the 4-letter Room Code.
   - **Player 2**: Enter the Room Code and click "Join Game".
3. **The Goal**: Be the first pawn to reach the opposite side of the board (Row 9).
4. **On Your Turn**:
   - **Move**: Click an adjacent tile to move your pawn 1 space.
   - **Place Wall**: Click "Wall Horizontal" or "Wall Vertical", then click a gap between tiles. Walls are 2 units long.
5. **Rules**:
   - Walls cannot overlap.
   - **You cannot completely block** the opponent's path to their goal.
   - **Jump**: If pawns are face-to-face, you can jump over the opponent (or diagonally if blocked).

## License
MIT
