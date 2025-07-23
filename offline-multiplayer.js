document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENTS ---
    const setupScreen = document.getElementById('setup-screen');
    const playerCountSelect = document.getElementById('player-count');
    const playerNamesContainer = document.getElementById('player-names-container');
    const startGameBtn = document.getElementById('start-game-btn');
    
    const gameBoard = document.getElementById('game-board');
    const playerHandElements = [
        document.getElementById('player-hand-0'), document.getElementById('player-hand-1'),
        document.getElementById('player-hand-2'), document.getElementById('player-hand-3')
    ];
    const deckCard = document.getElementById('deck-card');
    const discardPileEl = document.getElementById('discard-pile');
    const colorPicker = document.getElementById('color-picker');
    const gameMessage = document.getElementById('game-message');
    const unoButton = document.getElementById('uno-button');
    
    const turnTransitionScreen = document.getElementById('turn-transition-screen');
    const turnPlayerName = document.getElementById('turn-player-name');
    const startTurnBtn = document.getElementById('start-turn-btn');

    const gameOverScreen = document.getElementById('game-over-screen');
    const newGameBtn = document.getElementById('new-game-btn');

    // --- GAME STATE ---
    let deck = [];
    let players = [];
    let discard = [];
    let numPlayers = 2;
    let currentPlayerIndex = 0;
    let gameDirection = 1;
    let isGameOver = false;
    let wildColor = null;
    let playerSaidUno = [];
    let canSayUno = false;

    const COLORS = ['red', 'yellow', 'green', 'blue'];
    const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
    const WILD_VALUES = ['wild', 'wild_draw4'];

    // --- SETUP LOGIC ---
    function updatePlayerNameInputs() {
        numPlayers = parseInt(playerCountSelect.value, 10);
        playerNamesContainer.innerHTML = '';
        for (let i = 0; i < numPlayers; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'player-name-input';
            input.placeholder = `Player ${i + 1} Name`;
            input.value = `Player ${i + 1}`;
            playerNamesContainer.appendChild(input);
        }
    }

    playerCountSelect.addEventListener('change', updatePlayerNameInputs);

    startGameBtn.addEventListener('click', () => {
        const nameInputs = document.querySelectorAll('.player-name-input');
        players = [];
        nameInputs.forEach((input, index) => {
            players.push({ name: input.value || `Player ${index + 1}`, hand: [] });
        });
        playerSaidUno = Array(numPlayers).fill(false);
        
        setupScreen.style.display = 'none';
        initializeGame();
    });

    // --- GAME LOGIC FUNCTIONS ---
    function createDeck() {
        const newDeck = [];
        for (const color of COLORS) {
            for (const value of VALUES) {
                newDeck.push({ color, value });
                if (value !== '0') newDeck.push({ color, value });
            }
        }
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
        for (let i = 0; i < numPlayers; i++) {
            for (let j = 0; j < 7; j++) {
                players[i].hand.push(drawCardFromDeck());
            }
        }
    }
    
    function drawCardFromDeck() {
        if (deck.length === 0) {
            const topCard = discard.pop();
            deck = [...discard];
            shuffleDeck(deck);
            discard = [topCard];
            if (deck.length === 0) {
                showMessage("Stalemate! No cards left to draw.");
                playSound && playSound('error');
                isGameOver = true;
                return null;
            }
        }
        playSound && playSound('draw');
        return deck.pop();
    }

    function initializeGame() {
        isGameOver = false;
        deck = createDeck();
        shuffleDeck(deck);
        discard = [];
        currentPlayerIndex = Math.floor(Math.random() * numPlayers);
        gameDirection = 1;
        wildColor = null;
        
        dealCards();

        let firstCard = drawCardFromDeck();
        while (WILD_VALUES.includes(firstCard.value) || ['skip', 'reverse', 'draw2'].includes(firstCard.value)) {
            deck.push(firstCard);
            shuffleDeck(deck);
            firstCard = drawCardFromDeck();
        }
        discard.push(firstCard);
        
        gameBoard.style.display = 'grid';
        nextTurn();
    }

    function updateUI() {
        // Update player hands based on the current player's perspective
        for (let i = 0; i < 4; i++) {
            const handElement = playerHandElements[i];
            handElement.innerHTML = '';
            handElement.style.display = 'none';
        }

        for (let i = 0; i < numPlayers; i++) {
            const player = players[i];
            // Calculate position relative to current player
            // 0 = bottom, 1 = left, 2 = top, 3 = right
            let relativePos = (i - currentPlayerIndex + numPlayers) % numPlayers;
            if (numPlayers === 2 && relativePos === 1) relativePos = 2; // P2 is always on top
            if (numPlayers === 3 && relativePos === 1) relativePos = 1; // P2 is on the left
            if (numPlayers === 3 && relativePos === 2) relativePos = 3; // P3 is on the right
            
            const posMap = ['bottom', 'left', 'top', 'right'];
            const handElement = document.querySelector(`.player-hand.${posMap[relativePos]}`);
            if (!handElement) continue;

            handElement.style.display = 'flex';
            handElement.classList.remove('active-player');

            const nameDiv = document.createElement('div');
            nameDiv.className = 'player-name';
            nameDiv.textContent = `${player.name} (${player.hand.length})`;
            handElement.appendChild(nameDiv);

            if (i === currentPlayerIndex) {
                handElement.classList.add('active-player');
                // Render current player's actual cards
                player.hand.forEach((card, cardIndex) => {
                    const cardElement = createCardElement(card, true);
                    cardElement.dataset.cardIndex = cardIndex;
                    if (isPlayable(card)) {
                        cardElement.classList.add('playable');
                        cardElement.addEventListener('click', onPlayerCardClick);
                    }
                    handElement.appendChild(cardElement);
                });
            } else {
                // Render other players' hidden cards
                player.hand.forEach(() => {
                    const cardElement = createCardElement({}, false);
                    if (relativePos === 1 || relativePos === 3) cardElement.style.margin = '-90px 0';
                    else cardElement.style.margin = '0 -50px';
                    handElement.appendChild(cardElement);
                });
            }
        }

        // Update discard pile
        discardPileEl.innerHTML = '';
        if (discard.length > 0) {
            const topCard = discard[discard.length - 1];
            const cardElement = createCardElement(topCard, true);
            if (topCard.color === 'black' && wildColor) {
                cardElement.style.backgroundColor = `var(--${wildColor})`;
            }
            discardPileEl.appendChild(cardElement);
        }
        
        deckCard.style.display = deck.length > 0 ? 'block' : 'none';
    }

    function createCardElement(card, isVisible) {
        const cardElement = document.createElement('div');
        cardElement.className = 'uno-card';
        
        if (!isVisible) {
            cardElement.classList.add('hidden-card');
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
            <div class="card-center-oval"><div class="card-center-value">${valueText}</div></div>
            <div class="card-value-sm bottom-right">${valueText}</div>`;
        return cardElement;
    }

    function isPlayable(card) {
        if (isGameOver) return false;
        const topCard = discard[discard.length - 1];
        const effectiveColor = wildColor || topCard.color;

        if (card.color === 'black') return true;
        if (card.color === effectiveColor) return true;
        if (card.value === topCard.value) return true;
        return false;
    }

    function onPlayerCardClick(event) {
        const cardIndex = parseInt(event.currentTarget.dataset.cardIndex, 10);
        const card = players[currentPlayerIndex].hand[cardIndex];
        if (isPlayable(card)) {
            // If player has 2 cards before playing, allow UNO
            canSayUno = (players[currentPlayerIndex].hand.length === 2);
            playCard(currentPlayerIndex, cardIndex);
        } else {
            showMessage("You can't play that card!");
            playSound && playSound('error');
        }
    }
    
    function onDeckClick() {
        if (isGameOver) return;
        
        const drawnCard = drawCardFromDeck();
        if (drawnCard) {
            players[currentPlayerIndex].hand.push(drawnCard);
            showMessage(`${players[currentPlayerIndex].name} drew a card.`);
            playSound && playSound('draw');
            playerSaidUno[currentPlayerIndex] = false;
            canSayUno = false; // Can't say UNO after drawing
            
            if (!isPlayable(drawnCard)) {
                setTimeout(nextTurn, 1500);
            } else {
                 showMessage("You drew a playable card! Play it or pass.");
                 updateUI();
                 deckCard.removeEventListener('click', onDeckClick);
                 deckCard.addEventListener('click', () => nextTurn(), { once: true });
            }
        }
    }

    function playCard(playerIndex, cardIndex) {
        deckCard.removeEventListener('click', onDeckClick);
        const card = players[playerIndex].hand.splice(cardIndex, 1)[0];
        discard.push(card);
        wildColor = null;
        playSound && playSound('play');
        // If player had 2 cards and didn't say UNO, penalize
        if (players[playerIndex].hand.length === 1 && !playerSaidUno[playerIndex]) {
            showMessage(`${players[playerIndex].name} forgot to say UNO! Drawing 2 cards.`);
            playSound && playSound('error');
            players[playerIndex].hand.push(drawCardFromDeck(), drawCardFromDeck());
        }
        playerSaidUno[playerIndex] = false;
        canSayUno = false; // After playing, can't say UNO until next turn
        
        if (players[playerIndex].length === 0) {
            endGame(playerIndex);
            return;
        }

        handleCardEffect(card);
    }

    function handleCardEffect(card) {
        let effectApplied = true;
        let nextPlayer = getNextPlayerIndex();
        
        switch (card.value) {
            case 'draw2':
                showMessage(`${players[nextPlayer].name} draws 2 cards!`);
                playSound && playSound('draw');
                players[nextPlayer].hand.push(drawCardFromDeck(), drawCardFromDeck());
                playerSaidUno[nextPlayer] = false;
                currentPlayerIndex = getNextPlayerIndex();
                break;
            case 'reverse':
                if (numPlayers === 2) {
                   currentPlayerIndex = getNextPlayerIndex();
                   showMessage('Turn skipped!');
                } else {
                   gameDirection *= -1;
                   showMessage('Game direction reversed!');
                }
                break;
            case 'skip':
                currentPlayerIndex = getNextPlayerIndex();
                showMessage(`${players[getNextPlayerIndex()].name}'s turn was skipped!`);
                break;
            case 'wild':
                promptColorChoice(() => nextTurn());
                effectApplied = false;
                break;
            case 'wild_draw4':
                promptColorChoice(() => {
                    showMessage(`${players[nextPlayer].name} draws 4 cards!`);
                    playSound && playSound('draw');
                    players[nextPlayer].hand.push(drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck(), drawCardFromDeck());
                    playerSaidUno[nextPlayer] = false;
                    currentPlayerIndex = getNextPlayerIndex();
                    nextTurn();
                });
                effectApplied = false;
                break;
        }
        
        if (effectApplied) {
            setTimeout(nextTurn, 1500);
        }
    }
    
    function getNextPlayerIndex() {
        let nextIndex = currentPlayerIndex + gameDirection;
        if (nextIndex >= numPlayers) nextIndex = 0;
        if (nextIndex < 0) nextIndex = numPlayers - 1;
        return nextIndex;
    }

    function beginTurn() {
        gameBoard.style.display = 'grid';
        turnTransitionScreen.style.display = 'none';
        showMessage(`${players[currentPlayerIndex].name}, it's your turn!`);
        updateUI();
        deckCard.addEventListener('click', onDeckClick);
        canSayUno = (players[currentPlayerIndex].hand.length === 2);
    }

    function nextTurn() {
        deckCard.removeEventListener('click', onDeckClick);
        if (isGameOver) return;
        
        currentPlayerIndex = getNextPlayerIndex();
        canSayUno = (players[currentPlayerIndex].hand.length === 2);
        
        gameBoard.style.display = 'none';
        turnPlayerName.textContent = players[currentPlayerIndex].name;
        turnTransitionScreen.style.display = 'flex';
    }

    startTurnBtn.addEventListener('click', beginTurn);
    
    function promptColorChoice(callback) {
        colorPicker.style.display = 'grid';
        const choices = colorPicker.querySelectorAll('.color-choice');
        choices.forEach(choice => {
            const handler = (event) => {
                wildColor = event.target.dataset.color;
                showMessage(`${players[currentPlayerIndex].name} chose ${wildColor}!`);
                playSound && playSound('play');
                colorPicker.style.display = 'none';
                choices.forEach(c => c.replaceWith(c.cloneNode(true)));
                callback();
            };
            choice.addEventListener('click', handler, { once: true });
        });
    }
    
    unoButton.addEventListener('click', () => {
        if (canSayUno && players[currentPlayerIndex].hand.length === 2) {
            playerSaidUno[currentPlayerIndex] = true;
            showMessage(`${players[currentPlayerIndex].name} says UNO!`);
            playSound && playSound('uno');
            unoButton.classList.add('active');
            setTimeout(() => unoButton.classList.remove('active'), 1000);
            canSayUno = false;
        } else {
            showMessage("You can only say UNO when you have 2 cards left and before playing!");
            playSound && playSound('error');
        }
    });

    function showMessage(msg, duration = 2000) {
        gameMessage.textContent = msg;
        gameMessage.style.display = 'flex';
        clearTimeout(window.messageTimeout);
        window.messageTimeout = setTimeout(() => {
            gameMessage.style.display = 'none';
        }, duration);
    }
    
    function endGame(winnerIndex) {
        isGameOver = true;
        gameBoard.style.display = 'none';
        document.getElementById('winner-message').textContent = `${players[winnerIndex].name} Wins!`;
        playSound && playSound('win');
        gameOverScreen.style.display = 'flex';
    }

    newGameBtn.addEventListener('click', () => {
        window.location.reload();
    });

    // --- INITIALIZE SETUP ---
    updatePlayerNameInputs();
}); 