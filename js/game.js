// Main game controller and loop

// DOM elements
let canvas, ctx;
let startScreen, gameOverScreen, pauseScreen, gameHUD;
let highScoreElement, currentScoreElement, hudHighScoreElement, finalScoreElement, newHighScoreElement;
let currentSpeedElement, comboMultiplierElement;
let startButton, restartButton;

// Game objects
let player;
let obstacleManager;

// Game state
let gameState = GameState.MENU;
let score = 0;
let highScore = 0;
let gameTime = 0;
let lastTime = 0;
let nearMissStreak = 0;
let comboMultiplier = 1;
let lastNearMissTime = 0;

// Initialize game when page loads
window.addEventListener('load', initGame);

// Initialize game
function initGame() {
    console.log('Initializing game...');
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Get UI elements
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    pauseScreen = document.getElementById('pauseScreen');
    gameHUD = document.getElementById('gameHUD');
    
    console.log('UI elements:', startScreen, gameOverScreen, pauseScreen, gameHUD);
    
    highScoreElement = document.getElementById('highScore');
    currentScoreElement = document.getElementById('currentScore');
    currentSpeedElement = document.getElementById('currentSpeed');
    comboMultiplierElement = document.getElementById('comboMultiplier');
    hudHighScoreElement = document.getElementById('hudHighScore');
    finalScoreElement = document.getElementById('finalScore');
    newHighScoreElement = document.querySelector('.new-high-score');
    
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    
    console.log('Button elements:', startButton, restartButton);
    
    // Initialize game objects
    player = new Player(1); // Start in middle lane
    obstacleManager = new ObstacleManager();
    
    // Load high score
    highScore = getHighScore();
    highScoreElement.textContent = highScore;
    hudHighScoreElement.textContent = highScore;
    
    // Set up event listeners
    setupEventListeners();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    console.log('Game initialized');
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Button clicks
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
}

// Handle keyboard input
function handleKeyDown(e) {
    if (gameState === GameState.PLAYING) {
        if (e.key === 'Escape') {
            pauseGame();
        } else {
            player.handleKeyDown(e.key);
        }
    } else if (gameState === GameState.PAUSED && e.key === 'Escape') {
        resumeGame();
    }
}

// Start a new game
function startGame() {
    console.log('Starting game...');
    // Reset game state
    gameState = GameState.PLAYING;
    score = 0;
    gameTime = 0;
    lastTime = performance.now();
    nearMissStreak = 0;
    comboMultiplier = 1;
    lastNearMissTime = 0;
    
    // Reset game objects
    player.reset();
    obstacleManager.reset();
    particleSystem.reset();
    
    // Update UI
    updateScore();
    
    console.log('Before class changes - startScreen.classList:', startScreen.classList.toString());
    startScreen.classList.add('hidden');
    console.log('After startScreen.classList:', startScreen.classList.toString());
    
    gameOverScreen.classList.add('hidden');
    gameHUD.classList.remove('hidden');
    console.log('gameHUD.classList:', gameHUD.classList.toString());
    
    console.log('Game started');
}

// Pause the game
function pauseGame() {
    if (gameState === GameState.PLAYING) {
        gameState = GameState.PAUSED;
        pauseScreen.classList.remove('hidden');
    }
}

// Resume the game
function resumeGame() {
    if (gameState === GameState.PAUSED) {
        gameState = GameState.PLAYING;
        pauseScreen.classList.add('hidden');
        lastTime = performance.now(); // Reset time to avoid big time jumps
    }
}

// Game over
function gameOver() {
    gameState = GameState.GAME_OVER;
    
    // Check for high score
    const isNewHighScore = saveHighScore(score);
    highScore = getHighScore();
    
    // Update UI
    finalScoreElement.textContent = score;
    
    if (isNewHighScore) {
        newHighScoreElement.classList.remove('hidden');
    } else {
        newHighScoreElement.classList.add('hidden');
    }
    
    gameHUD.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    // Screen shake effect
    startScreenShake(300, 5);
}

// Update score display
function updateScore() {
    currentScoreElement.textContent = score;
}

// Update speed display
function updateSpeed() {
    // Convert game speed to a more realistic km/h value
    const speedKmh = Math.round(obstacleManager.currentSpeed * 20);
    currentSpeedElement.textContent = speedKmh;
}

// Update combo display
function updateCombo() {
    comboMultiplierElement.textContent = `x${comboMultiplier.toFixed(1)}`;
    
    // Add a pulse effect to the combo text
    comboMultiplierElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        comboMultiplierElement.style.transform = 'scale(1)';
    }, 200);
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = lastTime ? timestamp - lastTime : 0;
    lastTime = timestamp;
    
    // Update game time
    if (gameState === GameState.PLAYING) {
        gameTime += deltaTime;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Draw road
    drawRoad(ctx);
    
    if (gameState === GameState.PLAYING) {
        // Update game objects
        player.update();
        obstacleManager.update(gameTime, deltaTime);
        
        // Update particle system
        particleSystem.update(deltaTime);
        
        // Check for collisions
        const collision = obstacleManager.checkCollisions(player);
        if (collision) {
            gameOver();
        }
        
        // Check for near misses
        const nearMiss = obstacleManager.checkNearMisses(player);
        if (nearMiss) {
            // Check if this near miss is within 2 seconds of the last one
            if (gameTime - lastNearMissTime < 2000) {
                comboMultiplier = Math.min(comboMultiplier + 0.5, 5); // Max 5x multiplier
            } else {
                comboMultiplier = 1; // Reset combo if too much time passed
            }
            
            const points = Math.round(GAME_CONSTANTS.NEAR_MISS_BONUS * comboMultiplier);
            score += points;
            nearMissStreak++;
            lastNearMissTime = gameTime;
            
            // Create particle effect at player position
            particleSystem.createNearMissEffect(
                player.x + player.width / 2,
                player.y + player.height / 2
            );
            
            // Update combo display
            updateCombo();
        }
        
        // Update score based on time survived
        if (gameTime % 100 < deltaTime) { // Every 100ms
            score++;
        }
        
        // Update score display
        updateScore();
        
        // Update speed display
        updateSpeed();
        
        // Reset combo if no near misses for 3 seconds
        if (lastNearMissTime > 0 && gameTime - lastNearMissTime > 3000) {
            comboMultiplier = 1;
            lastNearMissTime = 0;
            updateCombo();
        }
        
        // Log game state every second for debugging
        if (Math.floor(gameTime / 1000) !== Math.floor((gameTime - deltaTime) / 1000)) {
            console.log(`Game playing - Score: ${score}, Time: ${Math.floor(gameTime/1000)}s`);
        }
    }
    
    // Draw game objects
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.GAME_OVER) {
        // Apply screen shake if active
        const wasShaking = applyScreenShake(ctx);
        
        player.draw(ctx);
        obstacleManager.draw(ctx);
        
        // Draw particles
        particleSystem.draw(ctx);
        
        // Restore context after screen shake
        restoreScreenShake(ctx, wasShaking);
    }
    
    // Update screen shake
    updateScreenShake(deltaTime);
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}