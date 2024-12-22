// Fügt einen einfachen Hover-Effekt hinzu
document.getElementById('text').addEventListener('mouseover', function() {
    this.style.color = '#007bff';
});

document.getElementById('text').addEventListener('mouseout', function() {
    this.style.color = '#333';
}); 