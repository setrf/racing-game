// Main game controller and loop

// DOM elements
let canvas, ctx;
let startScreen, gameOverScreen, pauseScreen, gameHUD;
let highScoreElement, currentScoreElement, hudHighScoreElement, finalScoreElement, newHighScoreElement;
let startButton, restartButton;

// Game objects
let player, obstacleManager, powerUpManager, environmentManager;
let vehicleManager, gameModeManager;
let soundManager, particleSystem;
let touchControls;
let accessibilityManager;
let achievementManager, leaderboardManager;

// Game state
let gameState = GameState.MENU;
let score = 0;
let highScore = 0;
let gameTime = 0;
let lastTime = 0;
let nearMissStreak = 0;

// Settings elements
let settingsButton, achievementsButton, leaderboardButton;
let settingsModal, achievementsModal, leaderboardModal;
let currentGameModeSelect, environmentSelect, vehicleSelection;

// Initialize game when page loads
window.addEventListener('load', () => {
    try {
        // Show loading screen
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingProgress = document.getElementById('loadingProgress');

        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }

        // Simulate loading progress
        if (loadingProgress) {
            let progress = 0;
            const loadingInterval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(loadingInterval);

                    // Initialize game after loading completes
                    setTimeout(() => {
                        initGame();
                        if (loadingScreen) {
                            loadingScreen.classList.add('hidden');
                        }
                        console.log('Game initialized successfully');
                    }, 300);
                }
                loadingProgress.style.width = `${progress}%`;
            }, 200);
        } else {
            // Fallback if loading elements not found
            initGame();
            console.log('Game initialized successfully');
        }
    } catch (error) {
        console.error('Failed to initialize game:', error);
        // Hide loading screen and show error
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }

        // Show error message to user
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h2>Game Failed to Load</h2>
                <p>There was an error loading the game. Please refresh the page.</p>
                <button onclick="location.reload()">Refresh Page</button>
                <details style="margin-top: 20px; text-align: left;">
                    <summary>Error Details</summary>
                    <pre>${error.stack}</pre>
                </details>
            </div>
        `;
    }
});

// Initialize game
function initGame() {
    console.log('Initializing enhanced racing game...');

    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    ctx = canvas.getContext('2d');
    console.log('Canvas and context initialized');
    
    // Get UI elements
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    pauseScreen = document.getElementById('pauseScreen');
    gameHUD = document.getElementById('gameHUD');
    
    highScoreElement = document.getElementById('highScore');
    currentScoreElement = document.getElementById('currentScore');
    hudHighScoreElement = document.getElementById('hudHighScore');
    finalScoreElement = document.getElementById('finalScore');
    newHighScoreElement = document.querySelector('.new-high-score');
    
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    
    // Settings buttons
    settingsButton = document.getElementById('settingsButton');
    achievementsButton = document.getElementById('achievementsButton');
    leaderboardButton = document.getElementById('leaderboardButton');
    
    // Initialize managers
    console.log('Initializing game managers...');
    player = new Player(1);
    console.log('Player initialized');

    obstacleManager = new ObstacleManager();
    console.log('ObstacleManager initialized');

    powerUpManager = new PowerUpManager();
    console.log('PowerUpManager initialized');

    environmentManager = new EnvironmentManager();
    console.log('EnvironmentManager initialized');

    vehicleManager = new VehicleManager();
    console.log('VehicleManager initialized');

    gameModeManager = new GameModeManager();
    console.log('GameModeManager initialized');

    soundManager = new SoundManager();
    console.log('SoundManager initialized');

    particleSystem = new ParticleSystem();
    console.log('ParticleSystem initialized');

    touchControls = new TouchControls(canvas);
    console.log('TouchControls initialized');

    accessibilityManager = new AccessibilityManager();
    console.log('AccessibilityManager initialized');

    achievementManager = new AchievementManager();
    console.log('AchievementManager initialized');

    leaderboardManager = new LeaderboardManager();
    console.log('LeaderboardManager initialized');

    console.log('All managers initialized successfully');
    
    // Set up accessibility UI controls
    accessibilityManager.setupUIControls();
    
    // Initialize audio context on first user interaction
    const initOnFirstInteraction = () => {
        if (!soundManager.initialized) {
            soundManager.createAudioContext();

            // Show audio enabled notification
            showNotification('Sound enabled! 🎵', 'success');

            // Remove event listeners after initialization
            document.removeEventListener('click', initOnFirstInteraction);
            document.removeEventListener('touchstart', initOnFirstInteraction);
            document.removeEventListener('keydown', initOnFirstInteraction);
        }
    };
    
    // Set up listeners for first user interaction
    document.addEventListener('click', initOnFirstInteraction);
    document.addEventListener('touchstart', initOnFirstInteraction);
    document.addEventListener('keydown', initOnFirstInteraction);
    
    // Initialize all managers
    vehicleManager.updatePlayerStats(player);
    environmentManager.loadUnlockedEnvironments();
    vehicleManager.load();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize game modes UI
    initGameModesUI();
    
    // Initialize environment selection UI
    initEnvironmentSelectionUI();
    
    // Initialize vehicle selection UI
    initVehicleSelectionUI();
    
    // Set up modal event listeners
    setupModalEventListeners();
    
    // Start performance monitoring
    updatePerformanceMonitor();

    // Test save system
    if (testSaveSystem()) {
        console.log('Save system initialized successfully');
    }

    console.log('Game initialized with all features');
}

// Set up event listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Button clicks
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    
    // Settings buttons
    settingsButton.addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
    });
    
    achievementsButton.addEventListener('click', () => {
        document.getElementById('achievementsModal').classList.remove('hidden');
        updateAchievementsUI();
    });
    
    leaderboardButton.addEventListener('click', () => {
        document.getElementById('leaderboardModal').classList.remove('hidden');
        updateLeaderboardUI();
    });
}

// Initialize game modes UI
function initGameModesUI() {
    const modeButtons = document.querySelectorAll('.mode-option');
    
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            if (gameModeManager.selectMode(mode)) {
                // Update visual selection
                modeButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                // Update mode display
                updateModeDisplay();
                
                // Show notification
                showNotification(`${gameModeManager.getCurrentMode().name} selected!`, 'success');
            }
        });
    });
}

// Initialize environment selection UI
function initEnvironmentSelectionUI() {
    currentGameModeSelect = document.getElementById('environmentSelect');
    
    const updateEnvironmentOptions = () => {
        const environments = environmentManager.getAllEnvironments();
        currentGameModeSelect.innerHTML = '';
        
        environments.forEach((env, index) => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = env.name;
            
            // Only enable unlocked environments
            if (!environmentManager.isEnvironmentUnlocked(env.id)) {
                option.disabled = true;
                option.textContent += ' (🔒 Locked)';
            }
            
            if (environmentManager.getCurrentEnvironment().id === env.id) {
                option.selected = true;
            }
            
            currentGameModeSelect.appendChild(option);
        });
    };
    
    currentGameModeSelect.addEventListener('change', () => {
        const selectedId = parseInt(currentGameModeSelect.value, 10);
        environmentManager.setEnvironment(selectedId);
        updateEnvironmentDisplay();
    });
    
    updateEnvironmentOptions();
}

// Initialize vehicle selection UI
function initVehicleSelectionUI() {
    vehicleSelection = document.getElementById('vehicleSelection');
    
    const updateVehicleOptions = () => {
        const vehicles = vehicleManager.getAllVehicles();
        vehicleSelection.innerHTML = '';
        
        vehicles.forEach(vehicle => {
            const option = document.createElement('div');
            option.className = 'vehicle-option';
            
            if (!vehicle.unlocked) {
                option.classList.add('locked');
            } else {
                option.addEventListener('click', () => {
                    if (vehicleManager.selectVehicle(vehicle.id)) {
                        updateVehicleSelectionUI();
                        vehicleManager.updatePlayerStats(player);
                        
                        // Update game stats for achievements
                        gameStats.carType = vehicle.id;
                    }
                });
            }
            
            if (vehicle.current) {
                option.classList.add('selected');
            }
            
            // Create preview canvas
            const preview = document.createElement('canvas');
            preview.width = 80;
            preview.height = 60;
            const previewCtx = preview.getContext('2d');
            
            // Draw vehicle preview
            const vehicleObj = vehicleManager.vehicles.get(vehicle.id);
            vehicleObj.draw(previewCtx, 10, 10);
            
            option.appendChild(preview);
            
            // Create vehicle info
            const info = document.createElement('div');
            info.className = 'vehicle-info';
            
            const name = document.createElement('div');
            name.className = 'vehicle-name';
            name.textContent = vehicle.name;
            info.appendChild(name);
            
            if (vehicle.unlocked) {
                // Show stats
                const stats = document.createElement('div');
                stats.className = 'vehicle-stats';
                
                ['speed', 'handling', 'size'].forEach(stat => {
                    const statContainer = document.createElement('div');
                    statContainer.className = 'stat-container';
                    
                    const statLabel = document.createElement('span');
                    statLabel.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
                    statContainer.appendChild(statLabel);
                    
                    const statBar = document.createElement('div');
                    statBar.className = 'stat-bar';
                    
                    const statFill = document.createElement('div');
                    statFill.className = 'stat-fill';
                    statFill.style.width = `${vehicle.stats[stat] * 10}%`;
                    
                    statBar.appendChild(statFill);
                    statContainer.appendChild(statBar);
                    stats.appendChild(statContainer);
                });
                
                info.appendChild(stats);
            } else {
                // Show locked status
                const locked = document.createElement('div');
                locked.className = 'vehicle-locked';
                locked.textContent = '🔒 Locked';
                info.appendChild(locked);
            }
            
            option.appendChild(info);
            vehicleSelection.appendChild(option);
        });
    };
    
    updateVehicleOptions();
}

// Update vehicle selection UI
function updateVehicleSelectionUI() {
    const options = vehicleSelection.querySelectorAll('.vehicle-option');
    options.forEach(option => {
        if (option.classList.contains('selected')) {
            option.classList.remove('selected');
        } else {
            option.classList.add('selected');
        }
    });
}

// Set up modal event listeners
function setupModalEventListeners() {
    // Settings modal
    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });
    
    document.getElementById('saveSettings').addEventListener('click', () => {
        saveSettings();
        document.getElementById('settingsModal').classList.add('hidden');
    });
    
    document.getElementById('resetSettings').addEventListener('click', () => {
        resetSettings();
        loadSettings();
        document.getElementById('settingsModal').classList.add('hidden');
    });
    
    // Achievements modal
    document.getElementById('closeAchievements').addEventListener('click', () => {
        document.getElementById('achievementsModal').classList.add('hidden');
    });
    
    // Leaderboard modal
    document.getElementById('closeLeaderboard').addEventListener('click', () => {
        document.getElementById('leaderboardModal').classList.add('hidden');
    });
    
    // Tab switching for leaderboard
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            updateLeaderboardUI();
        });
    });
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
    
    // Reset game objects
    player.reset();
    obstacleManager.reset();
    powerUpManager.reset();
    particleSystem.reset();
    
    // Apply vehicle stats
    vehicleManager.updatePlayerStats(player);
    
    // Select default game mode if none selected
    if (!gameModeManager.getCurrentMode()) {
        gameModeManager.selectMode('endless');
        // Update visual selection
        const modeButtons = document.querySelectorAll('.mode-option');
        modeButtons.forEach(btn => btn.classList.remove('selected'));
        document.querySelector('[data-mode="endless"]').classList.add('selected');
    }
    
    // Initialize current game mode
    gameModeManager.initCurrentMode();
    
    // Hide overlays, show HUD
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameHUD.classList.remove('hidden');
    
    // Update displays
    updateScore();
    updateHighScore();
    
    // Start background music
    soundManager.startBackgroundMusic('normal');
    
    // Initialize touch controls if on mobile
    touchControls = initTouchControls(player, obstacleManager, powerUpManager);
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
    
    console.log('Game started');
}

// Pause the game
function pauseGame() {
    if (gameState === GameState.PLAYING) {
        gameState = GameState.PAUSED;
        
        // Show pause screen
        pauseScreen.classList.remove('hidden');
        
        // Stop background music
        soundManager.stopBackgroundMusic();
        
        // Hide touch controls
        if (touchControls) {
            touchControls.setVisible(false);
        }
        
        console.log('Game paused');
    }
}

// Resume the game
function resumeGame() {
    if (gameState === GameState.PAUSED) {
        gameState = GameState.PLAYING;
        lastTime = performance.now();
        
        // Hide pause screen
        pauseScreen.classList.add('hidden');
        
        // Start background music
        soundManager.startBackgroundMusic('normal');
        
        // Show touch controls
        if (touchControls) {
            touchControls.setVisible(true);
        }
        
        console.log('Game resumed');
    }
}

// Game over
function gameOver() {
    gameState = GameState.GAME_OVER;
    
    // Update game stats for achievements
    gameStats.score = score;
    gameStats.gameTime = gameTime;
    gameStats.nearMisses = nearMissStreak;
    
    // Check for new achievements
    achievementManager.checkAchievements(gameStats);
    achievementManager.updateStats(gameStats);
    
    // Check for vehicle unlocks
    const unlockedVehicle = vehicleManager.checkAndUnlockVehicles(score);
    if (unlockedVehicle) {
        showNotification(`New vehicle unlocked: ${vehicleManager.getCurrentVehicle().name}!`, 'unlock');
    }

    // Check for environment unlocks
    const unlockedEnvironment = (score >= 500 && !environmentManager.isEnvironmentUnlocked(5));
    if (unlockedEnvironment) {
        environmentManager.unlockEnvironment(5);
        showNotification('New environment unlocked: Desert!', 'unlock');
        updateEnvironmentSelectionUI();
    }
    
    // Update high scores
    const isNewHighScore = gameModeManager.updateHighScore(gameModeManager.getCurrentModeId(), score);
    if (isNewHighScore) {
        newHighScoreElement.classList.remove('hidden');
    }
    
    // Update leaderboard
    leaderboardManager.saveScore(gameModeManager.getCurrentModeId(), score);
    
    // Show game over screen
    gameOverScreen.classList.remove('hidden');
    gameHUD.classList.add('hidden');
    
    // Update final score
    finalScoreElement.textContent = score;
    
    // Play game over sound
    soundManager.play('gameOver');
    
    // Start screen shake
    startScreenShake(300, 5);
    
    // Stop background music
    soundManager.stopBackgroundMusic();
    
    // Hide touch controls
    if (touchControls) {
        touchControls.setVisible(false);
    }
    
    console.log(`Game over - Final score: ${score}`);
}

// Update score display
function updateScore() {
    currentScoreElement.textContent = score;
}

// Update high score display
function updateHighScore() {
    highScoreElement.textContent = highScore;
    hudHighScoreElement.textContent = highScore;
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications to avoid stacking
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';

    // Set icon and color based on type
    let icon = '';
    let background = 'rgba(0, 0, 0, 0.8)';

    switch(type) {
        case 'success':
            icon = '✅ ';
            background = 'rgba(0, 255, 0, 0.8)';
            break;
        case 'warning':
            icon = '⚠️ ';
            background = 'rgba(255, 165, 0, 0.8)';
            break;
        case 'error':
            icon = '❌ ';
            background = 'rgba(255, 0, 0, 0.8)';
            break;
        case 'achievement':
            icon = '🏆 ';
            background = 'rgba(255, 215, 0, 0.8)';
            break;
        case 'unlock':
            icon = '🎉 ';
            background = 'rgba(138, 43, 226, 0.8)';
            break;
        default:
            icon = 'ℹ️ ';
            background = 'rgba(0, 0, 0, 0.8)';
    }

    notification.textContent = icon + message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = background;
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '8px';
    notification.style.zIndex = '1001';
    notification.style.fontSize = '1rem';
    notification.style.fontWeight = '500';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.borderLeft = `4px solid ${type === 'success' ? '#00ff00' : type === 'warning' ? '#ffa500' : type === 'error' ? '#ff0000' : type === 'achievement' ? '#ffd700' : '#4d79ff'}`;

    document.body.appendChild(notification);

    // Play notification sound if available
    if (soundManager && soundManager.initialized) {
        if (type === 'achievement') {
            soundManager.play('achievement');
        } else if (type === 'success') {
            soundManager.play('powerup');
        }
    }

    // Auto remove after delay
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Update mode display
function updateModeDisplay() {
    const modeDisplay = document.getElementById('modeDisplay');
    if (modeDisplay) {
        modeDisplay.textContent = gameModeManager.getScoreDisplay(score);
    }
}

// Update environment display
function updateEnvironmentDisplay() {
    const environmentDisplay = document.getElementById('environmentDisplay');
    if (environmentDisplay) {
        const env = environmentManager.getCurrentEnvironment();
        environmentDisplay.textContent = `Environment: ${env.name}`;
    }
}

// Update active effects display
function updateActiveEffectsDisplay() {
    const activeEffectsDisplay = document.getElementById('activeEffects');
    if (activeEffectsDisplay) {
        const effects = [];
        
        if (powerUpManager.activeEffects.size > 0) {
            for (const [type, effect] of powerUpManager.activeEffects.entries()) {
                effects.push(effect.name);
            }
        }
        
        if (player.shielded) {
            effects.push('Shield');
        }
        
        activeEffectsDisplay.textContent = effects.length > 0 ? `Active: ${effects.join(', ')}` : '';
    }
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = lastTime ? timestamp - lastTime : 0;
    lastTime = timestamp;
    
    // Update performance monitoring
    updatePerformanceMonitor();
    
    // Update game time
    if (gameState === GameState.PLAYING) {
        gameTime += deltaTime;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Draw environment background
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
        environmentManager.drawBackground(ctx);
    }
    
    // Draw road
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
        environmentManager.drawRoad(ctx);
    } else {
        // Default road drawing for menu/game over
        drawRoad(ctx);
    }
    
    if (gameState === GameState.PLAYING) {
        // Update game objects
        player.update();
        obstacleManager.update(gameTime, deltaTime);
        powerUpManager.update(gameTime, deltaTime);
        environmentManager.update(deltaTime);
        
        // Check for power-up collection
        const collectedPowerUp = powerUpManager.checkPowerUpCollection(player);
        
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
            particleSystem.createNearMiss(
                player.x + player.width / 2,
                player.y + player.height / 2
            );
            soundManager.play('nearMiss');
        }
        
        // Update score based on time survived
        if (gameTime % 100 < deltaTime) {
            score++;
        }
        
        // Apply score multiplier if active
        if (player.scoreMultiplier && player.scoreMultiplier > 1) {
            score++; // Extra point for multiplier display
        }
        
        // Update score display
        updateScore();
        
        // Update active effects display
        updateActiveEffectsDisplay();
        
        // Draw game objects
        const wasShaking = applyScreenShake(ctx);
        
        player.draw(ctx);
        obstacleManager.draw(ctx);
        powerUpManager.draw(ctx);
        environmentManager.drawWeatherEffects(ctx);
        
        restoreScreenShake(ctx, wasShaking);
        
        // Log game state every second for debugging
        if (Math.floor(gameTime / 1000) !== Math.floor((gameTime - deltaTime) / 1000)) {
            console.log(`Game playing - Score: ${score}, Time: ${Math.floor(gameTime/1000)}s, FPS: ${getAverageFPS().toFixed(1)}`);
        }
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Settings functions
function loadSettings() {
    // Load accessibility settings
    accessibilityManager.loadSettings();
    accessibilityManager.applySettings();
    
    // Load sound settings
    soundManager.loadSettings();
    
    // Load environment
    environmentManager.loadCurrentEnvironment();
}

function saveSettings() {
    // Save accessibility settings
    accessibilityManager.saveSettings();
    accessibilityManager.applySettings();

    // Save sound settings
    soundManager.saveSettings();

    showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    // Reset accessibility settings to defaults
    accessibilityManager.settings.highContrast = false;
    accessibilityManager.settings.reducedMotion = false;
    accessibilityManager.settings.largeText = false;
    accessibilityManager.settings.colorBlindMode = 'normal';
    accessibilityManager.settings.difficulty = 'normal';
    
    // Reset sound settings
    soundManager.enabled = true;
    soundManager.volume = 0.7;
    soundManager.musicVolume = 0.5;
    
    // Apply changes
    saveSettings();
    loadSettings();
}

// Update achievements UI
function updateAchievementsUI() {
    const achievementsList = document.getElementById('achievementsContainer');
    const achievementCount = document.getElementById('achievementCount');
    const totalAchievements = document.getElementById('totalAchievements');
    const progressFill = document.getElementById('achievementProgress');
    
    const achievements = achievementManager.getAllAchievements();
    const unlockedCount = achievementManager.getUnlockedCount();
    
    // Update counts
    achievementCount.textContent = unlockedCount;
    totalAchievements.textContent = achievements.length;
    
    // Update progress bar
    const progressPercent = unlockedCount / achievements.length;
    progressFill.style.width = `${progressPercent * 100}%`;
    
    // Display achievements
    achievementsList.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        
        if (achievement.unlocked) {
            achievementItem.classList.add('unlocked');
        }
        
        const icon = document.createElement('div');
        icon.className = 'achievement-icon';
        icon.textContent = achievement.icon;
        achievementItem.appendChild(icon);
        
        const details = document.createElement('div');
        details.className = 'achievement-details';
        
        const name = document.createElement('div');
        name.className = 'achievement-name';
        name.textContent = achievement.name;
        details.appendChild(name);
        
        const description = document.createElement('div');
        description.className = 'achievement-description';
        description.textContent = achievement.description;
        details.appendChild(description);
        
        achievementItem.appendChild(details);
        achievementsList.appendChild(achievementItem);
    });
}

// Update leaderboard UI
function updateLeaderboardUI() {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab) {
        const mode = activeTab.getAttribute('data-tab');
        leaderboardManager.renderLeaderboard(mode);
    }
}

// Test save system
function testSaveSystem() {
    console.log('Testing save system...');

    // Test localStorage availability
    if (typeof Storage === 'undefined') {
        console.error('LocalStorage not available');
        showNotification('LocalStorage not available - scores won\'t be saved!', 'error');
        return false;
    }

    // Test saving and loading data
    const testData = { test: 'data', timestamp: Date.now() };
    try {
        localStorage.setItem('racingGameTest', JSON.stringify(testData));
        const loaded = JSON.parse(localStorage.getItem('racingGameTest'));

        if (loaded && loaded.test === 'data') {
            console.log('LocalStorage test passed');
            localStorage.removeItem('racingGameTest');
            return true;
        } else {
            console.error('LocalStorage test failed');
            return false;
        }
    } catch (e) {
        console.error('LocalStorage error:', e);
        showNotification('Unable to save game data!', 'error');
        return false;
    }
}