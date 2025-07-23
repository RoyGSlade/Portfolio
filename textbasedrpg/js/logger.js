const textDisplay = document.getElementById('text-display');

export function log(message) {
    const p = document.createElement('p');
    p.textContent = message;
    p.className = 'fade-in'; // Apply animation
    textDisplay.innerHTML = ''; // Clear previous text
    textDisplay.appendChild(p);
}

export function clear() {
    textDisplay.innerHTML = '';
}