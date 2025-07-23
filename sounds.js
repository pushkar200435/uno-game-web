// Sound manager for UNO game
const soundMap = {
    play: 'sounds/play.mp3',
    draw: 'sounds/draw.mp3',
    error: 'sounds/error.mp3',
    win: 'sounds/win.mp3',
    uno: 'sounds/uno.mp3',
};

function playSound(event) {
    const src = soundMap[event];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play();
} 