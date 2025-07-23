// Import sound manager (sounds.js must be loaded before this script)
// UNO Game Logic

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const playerHands = [
        document.getElementById('player-0-hand'),
        document.getElementById('player-1-hand'),
        document.getElementById('player-2-hand'),
        document.getElementById('player-3-hand')
    ];
    const deckCard = document.getElementById('deck-card');
    const discardPile = document.getElementById('discard-pile');
    const colorPicker = document.getElementById('color-picker');
    const gameMessage = document.getElementById('game-message');
    const unoButton = document.getElementById('uno-button');
    const gameOverScreen = document.getElementById('game-over-screen');
    const newGameBtn = document.getElementById('new-game-btn');

    // --- GAME STATE ---
    let deck = [];
    let players = [[], [], [], []];
    let discard = [];
    let currentPlayerIndex = 0;
    let gameDirection = 1; // 1 for clockwise, -1 for counter-clockwise
    let isGameOver = false;
    let wildColor = null;
    let playerSaidUno = [false, false, false, false];

    const COLORS = ['red', 'yellow', 'green', 'blue'];
    const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
    const WILD_VALUES = ['wild', 'wild_draw4'];

    // --- GAME LOGIC FUNCTIONS ---

    function createDeck() {
        const newDeck = [];
        // Standard cards
        for (const color of COLORS) {
            for (const value of VALUES) {
                newDeck.push({ color, value });
                if (value !== '0') {
                    newDeck.push({ color, value });
                }
            }
        }
        // Wild cards
        for (let i = 0; i < 4; i++) {
            newDeck.push({ color: 'black', value: 'wild' });
            newDeck.push({ color: 'black', value: 'wild_draw4' });
        }
        return newDeck;
    }

    function shuffleDeck(deckToShuffle) {
        for (let i = deckToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
        }
    }

    function dealCards() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 7; j++) {
                players[i].push(drawCardFromDeck());
            }
        }
    }
    
    function drawCardFromDeck() {
        if (deck.length === 0) {
            // Reshuffle discard pile into deck
            const topCard = discard.pop();
            deck = [...discard];
            shuffleDeck(deck);
            discard = [topCard];
            if (deck.length === 0) {
                showMessage("Stalemate! No cards left to draw.");
                playSound('error');
                isGameOver = true;
                return null;
            }
        }
        playSound('draw');
        return deck.pop();
    }

    function startGame() {
        isGameOver = false;
        deck = createDeck();
        shuffleDeck(deck);
        players = [[], [], [], []];
        discard = [];
        currentPlayerIndex = 0;
        gameDirection = 1;
        wildColor = null;
        playerSaidUno = [false, false, false, false];
        
        dealCards();

        // Start discard pile with a non-action card
        let firstCard = drawCardFromDeck();
        while (WILD_VALUES.includes(firstCard.value) || ['skip', 'reverse', 'draw2'].includes(firstCard.value)) {
            deck.push(firstCard);
            shuffleDeck(deck);
            firstCard = drawCardFromDeck();
        }
        discard.push(firstCard);

        updateUI();
        nextTurn();
    }

    function updateUI() {
        // Update player hands
        for (let i = 0; i < 4; i++) {
            const handElement = playerHands[i];
            handElement.innerHTML = ''; // Clear hand
            const nameDiv = document.createElement('div');
            nameDiv.className = 'player-name';
            nameDiv.textContent = i === 0 ? `You (${players[i].length})` : `CPU ${i} (${players[i].length})`;
            handElement.appendChild(nameDiv);

            players[i].forEach((card, index) => {
                const cardElement = createCardElement(card, i, index);
                handElement.appendChild(cardElement);
            });
            
            // Highlight active player
            if (i === currentPlayerIndex) {
                handElement.classList.add('active-player');
            } else {
                handElement.classList.remove('active-player');
            }
        }

        // Update discard pile
        discardPile.innerHTML = '';
        if (discard.length > 0) {
            const topCard = discard[discard.length - 1];
            const cardElement = createCardElement(topCard, -1);
            if (topCard.color === 'black' && wildColor) {
                cardElement.style.backgroundColor = `var(--${wildColor})`;
            }
            discardPile.appendChild(cardElement);
        }
        
        // Update deck pile
        deckCard.style.display = deck.length > 0 ? 'block' : 'none';
    }

    function createCardElement(card, playerIndex, cardIndex) {
        const cardElement = document.createElement('div');
        cardElement.className = 'uno-card';
        
        if (playerIndex !== 0 && playerIndex !== -1) { // CPU or deck
            cardElement.classList.add('cpu-card');
            return cardElement;
        }
        
        cardElement.dataset.color = card.color;
        cardElement.dataset.value = card.value;

        const valueText = card.value?.includes('draw') ? (card.value === 'draw2' ? '+2' : '+4')
                        : card.value === 'skip' ? '⊘'
                        : card.value === 'reverse' ? '⇄'
                        : card.value === 'wild' ? 'W'
                        : card.value;

        cardElement.innerHTML = `
            <div class="card-value-sm top-left">${valueText}</div>
            <div class="card-center-oval">
                <div class="card-center-value">${valueText}</div>
            </div>
            <div class="card-value-sm bottom-right">${valueText}</div>
        `;

        if (playerIndex === 0) { // Human player's card
            cardElement.dataset.cardIndex = cardIndex;
            if (isPlayable(card)) {
                cardElement.classList.add('playable');
                cardElement.addEventListener('click', onPlayerCardClick);
            }
        }
        
        return cardElement;
    }

    function isPlayable(card) {
        if (isGameOver) return false;
        const topCard = discard[discard.length - 1];
        
        // If a wild color is set, it overrides the top card's actual color
        const effectiveColor = wildColor || topCard.color;

        if (card.color === 'black') return true; // Wild cards are always playable
        if (card.color === effectiveColor) return true;
        if (card.value === topCard.value) return true;

        return false;
    }

    function onPlayerCardClick(event) {
        if (currentPlayerIndex !== 0 || isGameOver) return;
        
        const cardIndex = parseInt(event.currentTarget.dataset.cardIndex, 10);
        const card = players[0][cardIndex];

        if (isPlayable(card)) {
            playCard(0, cardIndex);
        } else {
            showMessage("You can't play that card!");
            playSound('error');
        }
    }
    
    function onDeckClick() {
        if (currentPlayerIndex !== 0 || isGameOver) return;
        
        const drawnCard = drawCardFromDeck();
        if (drawnCard) {
            players[0].push(drawnCard);
            showMessage("You drew a card.");
            playerSaidUno[0] = false; // Reset UNO status on draw
            updateUI();
            // If drawn card is not playable, pass turn
            if (!isPlayable(drawnCard)) {
                setTimeout(nextTurn, 1000);
            } else {
                 showMessage("You drew a playable card! Play it or pass.");
                 // Player can now click the new card or the deck again to pass
                 // Re-binding deck click to pass the turn
                 deckCard.removeEventListener('click', onDeckClick);
                 deckCard.addEventListener('click', passTurnAfterDraw, { once: true });
            }
        }
    }
    
    function passTurnAfterDraw() {
        showMessage("You passed your turn.");
        deckCard.removeEventListener('click', passTurnAfterDraw);
        deckCard.addEventListener('click', onDeckClick); // Re-bind original deck click
        nextTurn();
    }

    function playCard(playerIndex, cardIndex) {
        const card = players[playerIndex].splice(cardIndex, 1)[0];
        discard.push(card);
        wildColor = null; // Reset wild color on any new card played
        playSound('play');
        
        // Check for UNO call validity
        if (players[playerIndex].length === 1 && !playerSaidUno[playerIndex]) {
            showMessage(`${playerIndex === 0 ? 'You' : 'CPU '+playerIndex} forgot to say UNO! Drawing 2 cards.`);
            playSound('error');
            players[playerIndex].push(drawCardFromDeck(), drawCardFromDeck());
        }
        playerSaidUno[playerIndex] = false; // Reset after playing

        updateUI();
        
        // Check for win condition
        if (players[playerIndex].length === 0) {
            endGame(playerIndex);
            return;
        }

        handleCardEffect(card, playerIndex);
    }

    function handleCardEffect(card, playerIndex) {
        let effectApplied = true;
        switch (card.value) {
            case 'draw2':
                {
                    const nextPlayer = getNextPlayerIndex();
                    showMessage(`CPU ${nextPlayer} draws 2 cards!`);
                    playSound('draw');
                    players[nextPlayer].push(drawCardFromDeck(), drawCardFromDeck());
                    playerSaidUno[nextPlayer] = false;
                    currentPlayerIndex = getNextPlayerIndex(); // Skip next player's turn
                }
                break;
            case 'reverse':
                gameDirection *= -1;
                showMessage("Game direction reversed!");
                break;
            case 'skip':
                currentPlayerIndex = getNextPlayerIndex(); // Skip next player
                showMessage(`CPU ${currentPlayerIndex} was skipped!`);
                break;
            case 'wild':
                if (playerIndex === 0) {
                    promptColorChoice();
                    effectApplied = false; // Turn progression waits for color choice
                } else {
                    const chosenColor = aiChooseColor(playerIndex);
                    wildColor = chosenColor;
                    showMessage(`CPU ${playerIndex} chose ${chosenColor}!`);
                }
                break;
            case 'wild_draw4':
                {
                    const nextPlayer = getNextPlayerIndex();
                    if (playerIndex === 0) {
                        promptColorChoice(() => {
                            showMessage(`CPU ${nextPlayer} draws 4 cards!`);
                            playSound('draw');
                            players[nextPlayer].push(drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck());
                            playerSaidUno[nextPlayer] = false;
                            currentPlayerIndex = getNextPlayerIndex(); // Skip
                            nextTurn();
                        });
                        effectApplied = false;
                    } else {
                        const chosenColor = aiChooseColor(playerIndex);
                        wildColor = chosenColor;
                        showMessage(`CPU ${playerIndex} chose ${chosenColor}! CPU ${nextPlayer} draws 4 cards!`);
                        playSound('draw');
                        players[nextPlayer].push(drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck());
                        playerSaidUno[nextPlayer] = false;
                        currentPlayerIndex = getNextPlayerIndex(); // Skip
                    }
                }
                break;
        }
        
        if (effectApplied) {
            setTimeout(nextTurn, 1500);
        }
    }
    
    function getNextPlayerIndex() {
        let nextIndex = currentPlayerIndex + gameDirection;
        if (nextIndex >= 4) nextIndex = 0;
        if (nextIndex < 0) nextIndex = 3;
        return nextIndex;
    }

    function nextTurn() {
        if (isGameOver) return;
        
        currentPlayerIndex = getNextPlayerIndex();
        updateUI();
        
        if (currentPlayerIndex !== 0) {
            // It's an AI's turn
            setTimeout(aiTurn, 2000);
        } else {
            // It's the human's turn
            showMessage("Your turn!");
            // Re-enable deck click listener
            deckCard.removeEventListener('click', passTurnAfterDraw);
            deckCard.addEventListener('click', onDeckClick);
        }
    }

    function aiTurn() {
        if (isGameOver) return;
        
        const player = players[currentPlayerIndex];
        const playableCards = player.map((card, index) => ({ card, index }))
                                    .filter(item => isPlayable(item.card));
        
        // Check for UNO call
        if (player.length === 2) {
            playerSaidUno[currentPlayerIndex] = true;
            showMessage(`CPU ${currentPlayerIndex} says UNO!`);
            playSound('uno');
        }

        if (playableCards.length > 0) {
            // AI has a card to play
            // Simple AI: play the first playable card
            const cardToPlay = playableCards[0];
            showMessage(`CPU ${currentPlayerIndex} plays a card.`);
            setTimeout(() => playCard(currentPlayerIndex, cardToPlay.index), 1000);
        } else {
            // AI must draw
            showMessage(`CPU ${currentPlayerIndex} is drawing a card.`);
            const drawnCard = drawCardFromDeck();
            if (drawnCard) {
                player.push(drawnCard);
                playerSaidUno[currentPlayerIndex] = false;
                updateUI();
                
                // Check if the drawn card is playable
                if (isPlayable(drawnCard)) {
                    showMessage(`CPU ${currentPlayerIndex} plays the drawn card.`);
                    setTimeout(() => playCard(currentPlayerIndex, player.length - 1), 1500);
                } else {
                    showMessage(`CPU ${currentPlayerIndex} passes.`);
                    setTimeout(nextTurn, 1500);
                }
            } else {
                // No cards to draw, stalemate
                setTimeout(nextTurn, 1500);
            }
        }
    }
    
    function aiChooseColor(playerIndex) {
        const hand = players[playerIndex];
        const colorCounts = { red: 0, yellow: 0, green: 0, blue: 0 };
        hand.forEach(card => {
            if (card.color !== 'black') {
                colorCounts[card.color]++;
            }
        });
        
        let bestColor = 'red';
        let maxCount = 0;
        for (const color in colorCounts) {
            if (colorCounts[color] > maxCount) {
                maxCount = colorCounts[color];
                bestColor = color;
            }
        }
        return bestColor;
    }

    function promptColorChoice(callback) {
        colorPicker.style.display = 'grid';
        const choices = colorPicker.querySelectorAll('.color-choice');
        choices.forEach(choice => {
            const handler = (event) => {
                wildColor = event.target.dataset.color;
                showMessage(`You chose ${wildColor}!`);
                playSound('play');
                colorPicker.style.display = 'none';
                // Remove listeners to prevent multiple triggers
                choices.forEach(c => c.replaceWith(c.cloneNode(true)));
                if (callback) {
                    callback();
                } else {
                    nextTurn();
                }
            };
            choice.addEventListener('click', handler, { once: true });
        });
    }
    
    function onUnoButtonClick() {
        if (currentPlayerIndex === 0 && players[0].length === 2) {
            playerSaidUno[0] = true;
            showMessage("You said UNO!");
            playSound('uno');
            unoButton.classList.add('active');
            setTimeout(() => unoButton.classList.remove('active'), 1000);
        } else {
            showMessage("You can only say UNO when you have 2 cards left!");
            playSound('error');
        }
    }

    function showMessage(msg, duration = 2000) {
        gameMessage.textContent = msg;
        gameMessage.style.display = 'flex';
        setTimeout(() => {
            gameMessage.style.display = 'none';
        }, duration);
    }
    
    function endGame(winnerIndex) {
        isGameOver = true;
        const winnerMessage = document.getElementById('winner-message');
        winnerMessage.textContent = winnerIndex === 0 ? "You Win!" : `CPU ${winnerIndex} Wins!`;
        playSound('win');
        gameOverScreen.style.display = 'flex';
    }

    // --- EVENT LISTENERS ---
    deckCard.addEventListener('click', onDeckClick);
    unoButton.addEventListener('click', onUnoButtonClick);
    newGameBtn.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        startGame();
    });

    // --- INITIALIZE GAME ---
    startGame();
}); 