// Main game controller and loop

// DOM elements
let canvas, ctx;
let startScreen, gameOverScreen, pauseScreen, gameHUD, countdownScreen;
let highScoreElement, currentScoreElement, hudHighScoreElement, finalScoreElement, newHighScoreElement;
let currentSpeedElement, countdownNumberElement, distanceTraveledElement;
let startButton, restartButton;

// Game objects
let player;
let obstacleManager;
let particleSystem;

// Game state
let gameState = GameState.MENU;
let score = 0;
let highScore = 0;
let gameTime = 0;
let lastTime = 0;
let nearMissStreak = 0;
let distanceTraveled = 0;

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
    countdownScreen = document.getElementById('countdownScreen');
    
    console.log('UI elements:', startScreen, gameOverScreen, pauseScreen, gameHUD, countdownScreen);
    
    highScoreElement = document.getElementById('highScore');
    currentScoreElement = document.getElementById('currentScore');
    hudHighScoreElement = document.getElementById('hudHighScore');
    finalScoreElement = document.getElementById('finalScore');
    newHighScoreElement = document.querySelector('.new-high-score');
    currentSpeedElement = document.getElementById('currentSpeed');
    countdownNumberElement = document.getElementById('countdownNumber');
    distanceTraveledElement = document.getElementById('distanceTraveled');
    
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    
    console.log('Button elements:', startButton, restartButton);
    
    // Initialize game objects
    player = new Player(1); // Start in middle lane
    obstacleManager = new ObstacleManager();
    particleSystem = new ParticleSystem();
    
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
    } else if (gameState === GameState.COUNTDOWN) {
        // Allow player to move during countdown
        player.handleKeyDown(e.key);
    } else if (gameState === GameState.GAME_OVER && (e.key === 'r' || e.key === 'R')) {
        startGame();
    } else if (gameState === GameState.MENU && (e.key === 'r' || e.key === 'R')) {
        startGame();
    }
}

// Start a new game
function startGame() {
    console.log('Starting game...');
    // Reset game state
    gameState = GameState.COUNTDOWN;
    score = 0;
    gameTime = 0;
    lastTime = performance.now();
    nearMissStreak = 0;
    distanceTraveled = 0;
    
    // Reset game objects
    player.reset();
    obstacleManager.reset();
    particleSystem.clear();
    
    // Update UI
    updateScore();
    
    console.log('Before class changes - startScreen.classList:', startScreen.classList.toString());
    startScreen.classList.add('hidden');
    console.log('After startScreen.classList:', startScreen.classList.toString());
    
    gameOverScreen.classList.add('hidden');
    gameHUD.classList.remove('hidden');
    countdownScreen.classList.remove('hidden');
    console.log('gameHUD.classList:', gameHUD.classList.toString());
    
    // Start countdown
    startCountdown();
    
    console.log('Game started with countdown');
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
    const speedKmh = Math.floor(obstacleManager.currentSpeed * 20);
    currentSpeedElement.textContent = speedKmh;
}

// Update distance display
function updateDistance() {
    // Calculate distance based on game speed and time
    // Speed is in pixels per frame, convert to meters
    const speedMps = (obstacleManager.currentSpeed * 0.1); // Convert to meters per second
    distanceTraveled += speedMps * (deltaTime / 1000); // Add distance for this frame
    
    // Display in meters
    const distanceMeters = Math.floor(distanceTraveled);
    distanceTraveledElement.textContent = distanceMeters;
}

// Start countdown before game begins
function startCountdown() {
    let count = 3;
    countdownNumberElement.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        
        if (count > 0) {
            countdownNumberElement.textContent = count;
        } else if (count === 0) {
            countdownNumberElement.textContent = 'GO!';
            countdownNumberElement.style.color = '#4dff4d'; // Green for GO
        } else {
            clearInterval(countdownInterval);
            countdownScreen.classList.add('hidden');
            gameState = GameState.PLAYING;
            lastTime = performance.now(); // Reset time to avoid big time jumps
        }
    }, 1000);
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
        particleSystem.update(deltaTime);
        
        // Check for collisions
        const collision = obstacleManager.checkCollisions(player);
        if (collision) {
            gameOver();
        }
        
        // Check for near misses
        const nearMiss = obstacleManager.checkNearMisses(player);
        if (nearMiss) {
            score += GAME_CONSTANTS.NEAR_MISS_BONUS;
            nearMissStreak++;
            
            // Create particle effect for near miss
            const playerBox = player.getCollisionBox();
            const x = playerBox.x + playerBox.width / 2;
            const y = playerBox.y + playerBox.height / 2;
            
            particleSystem.emit(
                x, y, 
                10, // particle count
                '#ffff00', // yellow color for near miss
                { min: 1, max: 3 } // velocity range
            );
        }
        
        // Update score based on time survived
        if (gameTime % 100 < deltaTime) { // Every 100ms
            score++;
        }
        
        // Update score display
        updateScore();
        
        // Update speed display
        updateSpeed();
        
        // Update distance display
        updateDistance();
        
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
        particleSystem.draw(ctx);
        
        // Restore context after screen shake
        restoreScreenShake(ctx, wasShaking);
    }
    
    // Update screen shake
    updateScreenShake(deltaTime);
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}