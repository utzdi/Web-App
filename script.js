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

// Geräteerkennung
function isAndroid() {
    return /Android/i.test(navigator.userAgent);
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
            if (isAndroid()) {
                // Android-Steuerung (invertiert)
                if (dampedX < 0 && direction !== 'left') direction = 'right';
                if (dampedX > 0 && direction !== 'right') direction = 'left';
            } else {
                // iOS-Steuerung (original)
                if (dampedX > 0 && direction !== 'left') direction = 'right';
                if (dampedX < 0 && direction !== 'right') direction = 'left';
            }
        }
    } else {
        if (Math.abs(dampedY) > MOTION_THRESHOLD) {
            if (isAndroid()) {
                // Android-Steuerung (invertiert)
                if (dampedY < 0 && direction !== 'down') direction = 'up';
                if (dampedY > 0 && direction !== 'up') direction = 'down';
            } else {
                // iOS-Steuerung (original)
                if (dampedY > 0 && direction !== 'down') direction = 'up';
                if (dampedY < 0 && direction !== 'up') direction = 'down';
            }
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

// Fehlermeldung anzeigen
function showError(message) {
    const gameScreen = document.getElementById('game-screen');
    gameScreen.innerHTML = `
        <div class="device-error">
            <span class="material-icons error-icon">phone_iphone</span>
            <h2>Nur auf Mobilgeräten verfügbar</h2>
            <p>${message}</p>
            <button id="back-to-start-btn">Zurück zum Start</button>
        </div>
    `;

    // Event-Listener für den Zurück-Button
    document.getElementById('back-to-start-btn').addEventListener('click', () => {
        gameScreen.style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'block';
    });
}

// Event-Listener für den Start-Button
document.getElementById('start-btn').addEventListener('click', async () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Prüfen ob DeviceMotion verfügbar ist
    if (window.DeviceMotionEvent) {
        // Prüfen ob es ein iOS Gerät ist (iOS 13+)
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                if (permissionState === 'granted') {
                    showTutorial();
                } else {
                    showError('Bitte erlaube den Zugriff auf die Bewegungssensoren, um das Spiel spielen zu können.');
                }
            } catch (error) {
                console.error('Fehler bei iOS Berechtigungsanfrage:', error);
                showError('Dieses Spiel funktioniert nur auf mobilen Geräten. Bitte öffne die Seite auf deinem Smartphone oder Tablet.');
            }
        } else {
            // Test ob Bewegungssensoren tatsächlich Daten liefern
            let hasMotionData = false;
            const motionTest = (event) => {
                if (event.accelerationIncludingGravity && 
                    (event.accelerationIncludingGravity.x !== null || 
                     event.accelerationIncludingGravity.y !== null || 
                     event.accelerationIncludingGravity.z !== null)) {
                    hasMotionData = true;
                }
            };

            window.addEventListener('devicemotion', motionTest, { once: true });

            // Prüfe nach kurzer Zeit, ob Daten empfangen wurden
            setTimeout(() => {
                window.removeEventListener('devicemotion', motionTest);
                if (hasMotionData) {
                    showTutorial();
                } else {
                    showError('Dieses Spiel funktioniert nur auf mobilen Geräten. Bitte öffne die Seite auf deinem Smartphone oder Tablet.');
                }
            }, 1000);
        }
    } else {
        showError('Dieses Spiel funktioniert nur auf mobilen Geräten. Bitte öffne die Seite auf deinem Smartphone oder Tablet.');
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

// Menu Toggle Functionality
function toggleMenu() {
    const nav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.menu-overlay');
    
    if (!nav || !overlay) return;

    nav.classList.toggle('open');
    overlay.classList.toggle('open');
}

function initMenuToggle() {
    const menuToggle = document.getElementById('menu-toggle');
    if (!menuToggle) {
        console.error('Menu toggle button not found');
        return;
    }

    // Erstelle den Overlay einmalig beim Start
    const overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    // Event-Listener für den Menu-Button
    menuToggle.addEventListener('click', toggleMenu);
    
    // Event-Listener für den Overlay
    overlay.addEventListener('click', toggleMenu);

    // Event-Listener für den Home-Button
    document.getElementById('home-btn').addEventListener('click', () => {
        // Spiel stoppen falls es läuft
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        // Zurück zur Willkommensseite
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'block';
        
        // Aktiven Button aktualisieren
        updateActiveNavButton('home-btn');
        
        // Menü schließen
        const nav = document.querySelector('.main-nav');
        const overlay = document.querySelector('.menu-overlay');
        if (nav && overlay) {
            nav.classList.remove('open');
            overlay.classList.remove('open');
        }
    });

    // Event-Listener für den Settings-Button
    document.getElementById('settings-btn').addEventListener('click', () => {
        // Spiel stoppen falls es läuft
        if (gameLoop) {
            clearInterval(gameLoop);
        }
        // Einstellungen anzeigen
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('tutorial').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('settings-screen').style.display = 'block';
        
        // Aktiven Button aktualisieren
        updateActiveNavButton('settings-btn');
        
        // Menü schließen
        const nav = document.querySelector('.main-nav');
        const overlay = document.querySelector('.menu-overlay');
        if (nav && overlay) {
            nav.classList.remove('open');
            overlay.classList.remove('open');
        }
    });
}

// Hilfsfunktion zum Aktualisieren des aktiven Navigations-Buttons
function updateActiveNavButton(activeId) {
    // Alle Buttons deaktivieren
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Aktiven Button markieren
    document.getElementById(activeId).classList.add('active');
}

// Initialisiere Menu Toggle nach dem DOM geladen ist
document.addEventListener('DOMContentLoaded', initMenuToggle);

// Tutorial schließen und Spiel starten
document.getElementById('tutorial-close').addEventListener('click', () => {
    closeTutorial();
});

// Dark Mode Funktionalität
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;

    // Gespeicherte Einstellung laden
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    toggle.checked = isDarkMode;
    updateTheme(isDarkMode);

    // Event Listener für Toggle
    toggle.addEventListener('change', (e) => {
        updateTheme(e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
    });
}

function updateTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// Initialisiere Dark Mode nach dem DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    initMenuToggle();
    initDarkMode();
}); 