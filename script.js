// Event-Listener für den Start-Button
document.getElementById('start-btn').addEventListener('click', async () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('sensor-screen').style.display = 'block';
    
    // Prüfen ob es ein iOS Gerät ist (iOS 13+)
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            // Berechtigungsanfrage für iOS
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                startAccelerationTracking();
                showReadings();
            } else {
                showError('Zugriff auf Sensoren wurde verweigert.');
            }
        } catch (error) {
            console.error('Fehler bei iOS Berechtigungsanfrage:', error);
            showError('Fehler beim Zugriff auf Sensoren. Bitte stellen Sie sicher, dass Sie ein iOS Gerät verwenden und die Seite über HTTPS aufrufen.');
        }
    } else {
        // Für Android und andere Geräte
        startAccelerationTracking();
        showReadings();
    }
});

// Funktion zum Starten der Beschleunigungsverfolgung
function startAccelerationTracking() {
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', (event) => {
            // Wir nutzen accelerationIncludingGravity, da es zuverlässiger ist
            const accel = event.accelerationIncludingGravity;
            if (accel) {
                document.getElementById('x').textContent = accel.x?.toFixed(2) || 0;
                document.getElementById('y').textContent = accel.y?.toFixed(2) || 0;
                document.getElementById('z').textContent = accel.z?.toFixed(2) || 0;
            }
        });
    } else {
        showError('Ihr Gerät unterstützt keine Beschleunigungssensoren.');
    }
}

// Hilfsfunktionen für die UI
function showReadings() {
    document.getElementById('readings').style.display = 'block';
}

function showError(message) {
    document.getElementById('sensor-screen').innerHTML = `<p style="color: red;">${message}</p>`;
} 