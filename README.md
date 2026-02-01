<div align="center">

# ✨ NUMMAZE ✨

### *Ultimate Tic-Tac-Toe Multiplayer Gaming Platform*

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=2000&color=A855F7&center=true&vCenter=true&width=940&lines=Welcome+to+NUMMAZE!;Play+Ultimate+Tic-Tac-Toe;Challenge+Friends+Worldwide;Master+Mini-Games;Climb+the+Leaderboard!" alt="Typing SVG" />

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

### 🎮 *A fusion of strategy, speed, and skill*

</div>

## 🌟 About NUMMAZE

NUMMAZE is an immersive multiplayer gaming platform featuring **Ultimate Tic-Tac-Toe** as the main attraction, enhanced with exciting mini-games that players must master to gain tactical advantages. Built with modern web technologies and real-time communication, NUMMAZE delivers a seamless, competitive gaming experience.

```
┌─────────────────────────────────────────────────────┐
│  ╔═╗ ╦ ╦ ╔═╗ ╦═╗ ╔═╗ ╔╦╗ ╔═╗ ╦═╗ ╦ ╔═╗   ╔═╗ ╔═╗  │
│  ╚═╗ ║ ║ ╠═╝ ║╣  ╠╦╝ ║║║ ╠═╣ ╔╩╦╝ ║ ║     ║ ║ ╚═╗  │
│  ╚═╝ ╚═╝ ╩   ╚═╝ ╩╚═ ╩ ╩ ╩ ╩ ╩ ╚═ ╩═╝   ╚═╝ ╚═╝  │
│                                                     │
│          Ultimate Tic-Tac-Toe × Mini-Games          │
└─────────────────────────────────────────────────────┘
```

## ✨ Features

### 🎯 Core Gameplay
- **Ultimate Tic-Tac-Toe**: 9 mini-boards form one mega-board - win 3 mini-boards in a row to dominate!
- **Real-time Multiplayer**: Challenge players worldwide with Socket.io-powered instant communication
- **Smart Matchmaking**: Create private rooms or join public lobbies
- **Live Chat**: Strategize, taunt, or congratulate opponents in real-time
- **Spectator Mode**: Watch epic battles unfold (coming soon)

### 🎲 Mini-Games Arsenal
Battle in diverse mini-games to unlock power-ups and hazards:

| Game | Description | Skill Type |
|------|-------------|------------|
| 🐦 **Flappy Bird** | Navigate pipes, test your reflexes | Precision & Timing |
| 🏓 **Pong** | Classic paddle action with AI opponent | Hand-eye Coordination |
| 🐍 **Snake** | Grow your snake, avoid yourself | Strategic Planning |
| 🧠 **Memory Match** | Find matching pairs quickly | Focus & Memory |
| 🎴 **Anime Quiz** | Test your anime knowledge (powered by Gemini AI) | Trivia Mastery |

### 🎨 Visual Excellence
- **Anime-Inspired Design**: Vibrant colors, smooth animations, particle effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Touch Controls**: Mobile-friendly gameplay with intuitive touch inputs
- **Dark Theme**: Easy on the eyes during long gaming sessions

### 🏆 Progression System
- **User Profiles**: Track your journey and showcase achievements
- **Leaderboards**: Climb the ranks - compare scores globally
- **Points System**: Earn points across all games
- **Auto-Save**: Scores automatically persist to your profile
- **Statistics Dashboard**: Analyze your performance per game

### 🛡️ Technical Features
- **JWT Authentication**: Secure user sessions
- **MongoDB Database**: Persistent game history and user data
- **Real-time Updates**: Instant score synchronization
- **Optimized Performance**: 60 FPS gameplay with requestAnimationFrame
- **RESTful API**: Clean, maintainable backend architecture

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 16.x
MongoDB >= 5.x
npm or yarn
Git
```

### 📦 Installation

1. **Clone the Repository**
```bash
git clone https://github.com/ZYTRONA/NUMMAZE.git
cd NUMMAZE
```

2. **Server Setup**
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# MONGODB_URI=mongodb://localhost:27017/nummaze
# JWT_SECRET=your_secret_key_here
# PORT=5000
# GEMINI_API_KEY=your_gemini_api_key (for Anime Quiz)
```

3. **Client Setup**
```bash
cd ../client
npm install
```

### 🎬 Running the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
# Client runs on http://localhost:3000
```

### 🌐 Access the Game
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🎮 How to Play

### Getting Started
1. **Register/Login** - Create your account or sign in
2. **Choose Your Mode** - Solo mini-games or multiplayer battles
3. **Create/Join Room** - Start a private match or join the lobby
4. **Master Mini-Games** - Win games to unlock tactical advantages
5. **Dominate the Board** - Strategic ultimate tic-tac-toe gameplay

### Ultimate Tic-Tac-Toe Rules
```
┌───────┬───────┬───────┐
│ X O X │ O X O │ X O X │  Each cell is a mini board
│ O X O │ X O X │ O X O │  Win a mini-board to claim it
│ X O X │ O X O │ X O X │  Win 3 mini-boards in a row
├───────┼───────┼───────┤  Your move sends opponent
│ O X O │ X O X │ O X O │  to corresponding mini-board
│ X O X │ O X O │ X O X │  Strategic depth x9!
│ O X O │ X O X │ O X O │
├───────┼───────┼───────┤
│ X O X │ O X O │ X O X │
│ O X O │ X O X │ O X O │
│ X O X │ O X O │ X O X │
└───────┴───────┴───────┘
```

### Special Mechanics
- **Ghost Mode**: Temporary invincibility on the board
- **Hazards**: Block opponent's cells strategically
- **Power-ups**: Earned through mini-game victories
- **Turn Timer**: Keep the pace intense

---

## 🛠️ Tech Stack

### Frontend
```javascript
{
  "framework": "React 18",
  "routing": "React Router v6",
  "styling": "TailwindCSS",
  "realtime": "Socket.io-client",
  "http": "Axios",
  "state": "React Context API",
  "canvas": "HTML5 Canvas (Pong, Flappy)",
  "animations": "CSS3 + React Spring"
}
```

### Backend
```javascript
{
  "runtime": "Node.js",
  "framework": "Express.js",
  "database": "MongoDB + Mongoose",
  "realtime": "Socket.io",
  "authentication": "JWT + bcrypt",
  "ai": "Google Gemini Pro API",
  "validation": "Express Validator",
  "cors": "CORS middleware"
}
```

### Architecture
```
┌─────────────────────────────────────────────┐
│              React Client                   │
│  (Components, Context, Hooks, Services)     │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┴───────────────┐
    │                              │
    │  HTTP (REST API)      WebSocket (Socket.io)
    │                              │
