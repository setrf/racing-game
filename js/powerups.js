// Power-ups system for racing game

class PowerUp {
    constructor(lane, type) {
        this.lane = lane;
        this.type = type;
        this.x = this.calculateXPosition(lane);
        this.y = -POWER_UP_CONSTANTS.HEIGHT;
        this.width = POWER_UP_CONSTANTS.WIDTH;
        this.height = POWER_UP_CONSTANTS.HEIGHT;
        this.speed = GAME_CONSTANTS.BASE_OBSTACLE_SPEED;
        this.collected = false;
        this.pulsePhase = 0;
        
        // Set properties based on type
        this.setupByType();
    }
    
    // Calculate X position based on lane
    calculateXPosition(lane) {
        return GAME_CONSTANTS.ROAD_LEFT_X + lane * GAME_CONSTANTS.LANE_WIDTH + 
               (GAME_CONSTANTS.LANE_WIDTH - this.width) / 2;
    }
    
    // Setup properties based on power-up type
    setupByType() {
        switch (this.type) {
            case 'shield':
                this.color = '#4db8ff';
                this.icon = '🛡️';
                this.duration = 5000; // 5 seconds
                this.name = 'Shield';
                break;
                
            case 'speedBoost':
                this.color = '#ff4d4d';
                this.icon = '⚡';
                this.duration = 3000; // 3 seconds
                this.name = 'Speed Boost';
                break;
                
            case 'slowMotion':
                this.color = '#9900ff';
                this.icon = '⏱️';
                this.duration = 4000; // 4 seconds
                this.name = 'Slow Motion';
                break;
                
            case 'scoreMultiplier':
                this.color = '#00ff00';
                this.icon = '×2';
                this.duration = 10000; // 10 seconds
                this.name = 'Score ×2';
                break;
                
            case 'clear':
                this.color = '#ff4dff';
                this.icon = '💥';
                this.duration = 0; // Instant effect
                this.name = 'Clear Road';
                break;
                
            default:
                this.color = '#ffffff';
                this.icon = '?';
                this.duration = 3000;
                this.name = 'Unknown';
        }
    }
    
    // Update power-up position and animation
    update() {
        this.y += this.speed;
        this.pulsePhase += 0.1;
    }
    
    // Draw power-up
    draw(ctx) {
        if (this.collected) return;
        
        ctx.save();
        
        // Pulsing effect
        const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.1;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.scale(pulseScale, pulseScale);
        ctx.translate(-centerX, -centerY);
        
        // Draw glowing effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Draw power-up background
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw power-up icon
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, centerX, centerY);
        
