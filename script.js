/**
 * Classe principale du jeu Simon
 * Gère toute la logique du jeu, les interactions utilisateur et l'affichage
 */
class SimonGame {
    constructor() {
        // État du jeu
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.currentStep = 0;
        
        // Éléments DOM
        this.buttons = document.querySelectorAll('.simon-button');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.levelDisplay = document.getElementById('level');
        this.scoreDisplay = document.getElementById('score');
        this.bestScoreDisplay = document.getElementById('best-score');
        this.messageDisplay = document.getElementById('message');
        
        // Configuration
        this.colors = ['red', 'green', 'blue', 'yellow'];
        this.soundFrequencies = {
            red: 220,
            green: 330,
            blue: 440,
            yellow: 550
        };
        
        this.init();
    }
    
    /**
     * Initialise le jeu
     */
    init() {
        this.updateDisplay();
        this.addEventListeners();
    }
    
    /**
     * Ajoute tous les event listeners nécessaires
     */
    addEventListeners() {
        // Boutons de contrôle
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        // Boutons du Simon
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!this.isPlaying || this.isShowingSequence) return;
                
                const color = e.target.dataset.color;
                this.handlePlayerInput(color);
            });
        });
        
        // Gestion du clavier (optionnel)
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isShowingSequence) return;
            
            const keyMap = {
                'q': 'red',
                'w': 'green',
                'o': 'blue',
                'p': 'yellow'
            };
            
            if (keyMap[e.key.toLowerCase()]) {
                this.handlePlayerInput(keyMap[e.key.toLowerCase()]);
            }
        });
    }
    
    /**
     * Démarre une nouvelle partie
     */
    startGame() {
        this.isPlaying = true;
        this.sequence = [];
        this.level = 1;
        this.score = 0;
        this.updateDisplay();
        this.showMessage("Mémoriser la séquence...", "");
        
        this.startBtn.disabled = true;
        this.nextRound();
    }
    
    /**
     * Passe au niveau suivant
     */
    nextRound() {
        this.playerSequence = [];
        this.currentStep = 0;
        
        // Ajouter une nouvelle couleur à la séquence
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.sequence.push(randomColor);
        
        this.showSequence();
    }
    
    /**
     * Affiche la séquence à mémoriser
     */
    async showSequence() {
        this.isShowingSequence = true;
        this.disableButtons();
        
        // Petit délai avant de commencer
        await this.delay(500);
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.delay(300);
            await this.highlightButton(this.sequence[i]);
        }
        
        this.isShowingSequence = false;
        this.enableButtons();
        this.showMessage("À votre tour !", "");
    }
    
    /**
     * Met en surbrillance un bouton avec son et animation
     * @param {string} color - La couleur du bouton à mettre en surbrillance
     */
    async highlightButton(color) {
        const button = document.querySelector(`[data-color="${color}"]`);
        button.classList.add('active');
        this.playSound(color);
        
        await this.delay(400);
        button.classList.remove('active');
    }
    
    /**
     * Gère l'input du joueur
     * @param {string} color - La couleur cliquée par le joueur
     */
    handlePlayerInput(color) {
        this.playerSequence.push(color);
        this.highlightButton(color);
        
        // Vérifier si la couleur est correcte
        if (color !== this.sequence[this.currentStep]) {
            this.gameOver();
            return;
        }
        
        this.currentStep++;
        
        // Vérifier si le joueur a terminé la séquence
        if (this.currentStep === this.sequence.length) {
            this.score += this.level * 10;
            this.level++;
            this.updateDisplay();
            
            this.showMessage("Bravo ! Niveau suivant...", "success");
            
            setTimeout(() => {
                this.nextRound();
            }, 1500);
        }
    }
    
    /**
     * Gère la fin de partie
     */
    gameOver() {
        this.isPlaying = false;
        this.disableButtons();
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
            this.showMessage(`Nouveau record ! Score: ${this.score}`, "success");
        } else {
            this.showMessage(`Game Over ! Score: ${this.score}`, "error");
        }
        
        this.updateDisplay();
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Rejouer";
        
        // Animation de fin
        this.flashAllButtons();
    }
    
    /**
     * Remet le jeu à zéro
     */
    resetGame() {
        this.isPlaying = false;
        this.isShowingSequence = false;
        this.sequence = [];
        this.playerSequence = [];
        this.level = 1;
        this.score = 0;
        this.currentStep = 0;
        
        this.enableButtons();
        this.updateDisplay();
        this.showMessage("Cliquez sur \"Commencer\" pour jouer !", "");
        
        this.startBtn.disabled = false;
        this.startBtn.textContent = "Commencer";
    }
    
    /**
     * Met à jour l'affichage des scores et du niveau
     */
    updateDisplay() {
        this.levelDisplay.textContent = this.level;
        this.scoreDisplay.textContent = this.score;
        this.bestScoreDisplay.textContent = this.bestScore;
    }
    
    /**
     * Affiche un message à l'utilisateur
     * @param {string} text - Le texte à afficher
     * @param {string} type - Le type de message (success, error, etc.)
     */
    showMessage(text, type) {
        this.messageDisplay.textContent = text;
        this.messageDisplay.className = `message ${type}`;
    }
    
    /**
     * Désactive tous les boutons du Simon
     */
    disableButtons() {
        this.buttons.forEach(button => {
            button.classList.add('disabled');
        });
    }
    
    /**
     * Active tous les boutons du Simon
     */
    enableButtons() {
        this.buttons.forEach(button => {
            button.classList.remove('disabled');
        });
    }
    
    /**
     * Animation de clignotement de tous les boutons (game over)
     */
    async flashAllButtons() {
        const flashCount = 3;
        for (let i = 0; i < flashCount; i++) {
            this.buttons.forEach(button => button.classList.add('active'));
            await this.delay(200);
            this.buttons.forEach(button => button.classList.remove('active'));
            await this.delay(200);
        }
    }
    
    /**
     * Génère un son pour une couleur donnée avec Web Audio API
     * @param {string} color - La couleur pour laquelle jouer le son
     */
    playSound(color) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(this.soundFrequencies[color], audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
    
    /**
     * Utilitaire pour créer un délai
     * @param {number} ms - Nombre de millisecondes à attendre
     * @returns {Promise} - Promise qui se résout après le délai
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Charge le meilleur score depuis le localStorage
     * @returns {number} - Le meilleur score sauvegardé
     */
    loadBestScore() {
        return parseInt(localStorage.getItem('simon-best-score') || '0');
    }
    
    /**
     * Sauvegarde le meilleur score dans le localStorage
     */
    saveBestScore() {
        localStorage.setItem('simon-best-score', this.bestScore.toString());
    }
}

// Initialisation du jeu quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new SimonGame();
});