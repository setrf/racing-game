// Game modes system for the racing game

class GameMode {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.highScore = 0;
    }
    
    // Initialize game mode
    init() {
        // Override in subclasses
    }
    
    // Update game mode logic
    update(deltaTime, game) {
        // Override in subclasses
    }
    
    // Draw game mode specific elements
    draw(ctx) {
        // Override in subclasses
    }
    
    // Handle game over
    gameOver(game) {
        // Override in subclasses
    }
    
    // Get score display text
    getScoreDisplay(score) {
        return `Score: ${score}`;
    }
}

class EndlessMode extends GameMode {
    constructor() {
        super('endless', 'Endless', 'Survive as long as you can with increasing difficulty.');
    }
}

class TimeTrialMode extends GameMode {
    constructor() {
        super('timeTrial', 'Time Trial', 'Score as many points as possible in 60 seconds!');
        this.timeLimit = 60000; // 60 seconds in ms
        this.timeRemaining = this.timeLimit;
    }
    
    init() {
        this.timeRemaining = this.timeLimit;
    }
    
    update(deltaTime, game) {
        if (gameState === GameState.PLAYING) {
            this.timeRemaining -= deltaTime;
            
            if (this.timeRemaining <= 0) {
                this.timeRemaining = 0;
                gameOver();
            }
        }
    }
    
    draw(ctx) {
        // Draw timer
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        
        const timeSeconds = Math.ceil(this.timeRemaining / 1000);
        ctx.fillText(`Time: ${timeSeconds}s`, GAME_CONSTANTS.CANVAS_WIDTH / 2, 40);
        
        // Draw timer bar
        const barWidth = 200;
        const barHeight = 10;
        const barX = (GAME_CONSTANTS.CANVAS_WIDTH - barWidth) / 2;
        const barY = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Timer fill
        const percentComplete = 1 - (this.timeRemaining / this.timeLimit);
        const fillColor = this.timeRemaining < 10000 ? '#ff4d4d' : '#4dff4d';
        ctx.fillStyle = fillColor;
        ctx.fillRect(barX, barY, barWidth * percentComplete, barHeight);
    }
    
    getScoreDisplay(score) {
        return `Score: ${score}`;
    }
}

class ChallengeMode extends GameMode {
    constructor() {
        super('challenge', 'Challenge', 'Complete specific challenges to earn rewards!');
        this.currentChallenge = null;
        this.challenges = this.createChallenges();
        this.completedChallenges = [];
        this.challengeIndex = 0;
    }
    
    createChallenges() {
        return [
            {
                id: 'survive30',
                name: 'Survive 30 Seconds',
                description: 'Survive for 30 seconds',
                condition: (game) => gameTime >= 30000,
                reward: 'shield'
            },
            {
                id: 'dodge10',
                name: 'Dodge 10 Cars',
                description: 'Successfully dodge 10 cars',
                condition: (game) => game.carsDodged >= 10,
                reward: 'speedBoost'
            },
            {
                id: 'score100',
                name: 'Score 100 Points',
                description: 'Score 100 points',
                condition: (game) => score >= 100,
                reward: 'scoreMultiplier'
            },
            {
                id: 'nearMiss5',
                name: '5 Near Misses',
                description: 'Get 5 near miss bonuses',
                condition: (game) => game.nearMissStreak >= 5,
                reward: 'slowMotion'
            },
            {
                id: 'combo3',
                name: '3x Combo',
                description: 'Get a 3x combo',
                condition: (game) => game.combo >= 3,
                reward: 'clear'
            }
        ];
    }
    
    init() {
        // Reset stats
        game.carsDodged = 0;
        game.combo = 0;
        game.nearMissStreak = 0;
        
        // Set first challenge
        this.challengeIndex = 0;
        this.currentChallenge = this.challenges[this.challengeIndex];
    }
    
    update(deltaTime, game) {
        if (!this.currentChallenge) return;
        
        // Check if challenge is completed
        if (this.currentChallenge.condition(game)) {
            this.completeChallenge(game);
        }
    }
    
    completeChallenge(game) {
        if (!this.currentChallenge) return;
        
        // Mark challenge as completed
        this.completedChallenges.push(this.currentChallenge.id);
        
        // Award reward
        if (this.currentChallenge.reward && typeof powerUpManager !== 'undefined') {
            powerUpManager.activateEffect(this.currentChallenge.reward, 10000);
        }
        
        // Show notification
        if (typeof game.showNotification === 'function') {
            game.showNotification('Challenge Complete! Next challenge unlocked.');
        }
        
        // Move to next challenge
        this.challengeIndex++;
        if (this.challengeIndex < this.challenges.length) {
            this.currentChallenge = this.challenges[this.challengeIndex];
        } else {
            // All challenges completed
            this.currentChallenge = null;
            if (typeof game.showNotification === 'function') {
                game.showNotification('All challenges complete! You are a master racer!');
            }
            
            // End game after all challenges
            setTimeout(() => {
                if (gameState === GameState.PLAYING) {
                    gameOver();
                }
            }, 2000);
        }
    }
    
