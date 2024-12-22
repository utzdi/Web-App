// Fügt einen einfachen Hover-Effekt hinzu
document.getElementById('text').addEventListener('mouseover', function() {
    this.style.color = '#007bff';
});

document.getElementById('text').addEventListener('mouseout', function() {
    this.style.color = '#333';
});

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', (event) => {
        document.getElementById('x').textContent = event.acceleration.x?.toFixed(2) || 0;
        document.getElementById('y').textContent = event.acceleration.y?.toFixed(2) || 0;
        document.getElementById('z').textContent = event.acceleration.z?.toFixed(2) || 0;
    });
} else {
    document.getElementById('sensor-values').innerHTML = '<p>Ihr Gerät unterstützt keine Beschleunigungssensoren.</p>';
} 