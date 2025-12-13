// Utility functions for racing game

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
    
    // Power-up constants
    POWER_UP_WIDTH: 40,
    POWER_UP_HEIGHT: 40,
    POWER_UP_SPAWN_INTERVAL: 8000 // milliseconds
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
        
        // Animate lane markings based on current game speed
        const offset = (Date.now() / 10) % (markingHeight + markingGap);
        
        for (let y = -offset - markingHeight; y < GAME_CONSTANTS.CANVAS_HEIGHT + markingHeight; y += markingHeight + markingGap) {
            ctx.fillRect(x, y, markingWidth, markingHeight);
        }
    }
}

// Get accessible color
function getAccessibleColor(colorName) {
    if (window.accessibilityColors && window.accessibilityColors[colorName]) {
        return window.accessibilityColors[colorName];
    }
    
    // Default colors if no mapping available
    const defaultColors = {
        red: '#ff4d4d',
        green: '#4dff4d',
        blue: '#4d79ff',
        yellow: '#ffcc33',
        orange: '#ff9900',
        purple: '#9900ff',
        cyan: '#00ffff'
    };
    
    return defaultColors[colorName] || colorName;
}

// Format score with commas
function formatScore(score) {
    return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Get formatted time from timestamp
function getFormattedTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

// Performance monitoring
let performanceMonitor = {
    fps: 0,
    frameCount: 0,
    lastTime: performance.now(),
    fpsHistory: [],
    maxFpsHistoryLength: 60,
    targetFPS: 60,
    lowPerformanceThreshold: 30,
    performanceMode: 'normal' // normal, reduced
};

// Update performance metrics
function updatePerformanceMonitor() {
    const now = performance.now();
    performanceMonitor.frameCount++;
    
    // Calculate FPS every second
    if (now - performanceMonitor.lastTime >= 1000) {
        performanceMonitor.fps = performanceMonitor.frameCount;
        performanceMonitor.fpsHistory.push(performanceMonitor.fps);
        
        // Keep only recent history
        if (performanceMonitor.fpsHistory.length > performanceMonitor.maxFpsHistoryLength) {
            performanceMonitor.fpsHistory.shift();
        }
        
        // Check if performance is low
        const avgFps = getAverageFPS();
        if (avgFps < performanceMonitor.lowPerformanceThreshold && performanceMonitor.performanceMode === 'normal') {
            console.warn(`Low performance detected: ${avgFps.toFixed(1)} FPS. Reducing visual effects.`);
            performanceMonitor.performanceMode = 'reduced';
            
            // Update visual effects performance mode
            if (typeof particleSystem !== 'undefined') {
                particleSystem.maxParticles = 50; // Reduce max particles
            }
        } else if (avgFps >= performanceMonitor.lowPerformanceThreshold * 1.5 && performanceMonitor.performanceMode === 'reduced') {
            console.log(`Performance improved: ${avgFps.toFixed(1)} FPS. Restoring visual effects.`);
            performanceMonitor.performanceMode = 'normal';
            
            // Update visual effects performance mode
            if (typeof particleSystem !== 'undefined') {
                particleSystem.maxParticles = 200; // Restore normal max
            }
        }
        
        performanceMonitor.frameCount = 0;
        performanceMonitor.lastTime = now;
    }
}

// Get average FPS over history
function getAverageFPS() {
    if (performanceMonitor.fpsHistory.length === 0) return 0;
    
    const sum = performanceMonitor.fpsHistory.reduce((acc, fps) => acc + fps, 0);
    return sum / performanceMonitor.fpsHistory.length;
}

// Get current performance mode
function getPerformanceMode() {
    return performanceMonitor.performanceMode;
}

// Game statistics tracking
let gameStats = {
    score: 0,
    gameTime: 0,
    nearMisses: 0,
    powerUpsCollected: 0,
    totalGames: 0,
    carType: 'sedan',
    environmentId: 0
};