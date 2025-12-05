// Player car object and controls

class Player {
    constructor(lane) {
        this.lane = lane || 1; // Middle lane by default (0-3)
        this.targetLane = this.lane;
        this.width = GAME_CONSTANTS.PLAYER_WIDTH;
        this.height = GAME_CONSTANTS.PLAYER_HEIGHT;
        this.x = this.calculateXPosition(this.lane);
        this.y = GAME_CONSTANTS.CANVAS_HEIGHT - this.height - 100; // Near bottom of screen
        this.moving = false;
        this.moveSpeed = 10; // Speed of lane change animation
        this.color = '#4d79ff'; // Blue car
    }
    
    // Calculate X position based on lane
    calculateXPosition(lane) {
        return GAME_CONSTANTS.ROAD_LEFT_X + lane * GAME_CONSTANTS.LANE_WIDTH + 
               (GAME_CONSTANTS.LANE_WIDTH - this.width) / 2;
    }
    
    // Move to a specific lane
    moveToLane(targetLane) {
        if (targetLane < 0 || targetLane >= GAME_CONSTANTS.NUM_LANES) return;
        if (this.moving) return;
        
        this.targetLane = targetLane;
        this.moving = true;
    }
    
    // Update player position for smooth lane transitions
    update() {
        if (this.moving) {
            const targetX = this.calculateXPosition(this.targetLane);
            const dx = targetX - this.x;
            
            if (Math.abs(dx) < this.moveSpeed) {
                this.x = targetX;
                this.lane = this.targetLane;
                this.moving = false;
            } else {
                this.x += dx > 0 ? this.moveSpeed : -this.moveSpeed;
            }
        }
    }
    
    // Draw the player car
    draw(ctx) {
        // Car body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Car front (windshield)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 15);
        
        // Car back
        ctx.fillRect(this.x + 5, this.y + this.height - 15, this.width - 10, 10);
        
        // Car sides (windows)
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x + 5, this.y + 25, this.width - 10, 20);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(this.x + 5, this.y + 5, 10, 5);
        ctx.fillRect(this.x + this.width - 15, this.y + 5, 10, 5);
        
        // Taillights
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(this.x + 5, this.y + this.height - 5, 10, 3);
        ctx.fillRect(this.x + this.width - 15, this.y + this.height - 5, 10, 3);
    }
    
    // Get player's collision rectangle
    getCollisionBox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Handle keyboard input
    handleKeyDown(key) {
        if (!this.moving) {
            if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && this.lane > 0) {
                this.moveToLane(this.lane - 1);
            } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && 
                      this.lane < GAME_CONSTANTS.NUM_LANES - 1) {
                this.moveToLane(this.lane + 1);
            }
        }
    }
    
    // Reset player to initial position
    reset() {
        this.lane = 1;
        this.targetLane = this.lane;
        this.x = this.calculateXPosition(this.lane);
        this.moving = false;
    }
}