        ctx.restore();
    }
    
    // Check if power-up is off screen
    isOffScreen() {
        return this.y > GAME_CONSTANTS.CANVAS_HEIGHT;
    }
    
    // Get power-up's collision rectangle
    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class PowerUpManager {
    constructor() {
        this.powerUps = [];
        this.activeEffects = new Map();
        this.lastSpawnTime = 0;
        this.spawnInterval = POWER_UP_CONSTANTS.SPAWN_INTERVAL;
    }
    
    // Update power-up manager
    update(currentTime, deltaTime) {
        // Update existing power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            // Remove power-ups that have gone off screen
            if (powerUp.isOffScreen() || powerUp.collected) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Update active effects
        this.updateActiveEffects(deltaTime);
        
        // Spawn new power-ups
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnPowerUp();
            this.lastSpawnTime = currentTime;
        }
    }
    
    // Spawn a new power-up
    spawnPowerUp() {
        // Check which lanes are occupied
        const occupiedLanes = this.getOccupiedLanes();
        
        // Find available lanes
        const availableLanes = [];
        for (let lane = 0; lane < GAME_CONSTANTS.NUM_LANES; lane++) {
            if (!occupiedLanes.has(lane)) {
                availableLanes.push(lane);
            }
        }
        
        // If all lanes are occupied, skip spawning
        if (availableLanes.length === 0) return;
        
        // Choose a random available lane
        const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        
        // Choose a random power-up type
        const types = ['shield', 'speedBoost', 'slowMotion', 'scoreMultiplier', 'clear'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // Create new power-up
        const powerUp = new PowerUp(lane, type);
        this.powerUps.push(powerUp);
    }
    
    // Get lanes that currently have obstacles or power-ups
    getOccupiedLanes() {
        const occupiedLanes = new Set();
        const minGap = GAME_CONSTANTS.MIN_OBSTACLE_GAP;
        
        // Check obstacles
        if (typeof obstacleManager !== 'undefined') {
            for (const obstacle of obstacleManager.obstacles) {
                if (obstacle.y < minGap) {
                    occupiedLanes.add(obstacle.lane);
                }
            }
        }
        
        // Check existing power-ups
        for (const powerUp of this.powerUps) {
            if (powerUp.y < minGap) {
                occupiedLanes.add(powerUp.lane);
            }
        }
        
        return occupiedLanes;
    }
    
    // Update active power-up effects
    updateActiveEffects(deltaTime) {
        for (const [type, effect] of this.activeEffects.entries()) {
            effect.timeRemaining -= deltaTime;
            
            if (effect.timeRemaining <= 0) {
                // Remove expired effect
                this.deactivateEffect(type);
                this.activeEffects.delete(type);
            }
        }
    }
    
    // Activate a power-up effect
    activateEffect(type, duration) {
        // If effect is already active, just reset timer
        if (this.activeEffects.has(type)) {
            const existingEffect = this.activeEffects.get(type);
            existingEffect.timeRemaining = Math.max(existingEffect.timeRemaining, duration || this.getPowerUpDuration(type));
            return;
        }
        
        // Create effect object
        const effect = {
            type: type,
            name: this.getPowerUpName(type),
            color: this.getPowerUpColor(type),
            timeRemaining: duration || this.getPowerUpDuration(type),
            duration: duration || this.getPowerUpDuration(type)
        };
        
        // Apply immediate effects
        this.applyEffect(type);
        
        // Add to active effects
        this.activeEffects.set(type, effect);
        
        // Create particle effect
        if (typeof particleSystem !== 'undefined') {
            const centerX = GAME_CONSTANTS.CANVAS_WIDTH / 2;
            const centerY = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
            
            if (type === 'speedBoost') {
                particleSystem.createSpeedBoost(centerX, centerY);
            } else if (type === 'clear') {
                particleSystem.createExplosion(centerX, centerY, { count: 30 });
            } else {
                particleSystem.createSparkles(centerX, centerY, { 
                    color: effect.color, 
                    count: 20 
                });
            }
        }
        
        // Play sound
        if (typeof soundManager !== 'undefined') {
            soundManager.play('powerUp');
        }
    }
    
    // Apply the immediate effects of a power-up
    applyEffect(type) {
        if (typeof player === 'undefined') return;
        
        switch (type) {
            case 'shield':
                player.shielded = true;
                break;
            case 'speedBoost':
                player.speedBoosted = true;
                break;
            case 'slowMotion':
                if (typeof obstacleManager !== 'undefined') {
                    obstacleManager.currentSpeed *= 0.5;
                }
                break;
            case 'scoreMultiplier':
                player.scoreMultiplier = 2;
                break;
            case 'clear':
                this.clearAllObstacles();
                break;
        }
    }
    
    // Deactivate a power-up effect
    deactivateEffect(type) {
        if (typeof player === 'undefined') return;
        
        switch (type) {
            case 'shield':
                player.shielded = false;
                break;
            case 'speedBoost':
                player.speedBoosted = false;
                break;
            case 'slowMotion':
                if (typeof obstacleManager !== 'undefined') {
                    obstacleManager.currentSpeed *= 2; // Restore original speed
                }
                break;
            case 'scoreMultiplier':
                player.scoreMultiplier = 1;
                break;
        }
    }
    
    // Clear all obstacles (for clear power-up)
    clearAllObstacles() {
        if (typeof obstacleManager === 'undefined') return;
        
        // Create explosion effects for each lane
        for (let lane = 0; lane < GAME_CONSTANTS.NUM_LANES; lane++) {
            const x = GAME_CONSTANTS.ROAD_LEFT_X + lane * GAME_CONSTANTS.LANE_WIDTH + GAME_CONSTANTS.LANE_WIDTH / 2;
            const y = GAME_CONSTANTS.CANVAS_HEIGHT / 2;
            
            if (typeof particleSystem !== 'undefined') {
                particleSystem.createExplosion(x, y, { count: 30 });
            }
        }
        
        // Clear obstacles
        obstacleManager.obstacles = [];
        
        if (typeof soundManager !== 'undefined') {
            soundManager.play('collision');
        }
    }
    
    // Check for power-up collection
    checkPowerUpCollection(player) {
        const playerBox = player.getCollisionBox();
        
        for (const powerUp of this.powerUps) {
            if (powerUp.collected) continue;
            
            const powerUpBox = powerUp.getCollisionBox();
            
            if (checkCollision(playerBox, powerUpBox)) {
                powerUp.collected = true;
                this.activateEffect(powerUp.type, powerUp.duration);
                
                // Increment power-ups collected stat for achievements
                if (typeof gameStats !== 'undefined') {
                    gameStats.powerUpsCollected = (gameStats.powerUpsCollected || 0) + 1;
                }
                
                return powerUp;
            }
        }
        
        return null;
    }
    
    // Check if an effect is active
    isEffectActive(type) {
        return this.activeEffects.has(type);
    }
    
    // Get remaining duration for an effect
    getEffectDuration(type) {
        if (!this.activeEffects.has(type)) return 0;
        return this.activeEffects.get(type).timeRemaining;
    }
    
    // Draw all power-ups
    draw(ctx) {
        for (const powerUp of this.powerUps) {
            powerUp.draw(ctx);
        }
        
        // Draw active effects indicators
        this.drawActiveEffects(ctx);
    }
    
    // Draw active power-up effects
    drawActiveEffects(ctx) {
        let yOffset = 50;
        
        for (const [type, effect] of this.activeEffects.entries()) {
            // Draw effect background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, yOffset - 5, 150, 35);
            
            // Draw effect icon
            ctx.fillStyle = effect.color;
            ctx.fillRect(10, yOffset, 20, 20);
            
            // Draw effect name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(effect.name, 40, yOffset + 15);
            
            // Draw timer bar
            const timerWidth = 80;
            const timerHeight = 6;
            const timerPercent = effect.timeRemaining / effect.duration;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(40, yOffset + 20, timerWidth, timerHeight);
            
            ctx.fillStyle = effect.color;
            ctx.fillRect(40, yOffset + 20, timerWidth * timerPercent, timerHeight);
            
            yOffset += 40;
        }
    }
    
    // Get power-up name
    getPowerUpName(type) {
        const names = {
            'shield': 'Shield',
            'speedBoost': 'Speed Boost',
            'slowMotion': 'Slow Motion',
            'scoreMultiplier': 'Score ×2',
            'clear': 'Clear Road'
        };
        return names[type] || 'Unknown';
    }
    
    // Get power-up color
    getPowerUpColor(type) {
        const colors = {
            'shield': '#4db8ff',
            'speedBoost': '#ff4d4d',
            'slowMotion': '#9900ff',
            'scoreMultiplier': '#00ff00',
            'clear': '#ff4dff'
        };
        return colors[type] || '#ffffff';
    }
    
    // Get base duration for a power-up type
    getPowerUpDuration(type) {
        const durations = {
            'shield': 5000,
            'speedBoost': 3000,
            'slowMotion': 4000,
            'scoreMultiplier': 10000,
            'clear': 100
        };
        return durations[type] || 3000;
    }
    
    // Reset power-up manager for new game
    reset() {
        this.powerUps = [];
        this.lastSpawnTime = 0;
        
        // Clear all active effects
        for (const type of this.activeEffects.keys()) {
            this.deactivateEffect(type);
        }
        this.activeEffects.clear();
    }
}

// Power-up constants
const POWER_UP_CONSTANTS = {
    WIDTH: 40,
    HEIGHT: 40,
    SPAWN_INTERVAL: 8000 // milliseconds
};

// PowerUpManager class will be instantiated in game.js