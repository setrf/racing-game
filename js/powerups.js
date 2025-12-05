// Power-up system for the racing game

class PowerUp {
    constructor(lane, speed) {
        this.lane = lane;
        this.x = this.calculateXPosition(lane);
        this.y = -GAME_CONSTANTS.POWERUP_HEIGHT;
        this.width = GAME_CONSTANTS.POWERUP_WIDTH;
        this.height = GAME_CONSTANTS.POWERUP_HEIGHT;
        this.speed = speed;
        this.type = this.getRandomType();
        this.collected = false;
    }
    
    // Calculate X position based on lane
    calculateXPosition(lane) {
        return GAME_CONSTANTS.ROAD_LEFT_X + lane * GAME_CONSTANTS.LANE_WIDTH + 
               (GAME_CONSTANTS.LANE_WIDTH - this.width) / 2;
    }
    
    // Get a random power-up type
    getRandomType() {
        const types = ['shield', 'slowmo', 'points'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    // Update power-up position
    update() {
        this.y += this.speed;
    }
    
    // Draw the power-up
    draw(ctx) {
        if (this.collected) return;
        
        switch(this.type) {
            case 'shield':
                this.drawShield(ctx);
                break;
            case 'slowmo':
                this.drawSlowMo(ctx);
                break;
            case 'points':
                this.drawPoints(ctx);
                break;
        }
    }
    
    // Draw shield power-up
    drawShield(ctx) {
        // Shield icon
        ctx.fillStyle = '#00ccff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height/2);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
        
        // Inner shield
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + 10);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height/2);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 10);
        ctx.lineTo(this.x + 10, this.y + this.height - 10);
        ctx.lineTo(this.x + 10, this.y + this.height/2);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw slow motion power-up
    drawSlowMo(ctx) {
        // Clock icon
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Clock hands
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x + this.width/2, this.y + 10);
        ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height/2);
        ctx.stroke();
    }
    
    // Draw points power-up
    drawPoints(ctx) {
        // Star icon
        ctx.fillStyle = '#00ff00';
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        const spikes = 5;
        const outerRadius = this.width/2;
        const innerRadius = outerRadius/2;
        
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = centerX + Math.cos(angle - Math.PI/2) * radius;
            const y = centerY + Math.sin(angle - Math.PI/2) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
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
        this.lastSpawnTime = 0;
        this.spawnInterval = GAME_CONSTANTS.POWERUP_SPAWN_INTERVAL;
        this.activeEffects = {
            shield: false,
            slowmo: false,
            shieldEndTime: 0,
            slowmoEndTime: 0
        };
    }
    
    // Update power-up manager
    update(currentTime, deltaTime, gameSpeed) {
        // Update existing power-ups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            // Remove power-ups that have gone off screen
            if (powerUp.isOffScreen() || powerUp.collected) {
                this.powerUps.splice(i, 1);
            }
        }
        
        // Spawn new power-ups
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnPowerUp(gameSpeed);
            this.lastSpawnTime = currentTime;
        }
        
        // Check for expired effects
        this.checkExpiredEffects(currentTime);
    }
    
    // Spawn a new power-up
    spawnPowerUp(gameSpeed) {
        // Choose a random lane
        const lane = Math.floor(Math.random() * GAME_CONSTANTS.NUM_LANES);
        
        // Create the new power-up
        const powerUp = new PowerUp(lane, gameSpeed);
        this.powerUps.push(powerUp);
    }
    
    // Draw all power-ups
    draw(ctx) {
        for (const powerUp of this.powerUps) {
            powerUp.draw(ctx);
        }
    }
    
    // Check for collisions with player
    checkCollisions(player) {
        const playerBox = player.getCollisionBox();
        
        for (const powerUp of this.powerUps) {
            if (powerUp.collected) continue;
            
            const powerUpBox = powerUp.getCollisionBox();
            
            if (checkCollision(playerBox, powerUpBox)) {
                powerUp.collected = true;
                this.activateEffect(powerUp.type);
                return powerUp;
            }
        }
        
        return null;
    }
    
    // Activate a power-up effect
    activateEffect(type) {
        const currentTime = performance.now();
        const duration = GAME_CONSTANTS.POWERUP_DURATION;
        
        switch(type) {
            case 'shield':
                this.activeEffects.shield = true;
                this.activeEffects.shieldEndTime = currentTime + duration;
                SoundEffects.powerUp();
                break;
            case 'slowmo':
                this.activeEffects.slowmo = true;
                this.activeEffects.slowmoEndTime = currentTime + duration;
                SoundEffects.powerUp();
                break;
            case 'points':
                // Instant bonus points
                game.score += GAME_CONSTANTS.POWERUP_POINTS_BONUS;
                SoundEffects.powerUp();
                break;
        }
    }
    
    // Check for expired effects
    checkExpiredEffects(currentTime) {
        if (this.activeEffects.shield && currentTime > this.activeEffects.shieldEndTime) {
            this.activeEffects.shield = false;
        }
        
        if (this.activeEffects.slowmo && currentTime > this.activeEffects.slowmoEndTime) {
            this.activeEffects.slowmo = false;
        }
    }
    
    // Check if shield is active
    hasShield() {
        return this.activeEffects.shield;
    }
    
    // Check if slow motion is active
    hasSlowMo() {
        return this.activeEffects.slowmo;
    }
    
    // Get remaining time for effects (in seconds)
    getRemainingEffectTime(type) {
        const currentTime = performance.now();
        
        switch(type) {
            case 'shield':
                if (!this.activeEffects.shield) return 0;
                return Math.max(0, Math.floor((this.activeEffects.shieldEndTime - currentTime) / 1000));
            case 'slowmo':
                if (!this.activeEffects.slowmo) return 0;
                return Math.max(0, Math.floor((this.activeEffects.slowmoEndTime - currentTime) / 1000));
            default:
                return 0;
        }
    }
    
    // Reset power-up manager for new game
    reset() {
        this.powerUps = [];
        this.lastSpawnTime = 0;
        this.activeEffects = {
            shield: false,
            slowmo: false,
            shieldEndTime: 0,
            slowmoEndTime: 0
        };
    }
}
