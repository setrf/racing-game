// Obstacle system for the racing game

class Obstacle {
    constructor(lane, speed, type = 'car') {
        this.lane = lane;
        this.x = this.calculateXPosition(lane);
        this.y = -GAME_CONSTANTS.OBSTACLE_HEIGHT;
        this.width = GAME_CONSTANTS.OBSTACLE_WIDTH;
        this.height = GAME_CONSTANTS.OBSTACLE_HEIGHT;
        this.speed = speed;
        this.type = type;
        this.color = this.getColorByType();
        this.passedPlayer = false; // For scoring
    }
    
    // Calculate X position based on lane
    calculateXPosition(lane) {
        return GAME_CONSTANTS.ROAD_LEFT_X + lane * GAME_CONSTANTS.LANE_WIDTH + 
               (GAME_CONSTANTS.LANE_WIDTH - this.width) / 2;
    }
    
    // Get color based on obstacle type
    getColorByType() {
        switch(this.type) {
            case 'car':
                const colors = ['#ff3333', '#ff9933', '#9933ff', '#33ff99'];
                return colors[Math.floor(Math.random() * colors.length)];
            case 'truck':
                return '#666666';
            case 'barrier':
                return '#ffcc00';
            default:
                return '#ff3333';
        }
    }
    
    // Update obstacle position
    update(speedMultiplier = 1.0) {
        this.y += this.speed * speedMultiplier;
    }
    
    // Draw the obstacle
    draw(ctx) {
        switch(this.type) {
            case 'car':
                this.drawCar(ctx);
                break;
            case 'truck':
                this.drawTruck(ctx);
                break;
            case 'barrier':
                this.drawBarrier(ctx);
                break;
            default:
                this.drawCar(ctx);
        }
    }
    
    // Draw a car obstacle
    drawCar(ctx) {
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Car front (facing down)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + 5, this.y + this.height - 20, this.width - 10, 15);
        
        // Car back
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 10);
        
        // Car sides (windows)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, 15);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(this.x + 5, this.y + this.height - 8, 10, 5);
        ctx.fillRect(this.x + this.width - 15, this.y + this.height - 8, 10, 5);
    }
    
    // Draw a truck obstacle
    drawTruck(ctx) {
        // Truck body (slightly taller)
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height + 20);
        
        // Truck cabin
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.x, this.y + this.height, this.width, 20);
        
        // stripes
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(this.x, this.y + 10, this.width, 3);
        ctx.fillRect(this.x, this.y + this.height - 10, this.width, 3);
    }
    
    // Draw a road barrier obstacle
    drawBarrier(ctx) {
        // Barrier body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Warning stripes
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(this.x, this.y + i * 15, this.width, 5);
        }
    }
    
    // Check if obstacle is off screen
    isOffScreen() {
        return this.y > GAME_CONSTANTS.CANVAS_HEIGHT;
    }
    
    // Get obstacle's collision rectangle
    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.type === 'truck' ? this.height + 20 : this.height
        };
    }
}

class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = GAME_CONSTANTS.OBSTACLE_SPAWN_INTERVAL;
        this.baseSpeed = GAME_CONSTANTS.BASE_OBSTACLE_SPEED;
        this.currentSpeed = this.baseSpeed;
        this.lastSpeedIncrease = 0;
        this.speedIncreaseInterval = GAME_CONSTANTS.SPEED_INCREMENT_INTERVAL;
    }
    
    // Update obstacle manager
    update(currentTime, deltaTime, speedMultiplier = 1.0) {
        // Update speed of obstacles over time
        if (currentTime - this.lastSpeedIncrease > this.speedIncreaseInterval) {
            this.currentSpeed += GAME_CONSTANTS.SPEED_INCREMENT;
            this.lastSpeedIncrease = currentTime;
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(speedMultiplier);
            
            // Remove obstacles that have gone off screen
            if (obstacle.isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Spawn new obstacles
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnObstacle();
            this.lastSpawnTime = currentTime;
        }
    }
    
    // Spawn a new obstacle
    spawnObstacle() {
        // Determine which lanes already have obstacles to avoid stacking
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
        
        // Determine obstacle type
        const rand = Math.random();
        let type = 'car';
        if (rand > 0.85) {
            type = 'truck';
        } else if (rand > 0.9) {
            type = 'barrier';
        }
        
        // Create the new obstacle
        const obstacle = new Obstacle(lane, this.currentSpeed, type);
        this.obstacles.push(obstacle);
    }
    
    // Get lanes that currently have obstacles
    getOccupiedLanes() {
        const occupiedLanes = new Set();
        const minGap = GAME_CONSTANTS.MIN_OBSTACLE_GAP;
        
        for (const obstacle of this.obstacles) {
            if (obstacle.y < minGap) {
                occupiedLanes.add(obstacle.lane);
            }
        }
        
        return occupiedLanes;
    }
    
    // Draw all obstacles
    draw(ctx) {
        for (const obstacle of this.obstacles) {
            obstacle.draw(ctx);
        }
    }
    
    // Check for collisions with player
    checkCollisions(player) {
        const playerBox = player.getCollisionBox();
        
        for (const obstacle of this.obstacles) {
            const obstacleBox = obstacle.getCollisionBox();
            
            if (checkCollision(playerBox, obstacleBox)) {
                return obstacle;
            }
        }
        
        return null;
    }
    
    // Check for near misses with player
    checkNearMisses(player) {
        const playerBox = player.getCollisionBox();
        const nearMisses = [];
        
        for (const obstacle of this.obstacles) {
            const obstacleBox = obstacle.getCollisionBox();
            
            // Check if obstacle has just passed the player (for scoring)
            if (!obstacle.passedPlayer && obstacleBox.y > playerBox.y + playerBox.height) {
                obstacle.passedPlayer = true;
                nearMisses.push(obstacle);
            }
            
            // Check for near miss bonus
            if (checkNearMiss(playerBox, obstacleBox, GAME_CONSTANTS.NEAR_MISS_THRESHOLD)) {
                return true; // Near miss detected
            }
        }
        
        return false;
    }
    
    // Reset obstacle manager for new game
    reset() {
        this.obstacles = [];
        this.lastSpawnTime = 0;
        this.currentSpeed = this.baseSpeed;
        this.lastSpeedIncrease = 0;
    }
}