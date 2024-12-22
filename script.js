// Funktion zum Anfordern der Berechtigung (für iOS 13+)
async function requestPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permissionState = await DeviceMotionEvent.requestPermission();
            if (permissionState === 'granted') {
                startAccelerationTracking();
            } else {
                document.getElementById('sensor-values').innerHTML = '<p>Zugriff auf Sensoren wurde verweigert.</p>';
            }
        } catch (error) {
            console.error('Fehler beim Anfordern der Berechtigung:', error);
        }
    } else {
        // Für Geräte, die keine Berechtigung benötigen
        startAccelerationTracking();
    }
}

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
        document.getElementById('sensor-values').innerHTML = '<p>Ihr Gerät unterstützt keine Beschleunigungssensoren.</p>';
    }
}

// Starte die Sensoren beim Laden der Seite
requestPermission(); 