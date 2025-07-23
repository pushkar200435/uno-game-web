# UNO Game (Web)

This is a browser-based UNO card game built with HTML, CSS, and JavaScript. It features two modes of play:
- **AI Mode**: Play against computer players.
- **Offline Multiplayer Mode**: Play locally with friends using "pass and play."

## 🎮 Features
- Smooth card animations and interactions
- Realistic UNO gameplay with rules like skip, reverse, draw two, wild, and draw four
- Dynamic sound effects (play, draw, error, win, UNO!)
- Responsive design and interactive UI
- "UNO" shout and penalty logic
- Single-player (vs CPU) and local multiplayer support

## 🗂️ File Structure
```
uno-game/
├── index.html                # AI mode (vs computer)
├── offline-multiplayer.html  # Pass & play mode
├── mode-select.html          # Landing page (mode selector)
├── styles.css                # Styles for AI mode
├── game.js                   # JS for AI mode
├── offline-multiplayer.css   # Styles for multiplayer
├── offline-multiplayer.js    # JS for multiplayer
├── sounds.js                 # Sound manager (shared)
├── sounds/                   # Folder for .mp3/.wav sound files
│   ├── play.mp3
│   ├── draw.mp3
│   ├── error.mp3
│   ├── win.mp3
│   └── uno.mp3
└── README.md                 # This file
```
## 🔊 Sound Effects

Make sure the `/sounds/` folder exists and contains these files:
- `play.mp3` – Card played
- `draw.mp3` – Card drawn
- `error.mp3` – Invalid action
- `win.mp3` – Game win
- `uno.mp3` – "UNO!" shout

These are used in `sounds.js`.

## 🚀 Getting Started
1. **Clone or Download** this repository.
2. **Add Sound Files**: Place your sound effects in the `sounds/` folder (or use the provided placeholders).
3. **Open `mode-select.html`** in your browser to start playing!

> No build step or server required. Just open the HTML files directly.

## 🕹️ How to Play
- **AI Mode**: Play against 3 computer players. Click cards to play, draw from the deck, and press UNO when you have two cards left.
- **Offline Multiplayer**: Enter player names, pass the device, and play turn by turn. The game handles turn transitions and rules.
- **Sound**: Make sure your browser allows audio for the best experience.

## 💡 Future Enhancements

- Online multiplayer with WebSockets
- Improved AI strategy
- Mobile gesture support
- Score tracking and game history

## ✨ Credits
- UI & logic by Pushkar Karmakar
- UNO is a trademark of Mattel. This project is for educational/personal use only.

---

Enjoy the game! If you find bugs or want to contribute, feel free to open an issue or PR. 
