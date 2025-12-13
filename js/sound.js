// Sound system for racing game

class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.currentMusic = null;
        this.currentEngine = null;
        this.audioContext = null;
        this.initialized = false;
        
        // Initialize audio context on first user interaction
        this.initAudioContext();
    }
    
    // Initialize Web Audio API
    initAudioContext() {
        // We'll initialize this on first user interaction to avoid browser restrictions
        this.createAudioContext = () => {
            if (!this.audioContext) {
                try {
                    window.AudioContext = window.AudioContext || window.webkitAudioContext;
                    this.audioContext = new AudioContext();
                    this.initialized = true;
                    this.initSounds();
                    
                    // Load settings
                    this.loadSettings();
                } catch (e) {
                    console.error('Web Audio API not supported:', e);
                }
            }
        };
    }
    
    // Ensure audio context is running (required by some browsers)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // Initialize all game sounds
    initSounds() {
        if (!this.initialized) return;
        
        // Create sound effects
        this.sounds.collision = () => this.createCollisionSound();
        this.sounds.nearMiss = () => this.createNearMissSound();
        this.sounds.score = () => this.createScoreSound();
        this.sounds.buttonClick = () => this.createButtonClickSound();
        this.sounds.powerUp = () => this.createPowerUpSound();
        this.sounds.engine = (speed = 1) => this.createEngineSound(speed);
        this.sounds.brake = () => this.createBrakeSound();
        this.sounds.gameOver = () => this.createGameOverSound();
        this.sounds.highScore = () => this.createHighScoreSound();
        this.sounds.achievement = () => this.createAchievementSound();
    }
    
    // Create collision sound effect
    createCollisionSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.7, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Create near miss sound effect
    createNearMissSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Create score increase sound effect
    createScoreSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Create a pleasant chord
        oscillator1.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, this.audioContext.currentTime); // E5
        
        oscillator1.type = 'sine';
        oscillator2.type = 'sine';
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator2.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.1);
        oscillator2.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Create button click sound effect
    createButtonClickSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
    
    // Create power-up sound effect
    createPowerUpSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(this.volume * 0.6, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Create engine sound effect
    createEngineSound(speed = 1) {
        if (!this.enabled || !this.initialized) return null;
        
        this.resumeAudioContext();
        
        // Stop any existing engine sound
        if (this.currentEngine) {
            this.stopEngineSound();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(60 * speed, this.audioContext.currentTime);
        
        filter.type = 'bandpass';
        filter.frequency.value = 200;
        filter.Q.value = 5;
        
        gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(this.audioContext.currentTime);
        
        // Store reference for later control
        this.currentEngine = { oscillator, gainNode, filter, speed };
        return this.currentEngine;
    }
    
    // Update engine sound based on speed
    updateEngineSound(speed = 1) {
        if (!this.currentEngine || !this.initialized) return;
        
        this.currentEngine.speed = speed;
        this.currentEngine.oscillator.frequency.exponentialRampToValueAtTime(
            60 * speed, 
            this.audioContext.currentTime + 0.1
        );
        
        // Adjust filter frequency for more realistic engine sound
        this.currentEngine.filter.frequency.exponentialRampToValueAtTime(
            100 + (speed * 150), 
            this.audioContext.currentTime + 0.1
        );
    }
    
    // Stop engine sound
    stopEngineSound() {
        if (!this.currentEngine || !this.initialized) return;
        
        this.currentEngine.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        setTimeout(() => {
            if (this.currentEngine) {
                this.currentEngine.oscillator.stop();
                this.currentEngine = null;
            }
        }, 100);
    }
    
    // Create brake sound effect
    createBrakeSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(5000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Create game over sound effect
    createGameOverSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    // Create high score sound effect
    createHighScoreSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        const notes = [523, 659, 784, 1047]; // C, E, G, C (one octave up)
        
        notes.forEach((frequency, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.2);
            }, index * 100);
        });
    }
    
    // Create achievement sound effect
    createAchievementSound() {
        if (!this.enabled || !this.initialized) return;
        
        this.resumeAudioContext();
        
        // Create a triumphant chord sequence
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(this.volume * 0.7, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            }, index * 100);
        });
    }
    
    // Start background music
    startBackgroundMusic(gameMode = 'normal') {
        if (!this.enabled || !this.initialized || this.currentMusic) return;
        
        this.resumeAudioContext();
        
        // Create a simple background music loop
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        // LFO for vibrato effect
        lfo.frequency.setValueAtTime(2 + (gameMode === 'intense' ? 3 : 0), this.audioContext.currentTime);
        lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        lfo.start(this.audioContext.currentTime);
        
        this.currentMusic = { oscillator, gainNode, lfo };
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (!this.currentMusic || !this.initialized) return;
        
        this.currentMusic.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
        
        setTimeout(() => {
            if (this.currentMusic) {
                this.currentMusic.oscillator.stop();
                this.currentMusic.lfo.stop();
                this.currentMusic = null;
            }
        }, 500);
    }
    
    // Play a sound by name
    play(soundName) {
        if (this.sounds[soundName]) {
            if (typeof this.sounds[soundName] === 'function') {
                this.sounds[soundName]();
            }
        }
    }
    
    // Play a sound effect (alias for compatibility)
    playSound(soundName) {
        this.play(soundName);
    }
    
    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        this.saveSettings();
        
        if (!this.enabled) {
            this.stopBackgroundMusic();
            this.stopEngineSound();
        }
        
        return this.enabled;
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        return this.volume;
    }
    
    // Set music volume (0.0 to 1.0)
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveSettings();
        
        if (this.currentMusic) {
            this.currentMusic.gainNode.gain.linearRampToValueAtTime(
                this.musicVolume * 0.1, 
                this.audioContext.currentTime + 0.1
            );
        }
        
        return this.musicVolume;
    }
    
    // Check if sound is enabled
    isEnabled() {
        return this.enabled;
    }
    
    // Get current volume
    getVolume() {
        return this.volume;
    }
    
    // Get current music volume
    getMusicVolume() {
        return this.musicVolume;
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('racingGameSoundSettings', JSON.stringify({
                enabled: this.enabled,
                volume: this.volume,
                musicVolume: this.musicVolume
            }));
        } catch (error) {
            console.warn("Failed to save sound settings:", error);
        }
    }
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('racingGameSoundSettings') || '{}');
            
            if (typeof settings.enabled === 'boolean') {
                this.enabled = settings.enabled;
            }
            
            if (typeof settings.volume === 'number') {
                this.volume = Math.max(0, Math.min(1, settings.volume));
            }
            
            if (typeof settings.musicVolume === 'number') {
                this.musicVolume = Math.max(0, Math.min(1, settings.musicVolume));
            }
        } catch (error) {
            console.warn("Failed to load sound settings:", error);
        }
    }
}

// SoundManager class will be instantiated in game.js

// Initialize audio context on first user interaction
function initAudioContext(soundManager) {
    if (!soundManager.initialized) {
        soundManager.createAudioContext();
        
        // Remove event listeners after initialization
        document.removeEventListener('click', initOnFirstInteraction);
        document.removeEventListener('touchstart', initOnFirstInteraction);
        document.removeEventListener('keydown', initOnFirstInteraction);
    }
}

// Set up listeners for first user interaction
window.addEventListener('load', () => {
    // initOnFirstInteraction function will be set up in game.js after soundManager is created
});