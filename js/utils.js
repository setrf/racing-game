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
    NEAR_MISS_BONUS: 50
};

// Game state
const GameState = {
    MENU: 'menu',
    COUNTDOWN: 'countdown',
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

// Start screen shake
function startScreenShake(duration, magnitude) {
    screenShake.active = true;
    screenShake.duration = duration;
    screenShake.magnitude = magnitude;
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

// Apply screen shake to context
function applyScreenShake(ctx) {
    if (screenShake.active) {
        ctx.save();
        ctx.translate(screenShake.offsetX, screenShake.offsetY);
        return true;
    }
    return false;
}

// Restore context after screen shake
function restoreScreenShake(ctx, wasShaking) {
    if (wasShaking) {
        ctx.restore();
    }
}

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

// Particle system for visual effects
class Particle {
    constructor(x, y, color, velocity, lifetime) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = Math.random() * 3 + 1;
    }
    
    update(deltaTime) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.lifetime -= deltaTime;
        
        // Fade out as lifetime decreases
        this.opacity = this.lifetime / this.maxLifetime;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    
    isDead() {
        return this.lifetime <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    emit(x, y, count, color, velocityRange) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * velocityRange.max + velocityRange.min;
            
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            
            const lifetime = Math.random() * 500 + 300; // 300-800ms lifetime
            
            this.particles.push(new Particle(x, y, color, velocity, lifetime));
        }
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    clear() {
        this.particles = [];
    }
}