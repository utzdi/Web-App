// Spielkonfiguration
const GRID_SIZE = 20;
const INITIAL_SNAKE_LENGTH = 3;
const GAME_SPEED = 150; // Millisekunden zwischen Bewegungen
const MOTION_THRESHOLD = 2; // Schwellenwert für Bewegungserkennung

// Spielvariablen
let snake = [];
let food = {};
let direction = 'right';
let score = 0;
let gameLoop;
let lastAcceleration = { x: 0, y: 0 };

// Spiel initialisieren
function initGame() {
    // Spielfeld erstellen
    const gameGrid = document.getElementById('game-grid');
    gameGrid.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        gameGrid.appendChild(cell);
    }

    // Schlange initialisieren
    snake = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
        snake.unshift({
            x: Math.floor(GRID_SIZE / 2),
            y: Math.floor(GRID_SIZE / 2) + i
        });
    }

    // Erste Frucht platzieren
    placeFood();
    
    // Score zurücksetzen
    score = 0;
    updateScore();
    
    // Schlange zeichnen
    drawSnake();
}

// Spielschleife
function gameStep() {
    const head = { ...snake[0] };

    // Neue Position basierend auf Richtung
    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Durch Wände gleiten (Wrap-Around)
    head.x = (head.x + GRID_SIZE) % GRID_SIZE;
    head.y = (head.y + GRID_SIZE) % GRID_SIZE;

    // Neue Position zur Schlange hinzufügen
    snake.unshift(head);

    // Prüfen ob Frucht gefressen wurde
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        placeFood();
    } else {
        snake.pop();
    }

    drawSnake();
}

// Frucht platzieren
function placeFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));

    const foodCell = document.querySelector(`#game-grid div:nth-child(${food.y * GRID_SIZE + food.x + 1})`);
    foodCell.classList.add('food');
}

// Schlange zeichnen
function drawSnake() {
    // Alle Zellen zurücksetzen
    document.querySelectorAll('#game-grid .grid-cell').forEach(cell => {
        cell.className = 'grid-cell';
    });

    // Schlange zeichnen
    snake.forEach(segment => {
        const cell = document.querySelector(`#game-grid div:nth-child(${segment.y * GRID_SIZE + segment.x + 1})`);
        if (cell) cell.classList.add('snake');
    });

    // Frucht zeichnen
    const foodCell = document.querySelector(`#game-grid div:nth-child(${food.y * GRID_SIZE + food.x + 1})`);
    if (foodCell) foodCell.classList.add('food');
}

// Score aktualisieren
function updateScore() {
    document.getElementById('score-value').textContent = score;
}

// Game Over
function gameOver() {
    clearInterval(gameLoop);
    document.getElementById('restart-btn').style.display = 'block';
}

// Bewegungssteuerung
function handleMotion(event) {
    const accel = event.accelerationIncludingGravity;
    if (!accel) return;

    // Bewegung dämpfen
    const dampedX = accel.x * 0.3 + lastAcceleration.x * 0.7;
    const dampedY = accel.y * 0.3 + lastAcceleration.y * 0.7;

    // Richtung basierend auf Beschleunigung ändern
    if (Math.abs(dampedX) > Math.abs(dampedY)) {
        if (Math.abs(dampedX) > MOTION_THRESHOLD) {
            if (dampedX > 0 && direction !== 'left') direction = 'right';
            if (dampedX < 0 && direction !== 'right') direction = 'left';
        }
    } else {
        if (Math.abs(dampedY) > MOTION_THRESHOLD) {
            if (dampedY > 0 && direction !== 'down') direction = 'up';
            if (dampedY < 0 && direction !== 'up') direction = 'down';
        }
    }

    lastAcceleration = { x: dampedX, y: dampedY };
}

// Event-Listener für den Start-Button
document.getElementById('start-btn').addEventListener('click', async () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Prüfen ob es ein iOS Gerät ist (iOS 13+)
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                startGame();
            } else {
                showError('Zugriff auf Sensoren wurde verweigert.');
            }
        } catch (error) {
            console.error('Fehler bei iOS Berechtigungsanfrage:', error);
            showError('Fehler beim Zugriff auf Sensoren. Bitte stellen Sie sicher, dass Sie ein iOS Gerät verwenden und die Seite über HTTPS aufrufen.');
        }
    } else {
        startGame();
    }
});

// Spiel starten
function startGame() {
    initGame();
    window.addEventListener('devicemotion', handleMotion);
    gameLoop = setInterval(gameStep, GAME_SPEED);
}

// Neustart-Button
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('restart-btn').style.display = 'none';
    startGame();
});

// Fehlermeldung anzeigen
function showError(message) {
    document.getElementById('game-screen').innerHTML = `<p style="color: red;">${message}</p>`;
} 