    draw(ctx) {
        // Draw current challenge
        if (!this.currentChallenge) return;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentChallenge.name, GAME_CONSTANTS.CANVAS_WIDTH / 2, 30);
        
        ctx.font = '14px Arial';
        ctx.fillText(this.currentChallenge.description, GAME_CONSTANTS.CANVAS_WIDTH / 2, 50);
        
        // Draw progress indicator
        const progress = this.challengeIndex / this.challenges.length;
        const barWidth = 200;
        const barHeight = 5;
        const barX = (GAME_CONSTANTS.CANVAS_WIDTH - barWidth) / 2;
        const barY = 60;
        
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#4dff4d';
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    }
    
    getScoreDisplay(score) {
        return `Score: ${score} | Challenge: ${this.challengeIndex + 1}/${this.challenges.length}`;
    }
}

class ZenMode extends GameMode {
    constructor() {
        super('zen', 'Zen', 'Relaxing mode without collisions or pressure.');
        this.hasCollisions = false;
    }
    
    update(deltaTime, game) {
        // Override collision detection
        if (gameState === GameState.PLAYING && typeof obstacleManager !== 'undefined') {
            const collision = obstacleManager.checkCollisions(player);
            if (collision) {
                // Instead of game over, create a visual effect and remove obstacle
                if (typeof particleSystem !== 'undefined') {
                    particleSystem.createExplosion(
                        collision.x + collision.width/2,
                        collision.y + collision.height/2,
                        { count: 10, colors: ['#ffffff', '#4d79ff'] }
                    );
                }
                
                // Remove collided obstacle
                const index = obstacleManager.obstacles.indexOf(collision);
                if (index > -1) {
                    obstacleManager.obstacles.splice(index, 1);
                }
                
                // Add points instead of game over
                score += 10;
            }
        }
    }
    
    draw(ctx) {
        // Draw zen mode indicator
        ctx.fillStyle = '#4dff4d';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Zen Mode', GAME_CONSTANTS.CANVAS_WIDTH / 2, 30);
    }
    
    getScoreDisplay(score) {
        return `Relaxation Points: ${score}`;
    }
}

class GameModeManager {
    constructor() {
        this.modes = new Map();
        this.currentModeId = 'endless';
        this.currentMode = null;
        
        this.initModes();
    }
    
    initModes() {
        this.modes.set('endless', new EndlessMode());
        this.modes.set('timeTrial', new TimeTrialMode());
        this.modes.set('challenge', new ChallengeMode());
        this.modes.set('zen', new ZenMode());
        
        // Set default mode
        this.currentMode = this.modes.get(this.currentModeId);
        
        // Load high scores
        this.loadHighScores();
    }
    
    // Get all available modes
    getAllModes() {
        return Array.from(this.modes.values());
    }
    
    // Select a game mode
    selectMode(modeId) {
        if (this.modes.has(modeId)) {
            this.currentModeId = modeId;
            this.currentMode = this.modes.get(modeId);
            return true;
        }
        return false;
    }
    
    // Get current game mode
    getCurrentMode() {
        return this.currentMode;
    }
    
    // Get current mode ID
    getCurrentModeId() {
        return this.currentModeId;
    }
    
    // Initialize current mode
    initCurrentMode() {
        if (this.currentMode) {
            this.currentMode.init();
        }
    }
    
    // Update current mode
    updateCurrentMode(deltaTime, game) {
        if (this.currentMode) {
            this.currentMode.update(deltaTime, game);
        }
    }
    
    // Draw current mode
    drawCurrentMode(ctx) {
        if (this.currentMode) {
            this.currentMode.draw(ctx);
        }
    }
    
    // Handle game over in current mode
    handleGameOver(game) {
        if (this.currentMode) {
            this.currentMode.gameOver(game);
        }
    }
    
    // Get score display for current mode
    getScoreDisplay(score) {
        if (this.currentMode) {
            return this.currentMode.getScoreDisplay(score);
        }
        return `Score: ${score}`;
    }
    
    // Load high scores
    loadHighScores() {
        for (const [id, mode] of this.modes.entries()) {
            const score = localStorage.getItem(`racingGameHighScore_${id}`);
            if (score) {
                mode.highScore = parseInt(score, 10);
            }
        }
    }
    
    // Save high scores
    saveHighScores() {
        for (const [id, mode] of this.modes.entries()) {
            localStorage.setItem(`racingGameHighScore_${id}`, mode.highScore.toString());
        }
    }
    
    // Get high score for a mode
    getHighScore(modeId) {
        if (this.modes.has(modeId)) {
            return this.modes.get(modeId).highScore;
        }
        return 0;
    }
    
    // Update high score for a mode
    updateHighScore(modeId, score) {
        if (this.modes.has(modeId)) {
            const mode = this.modes.get(modeId);
            if (score > mode.highScore) {
                mode.highScore = score;
                this.saveHighScores();
                return true; // New high score
            }
        }
        return false;
    }
}

// GameModeManager class will be instantiated in game.js