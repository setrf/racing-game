// Utility functions for the racing game

// Game constants
const GAME_CONSTANTS = {
    CANVAS_WIDTH: 400,
    CANVAS_HEIGHT: 600,
    ROAD_WIDTH: 300,
    ROAD_LEFT_X: 50,
    LANE_WIDTH: 75,
    NUM_LANES: 4,
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 60,
    OBSTACLE_WIDTH: 40,
    OBSTACLE_HEIGHT: 60,
    BASE_OBSTACLE_SPEED: 3,
    SPEED_INCREMENT: 0.5,
    SPEED_INCREMENT_INTERVAL: 5000, // milliseconds
    OBSTACLE_SPAWN_INTERVAL: 1500, // milliseconds
    MIN_OBSTACLE_GAP: 150, // pixels
    NEAR_MISS_THRESHOLD: 10, // pixels
    NEAR_MISS_BONUS: 50,
    COMBO_TIMEOUT: 3000, // milliseconds to reset combo if no near miss
    COMPOUND_COMBO_MULTIPLIER: 1.5, // Multiplier for consecutive near misses
    
    // Power-up constants
    POWERUP_WIDTH: 30,
    POWERUP_HEIGHT: 30,
    POWERUP_SPAWN_INTERVAL: 10000, // milliseconds
    POWERUP_DURATION: 5000, // milliseconds
    POWERUP_POINTS_BONUS: 100
};

// Game state
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// Helper function to check if two rectangles collide
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Helper function to check for near miss
function checkNearMiss(rect1, rect2, threshold) {
    const horizOverlap = !(rect1.x + rect1.width < rect2.x || rect2.x + rect2.width < rect1.x);
    const vertDistance = Math.abs(rect1.y - rect2.y);
    
    return horizOverlap && vertDistance > 0 && vertDistance <= threshold;
}

// Helper function to generate random integers in a range
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random lane position
function getRandomLanePosition() {
    const laneIndex = randomInt(0, GAME_CONSTANTS.NUM_LANES - 1);
    return GAME_CONSTANTS.ROAD_LEFT_X + laneIndex * GAME_CONSTANTS.LANE_WIDTH + 
           (GAME_CONSTANTS.LANE_WIDTH - GAME_CONSTANTS.OBSTACLE_WIDTH) / 2;
}

// Local storage helpers
function saveHighScore(score) {
    const currentHighScore = getHighScore();
    if (score > currentHighScore) {
        localStorage.setItem('racingGameHighScore', score.toString());
        return true;
    }
    return false;
}

function getHighScore() {
    const highScore = localStorage.getItem('racingGameHighScore');
    return highScore ? parseInt(highScore, 10) : 0;
}

// Screen shake effect variables
let screenShake = {
    active: false,
    duration: 0,
    magnitude: 0,
    offsetX: 0,
    offsetY: 0
};

// Screen flash effect variables
let screenFlash = {
    active: false,
    duration: 0,
    color: 'rgba(255, 255, 255, 0.3)'
};

// Start screen shake
function startScreenShake(duration, magnitude) {
    screenShake.active = true;
    screenShake.duration = duration;
    screenShake.magnitude = magnitude;
}

// Start screen flash
function startScreenFlash(duration, color = 'rgba(255, 255, 255, 0.3)') {
    screenFlash.active = true;
    screenFlash.duration = duration;
    screenFlash.color = color;
}

// Update screen shake
function updateScreenShake(deltaTime) {
    if (!screenShake.active) return;
    
    screenShake.duration -= deltaTime;
    
    if (screenShake.duration <= 0) {
        screenShake.active = false;
        screenShake.offsetX = 0;
        screenShake.offsetY = 0;
    } else {
        screenShake.offsetX = randomInt(-screenShake.magnitude, screenShake.magnitude);
        screenShake.offsetY = randomInt(-screenShake.magnitude, screenShake.magnitude);
    }
}

// Update screen flash
function updateScreenFlash(deltaTime) {
    if (!screenFlash.active) return;
    
    screenFlash.duration -= deltaTime;
    
    if (screenFlash.duration <= 0) {
        screenFlash.active = false;
    }
}

