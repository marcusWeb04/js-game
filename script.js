// État du jeu
let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let bestScore = parseInt(localStorage.getItem('simon-best-score') || '0');
let isPlaying = false;
let isShowingSequence = false;
let currentStep = 0;

// Configuration
const colors = ['red', 'green', 'blue', 'yellow'];
const soundFrequencies = { red: 220, green: 330, blue: 440, yellow: 550 };

// Éléments DOM
const buttons = document.querySelectorAll('.simon-button');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const messageDisplay = document.getElementById('message');

// Utilitaires
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function updateDisplay() {
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
    bestScoreDisplay.textContent = bestScore;
}

function showMessage(text, type = '') {
    messageDisplay.textContent = text;
    messageDisplay.className = `message ${type}`;
}

function toggleButtons(enable) {
    buttons.forEach(button => {
        button.classList.toggle('disabled', !enable);
    });
}

function playSound(color) {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(soundFrequencies[color], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

async function highlightButton(color) {
    const button = document.querySelector(`[data-color="${color}"]`);
    button.classList.add('active');
    playSound(color);
    
    await delay(400);
    button.classList.remove('active');
}

async function showSequence() {
    isShowingSequence = true;
    toggleButtons(false);
    
    await delay(500);
    
    for (const color of sequence) {
        await delay(300);
        await highlightButton(color);
    }
    
    isShowingSequence = false;
    toggleButtons(true);
    showMessage("À votre tour !");
}

function nextRound() {
    playerSequence = [];
    currentStep = 0;
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    
    showSequence();
}

async function gameOver() {
    isPlaying = false;
    toggleButtons(false);
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('simon-best-score', bestScore.toString());
        showMessage(`Nouveau record ! Score: ${score}`, 'success');
    } else {
        showMessage(`Game Over ! Score: ${score}`, 'error');
    }
    
    updateDisplay();
    startBtn.disabled = false;
    startBtn.textContent = "Rejouer";
    
    // Animation de fin
    for (let i = 0; i < 3; i++) {
        buttons.forEach(button => button.classList.add('active'));
        await delay(200);
        buttons.forEach(button => button.classList.remove('active'));
        await delay(200);
    }
}

function handlePlayerInput(color) {
    playerSequence.push(color);
    highlightButton(color);
    
    if (color !== sequence[currentStep]) {
        gameOver();
        return;
    }
    
    currentStep++;
    
    if (currentStep === sequence.length) {
        score += level * 10;
        level++;
        updateDisplay();
        
        showMessage("Bravo ! Niveau suivant...", 'success');
        
        setTimeout(nextRound, 1500);
    }
}

function startGame() {
    isPlaying = true;
    sequence = [];
    level = 1;
    score = 0;
    updateDisplay();
    showMessage("Mémoriser la séquence...");
    
    startBtn.disabled = true;
    nextRound();
}

function resetGame() {
    isPlaying = false;
    isShowingSequence = false;
    sequence = [];
    playerSequence = [];
    level = 1;
    score = 0;
    currentStep = 0;
    
    toggleButtons(true);
    updateDisplay();
    showMessage("Cliquez sur \"Commencer\" pour jouer !");
    
    startBtn.disabled = false;
    startBtn.textContent = "Commencer";
}

// Event listeners
function initGame() {
    updateDisplay();
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            if (!isPlaying || isShowingSequence) return;
            handlePlayerInput(e.target.dataset.color);
        });
    });
    
    // Contrôles clavier optionnels
    const keyMap = { 'q': 'red', 'w': 'green', 'o': 'blue', 'p': 'yellow' };
    
    document.addEventListener('keydown', (e) => {
        if (!isPlaying || isShowingSequence) return;
        
        const color = keyMap[e.key.toLowerCase()];
        if (color) handlePlayerInput(color);
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', initGame);
