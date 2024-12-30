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

    // Debug-Logging für Kollisionserkennung
    console.log('Head position:', head);
    console.log('Snake body:', snake.slice(1));

    // Verbesserte Kollisionsprüfung mit dem Körper
    const collision = snake.slice(1).some(segment => {
        const hasCollision = segment.x === head.x && segment.y === head.y;
        if (hasCollision) {
            console.log('Collision detected with segment:', segment);
        }
        return hasCollision;
    });

    if (collision) {
        console.log('Game Over - Collision with body');
        showGameOver();
        return;
    }

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

// Game Over anzeigen
function showGameOver() {
    clearInterval(gameLoop);
    const gameScreen = document.getElementById('game-screen');
    gameScreen.innerHTML = `
        <div class="game-over">
            <h2>Game Over!</h2>
            <p>Dein Score: ${score}</p>
            <div class="game-over-buttons">
                <button id="restart-btn">Neu starten</button>
                <button id="back-to-start-btn">Zurück zum Start</button>
            </div>
        </div>
    `;
    
    // Event-Listener für den Neustart-Button
    document.getElementById('restart-btn').addEventListener('click', () => {
        gameScreen.innerHTML = `
            <div id="score">Punkte: <span id="score-value">0</span></div>
            <div id="game-grid"></div>
        `;
        startGame();
    });

    // Event-Listener für den Zurück zum Start-Button
    document.getElementById('back-to-start-btn').addEventListener('click', () => {
        gameScreen.style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'block';
    });
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

// Tutorial Funktionalität
function showTutorial() {
    const tutorial = document.getElementById('tutorial');
    tutorial.style.display = 'flex';
}

function closeTutorial() {
    const tutorial = document.getElementById('tutorial');
    tutorial.style.display = 'none';
    // Starte das Spiel erst nach dem Schließen des Tutorials
    startGame();
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
                showTutorial(); // Zeige Tutorial vor Spielstart
            } else {
                showError('Zugriff auf Sensoren wurde verweigert.');
            }
        } catch (error) {
            console.error('Fehler bei iOS Berechtigungsanfrage:', error);
            showError('Fehler beim Zugriff auf Sensoren. Bitte stellen Sie sicher, dass Sie ein iOS Gerät verwenden und die Seite über HTTPS aufrufen.');
        }
    } else {
        showTutorial(); // Zeige Tutorial vor Spielstart
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

// Menu Toggle Functionality
function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    if (!menuToggle) {
        console.error('Menu toggle button not found');
        return;
    }

    // Touch-Event für bessere iOS-Unterstützung
    menuToggle.addEventListener('touchstart', toggleMenu, { passive: true });
    menuToggle.addEventListener('click', toggleMenu);

    // Event-Listener für den Home-Button
    document.getElementById('home-btn').addEventListener('click', () => {
        // Spiel stoppen falls es läuft
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        // Zurück zur Willkommensseite
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'block';
        // Menü schließen
        closeMenu();
    });
}

function toggleMenu(event) {
    event.preventDefault(); // Verhindert ungewollte Browser-Aktionen
    
    const nav = document.querySelector('.main-nav');
    if (!nav) {
        console.error('Navigation not found');
        return;
    }

    nav.classList.toggle('open');
    
    // Create or remove overlay
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        
        // Touch-Event für bessere iOS-Unterstützung
        overlay.addEventListener('touchstart', closeMenu, { passive: true });
        overlay.addEventListener('click', closeMenu);
    }
    overlay.classList.toggle('open');
}

function closeMenu() {
    const nav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.menu-overlay');
    
    if (nav) nav.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

// Initialisiere Menu Toggle nach dem DOM geladen ist
document.addEventListener('DOMContentLoaded', initMenuToggle);

// Tutorial schließen und Spiel starten
document.getElementById('tutorial-close').addEventListener('click', () => {
    closeTutorial();
}); 