// Apply screen shake to context
function applyScreenShake(ctx) {
    if (screenShake.active) {
        ctx.save();
        ctx.translate(screenShake.offsetX, screenShake.offsetY);
        return true;
    }
    return false;
}

// Apply screen flash to context
function applyScreenFlash(ctx) {
    if (screenFlash.active) {
        ctx.save();
        ctx.fillStyle = screenFlash.color;
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        ctx.restore();
    }
}

// Restore context after screen shake
function restoreScreenShake(ctx, wasShaking) {
    if (wasShaking) {
        ctx.restore();
    }
}

// Sound system using Web Audio API
let audioContext = null;

// Initialize audio context
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play a sound effect
function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioContext) initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Sound effects
const SoundEffects = {
    // Collision sound - low frequency noise
    collision: function() {
        playSound(100, 0.5, 'sawtooth', 0.4);
        setTimeout(() => playSound(80, 0.3, 'square', 0.3), 100);
    },
    
    // Near miss sound - quick beep
    nearMiss: function() {
        playSound(800, 0.1, 'sine', 0.2);
    },
    
    // Game over sound - descending tones
    gameOver: function() {
        playSound(400, 0.2, 'sine', 0.3);
        setTimeout(() => playSound(300, 0.2, 'sine', 0.3), 200);
        setTimeout(() => playSound(200, 0.3, 'sine', 0.3), 400);
    },
    
    // Button click sound
    buttonClick: function() {
        playSound(600, 0.05, 'sine', 0.2);
    },
    
    // Score increase sound
    scoreIncrease: function() {
        playSound(500, 0.1, 'sine', 0.15);
    },
    
    // Power-up collection sound
    powerUp: function() {
        playSound(800, 0.2, 'sine', 0.3);
        setTimeout(() => playSound(1000, 0.2, 'sine', 0.3), 100);
    }
};

// Draw road with lane markings
function drawRoad(ctx) {
    // Road background
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Road
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(GAME_CONSTANTS.ROAD_LEFT_X, 0, GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Road edges
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(GAME_CONSTANTS.ROAD_LEFT_X, 0);
    ctx.lineTo(GAME_CONSTANTS.ROAD_LEFT_X, GAME_CONSTANTS.CANVAS_HEIGHT);
    ctx.moveTo(GAME_CONSTANTS.ROAD_LEFT_X + GAME_CONSTANTS.ROAD_WIDTH, 0);
    ctx.lineTo(GAME_CONSTANTS.ROAD_LEFT_X + GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    ctx.stroke();
    
    // Lane markings (moving)
    const laneWidth = GAME_CONSTANTS.LANE_WIDTH;
    const roadLeft = GAME_CONSTANTS.ROAD_LEFT_X;
    const markingWidth = 5;
    const markingHeight = 20;
    const markingGap = 30;
    
    ctx.fillStyle = '#ffffff';
    for (let lane = 1; lane < GAME_CONSTANTS.NUM_LANES; lane++) {
        const x = roadLeft + lane * laneWidth - markingWidth / 2;
        
        // Animate the lane markings based on current game speed
        const offset = (Date.now() / 10) % (markingHeight + markingGap);
        
        for (let y = -offset - markingHeight; y < GAME_CONSTANTS.CANVAS_HEIGHT + markingHeight; y += markingHeight + markingGap) {
            ctx.fillRect(x, y, markingWidth, markingHeight);
        }
    }
}

// Particle class for visual effects
class Particle {
    constructor(x, y, color, velocity, lifetime) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.age = 0;
        this.size = randomInt(2, 5);
    }
    
    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.age += deltaTime;
        
        // Fade out as particle ages
        this.opacity = Math.max(0, 1 - (this.age / this.lifetime));
        
        return this.age < this.lifetime;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Particle system manager
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createNearMissEffect(x, y) {
        const particleCount = 15;
        const colors = ['#ffff00', '#ff9900', '#ff3300'];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = randomInt(1, 3);
            const color = colors[randomInt(0, colors.length - 1)];
            
            this.particles.push(new Particle(
                x,
                y,
                color,
                {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                500 // 500ms lifetime
            ));
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle.update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    reset() {
        this.particles = [];
    }
}

// Create a global particle system instance
let particleSystem = new ParticleSystem();