┌───┴──────────────────────────────┴───────────┐
│          Express Server                      │
│  Routes → Controllers → Services → Models    │
├──────────────────────────────────────────────┤
│           MongoDB Database                   │
│   Users | Games | GameHistory                │
└──────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
NUMMAZE/
├── client/                      # React Frontend
│   ├── public/
│   │   └── index.html          # HTML entry point
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/           # Login, Register
│   │   │   ├── Board/          # Tic-Tac-Toe grid components
│   │   │   ├── Game/           # Game room, lobby
│   │   │   ├── Games/          # All mini-games
│   │   │   ├── Effects/        # Particle effects
│   │   │   ├── Leaderboard/    # Rankings
│   │   │   ├── Multiplayer/    # Lobby systems
│   │   │   ├── Social/         # User profiles
│   │   │   └── Tutorial/       # Interactive guides
│   │   ├── contexts/           # React Context
│   │   ├── hooks/              # Custom hooks (useScoreSaver)
│   │   ├── services/           # API & Socket services
│   │   ├── App.jsx             # Main app component
│   │   └── index.js            # React entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                      # Node.js Backend
│   ├── src/
│   │   ├── config/             # Database & Socket config
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routes
│   │   ├── services/           # Game logic, AI
│   │   ├── socket/             # Socket.io handlers
│   │   └── server.js           # Express app
│   ├── .env.example
│   └── package.json
│
└── README.md                    # You are here!
```

---

## 🎨 Game Screenshots

<div align="center">

### 🏠 Main Menu & Lobby
*Beautiful anime-themed interface with particle effects*

### 🎯 Ultimate Tic-Tac-Toe
*9 mini-boards form the ultimate challenge*

### 🎮 Mini-Games Collection
*Flappy Bird | Pong | Snake | Memory | Quiz*

### 📊 Leaderboards & Profiles
*Track your progress and compete globally*

</div>

---

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/nummaze

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server
PORT=5000
NODE_ENV=development

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# CORS
CLIENT_URL=http://localhost:3000
```

**Client**
Update API URLs in `src/services/` if needed:
```javascript
const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
```

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register       # Create new account
POST   /api/auth/login          # User login
GET    /api/auth/me             # Get current user
```

### User Management
```
GET    /api/users/profile/:id   # Get user profile
PUT    /api/users/profile       # Update profile
POST   /api/users/update-game-points  # Save game scores
```

### Game Management
```
POST   /api/games/create        # Create new game
GET    /api/games/:id           # Get game details
PUT    /api/games/:id/move      # Make a move
GET    /api/games/history       # Game history
```

### Quiz System
```
POST   /api/quiz/generate       # Get AI-generated quiz
POST   /api/quiz/validate       # Validate answer
```

---

## 🎮 Controls

### Desktop
- **Mouse**: Click/drag for most interactions
- **Keyboard**: 
  - Pong: `W`/`S` for up/down
  - Snake: Arrow keys
  - Flappy: `Space` to jump

### Mobile
- **Touch Controls**: Optimized tap targets (min 44px)
- **Swipe Gestures**: Supported where applicable
- **On-screen Buttons**: For Pong and Flappy Bird

---

## 🌟 Roadmap

- [ ] AI Opponent for Ultimate Tic-Tac-Toe
- [ ] Tournament System with brackets
- [ ] More Mini-Games (Tetris, Minesweeper, Sudoku)
- [ ] Achievement System with badges
- [ ] Friend System & Invites
- [ ] Replay System for matches
- [ ] Customizable Themes & Avatars
- [ ] Voice Chat Integration
- [ ] Mobile Native Apps (React Native)
- [ ] Twitch Integration for streaming

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed
- Keep mobile responsiveness in mind

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser/device information

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**ZYTRONA**
- GitHub: [@ZYTRONA](https://github.com/ZYTRONA)
- Repository: [NUMMAZE](https://github.com/ZYTRONA/NUMMAZE)

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.io for real-time magic
- TailwindCSS for beautiful styling
- MongoDB for robust data storage
- Google Gemini for AI-powered quizzes
- All contributors and players!

---

<div align="center">

### 🌟 Star this repo if you enjoyed it! 🌟

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ⚡ Built with passion for gamers worldwide ⚡   ║
║                                                   ║
║          Play. Compete. Conquer. Win.             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

[![GitHub stars](https://img.shields.io/github/stars/ZYTRONA/NUMMAZE?style=social)](https://github.com/ZYTRONA/NUMMAZE/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/ZYTRONA/NUMMAZE?style=social)](https://github.com/ZYTRONA/NUMMAZE/network/members)

**Made with ❤️ and ☕ | Happy Gaming! 🎮**

</div>
