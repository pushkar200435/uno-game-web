# UNO Game (Web)

A beautiful, modern UNO card game for the browser! Play against AI or with friends in offline pass-and-play mode. Features a stylish UI, sound effects, and more.

## 🎮 Features
- **AI Mode**: Play against computer opponents (index.html)
- **Offline Multiplayer**: Pass & play with up to 4 players on one device (offline-multiplayer.html)
- **Sound Effects**: Card play, draw, error, win, UNO call, and more
- **Modern UI**: Responsive, mobile-friendly, and visually appealing
- **Mode Selector**: Landing page to choose between AI and Multiplayer (mode-select.html)

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

## 🚀 Getting Started
1. **Clone or Download** this repository.
2. **Add Sound Files**: Place your sound effects in the `sounds/` folder (or use the provided placeholders).
3. **Open `mode-select.html`** in your browser to start playing!

> No build step or server required. Just open the HTML files directly.

## 🕹️ How to Play
- **AI Mode**: Play against 3 computer players. Click cards to play, draw from the deck, and press UNO when you have two cards left.
- **Offline Multiplayer**: Enter player names, pass the device, and play turn by turn. The game handles turn transitions and rules.
- **Sound**: Make sure your browser allows audio for the best experience.

## ✨ Credits
- UI & logic by [Your Name]
- UNO is a trademark of Mattel. This project is for educational/personal use only.

---

Enjoy the game! If you find bugs or want to contribute, feel free to open an issue or PR. "# uno-game-web" 
