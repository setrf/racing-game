// Touch controls for mobile devices

class TouchControls {
    constructor(player, obstacleManager, powerUpManager) {
        this.player = player;
        this.obstacleManager = obstacleManager;
        this.powerUpManager = powerUpManager;
        
        // Touch control zones
        this.touchZones = {
            left: null,
            right: null,
            teleport: null,
            pause: null
        };
        
        // Touch tracking
        this.touches = {};
        this.lastTapTime = 0;
        this.doubleTapThreshold = 300; // ms
        
        // Initialize touch controls
        this.init();
    }
    
    // Initialize touch controls
    init() {
        // Create touch UI if on mobile device
        if (this.isMobileDevice()) {
            this.createTouchUI();
            this.setupEventListeners();
        }
    }
    
    // Check if running on mobile device
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // Create touch UI elements
    createTouchUI() {
        // Create touch container
        const touchContainer = document.createElement('div');
        touchContainer.id = 'touchContainer';
        touchContainer.style.position = 'absolute';
        touchContainer.style.top = '0';
        touchContainer.style.left = '0';
        touchContainer.style.width = '100%';
        touchContainer.style.height = '100%';
        touchContainer.style.zIndex = '20';
        touchContainer.style.pointerEvents = 'none';
        
        // Create left button
        const leftButton = document.createElement('div');
        leftButton.className = 'touch-button left-button';
        leftButton.innerHTML = '←';
        leftButton.style.position = 'absolute';
        leftButton.style.left = '20px';
        leftButton.style.bottom = '50px';
        leftButton.style.width = '80px';
        leftButton.style.height = '80px';
        leftButton.style.borderRadius = '50%';
        leftButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        leftButton.style.display = 'flex';
        leftButton.style.justifyContent = 'center';
        leftButton.style.alignItems = 'center';
        leftButton.style.fontSize = '40px';
        leftButton.style.color = '#fff';
        leftButton.style.pointerEvents = 'auto';
        leftButton.style.userSelect = 'none';
        leftButton.style.touchAction = 'none';
        
        // Create right button
        const rightButton = document.createElement('div');
        rightButton.className = 'touch-button right-button';
        rightButton.innerHTML = '→';
        rightButton.style.position = 'absolute';
        rightButton.style.right = '20px';
        rightButton.style.bottom = '50px';
        rightButton.style.width = '80px';
        rightButton.style.height = '80px';
        rightButton.style.borderRadius = '50%';
        rightButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        rightButton.style.display = 'flex';
        rightButton.style.justifyContent = 'center';
        rightButton.style.alignItems = 'center';
        rightButton.style.fontSize = '40px';
        rightButton.style.color = '#fff';
        rightButton.style.pointerEvents = 'auto';
        rightButton.style.userSelect = 'none';
        rightButton.style.touchAction = 'none';
        
        // Create teleport button
        const teleportButton = document.createElement('div');
        teleportButton.className = 'touch-button teleport-button';
        teleportButton.innerHTML = '⚡';
        teleportButton.style.position = 'absolute';
        teleportButton.style.right = '120px';
        teleportButton.style.bottom = '50px';
        teleportButton.style.width = '60px';
        teleportButton.style.height = '60px';
        teleportButton.style.borderRadius = '50%';
        teleportButton.style.backgroundColor = 'rgba(255, 204, 51, 0.3)';
        teleportButton.style.display = 'flex';
        teleportButton.style.justifyContent = 'center';
        teleportButton.style.alignItems = 'center';
        teleportButton.style.fontSize = '30px';
        teleportButton.style.color = '#fff';
        teleportButton.style.pointerEvents = 'auto';
        teleportButton.style.userSelect = 'none';
        teleportButton.style.touchAction = 'none';
        
        // Create pause button
        const pauseButton = document.createElement('div');
        pauseButton.className = 'touch-button pause-button';
        pauseButton.innerHTML = '⏸';
        pauseButton.style.position = 'absolute';
        pauseButton.style.top = '20px';
        pauseButton.style.right = '20px';
        pauseButton.style.width = '50px';
        pauseButton.style.height = '50px';
        pauseButton.style.borderRadius = '50%';
        pauseButton.style.backgroundColor = 'rgba(77, 121, 255, 0.3)';
        pauseButton.style.display = 'flex';
        pauseButton.style.justifyContent = 'center';
        pauseButton.style.alignItems = 'center';
        pauseButton.style.fontSize = '24px';
        pauseButton.style.color = '#fff';
        pauseButton.style.pointerEvents = 'auto';
        pauseButton.style.userSelect = 'none';
        pauseButton.style.touchAction = 'none';
        
        // Store references
        this.touchZones.left = leftButton;
        this.touchZones.right = rightButton;
        this.touchZones.teleport = teleportButton;
        this.touchZones.pause = pauseButton;
        
        // Add to container
        touchContainer.appendChild(leftButton);
        touchContainer.appendChild(rightButton);
        touchContainer.appendChild(teleportButton);
        touchContainer.appendChild(pauseButton);
        
        // Add to canvas container
        const canvasContainer = document.querySelector('.game-canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(touchContainer);
        }
        
        // Add CSS animation classes
        const style = document.createElement('style');
        style.textContent = `
            .touch-button:active {
                transform: scale(0.9);
                background-color: rgba(255, 255, 255, 0.6) !important;
            }
            .teleport-button:active {
                background-color: rgba(255, 204, 51, 0.6) !important;
            }
            .pause-button:active {
                background-color: rgba(77, 121, 255, 0.6) !important;
            }
            @media (max-width: 768px) {
                .touch-button {
                    opacity: 1 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Setup touch event listeners
    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Touch events on canvas for swipe gestures
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
        
        // Touch button event listeners
        this.touchZones.left.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleButtonPress('left', e);
        });
        
        this.touchZones.right.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleButtonPress('right', e);
        });
        
        this.touchZones.teleport.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleButtonPress('teleport', e);
        });
        
        this.touchZones.pause.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleButtonPress('pause', e);
        });
        
        // Prevent default touch behavior on canvas
        canvas.style.touchAction = 'none';
    }
    
    // Handle touch start
    handleTouchStart(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            this.touches[touch.identifier] = {
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now()
            };
        }
    }
    
    // Handle touch move
    handleTouchMove(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches[touch.identifier];
            
            if (touchData) {
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
            }
        }
    }
    
    // Handle touch end
    handleTouchEnd(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            const touchData = this.touches[touch.identifier];
            
            if (touchData) {
                // Calculate swipe direction
                const deltaX = touchData.currentX - touchData.startX;
                const deltaY = touchData.currentY - touchData.startY;
                const deltaTime = Date.now() - touchData.startTime;
                
                // Check if it's a swipe
                if (Math.abs(deltaX) > 30 && deltaTime < 300) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        // Swipe right
                        this.handleSwipe('right');
                    } else {
                        // Swipe left
                        this.handleSwipe('left');
                    }
                }
                
                // Check for double tap
                const currentTime = Date.now();
                if (currentTime - this.lastTapTime < this.doubleTapThreshold) {
                    this.handleDoubleTap();
                }
                this.lastTapTime = currentTime;
                
                // Remove touch data
                delete this.touches[touch.identifier];
            }
        }
    }
    
    // Handle button press
    handleButtonPress(button, e) {
        // Add haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        switch (button) {
            case 'left':
                this.handleSwipe('left');
                this.animateButton(this.touchZones.left);
                break;
            case 'right':
                this.handleSwipe('right');
                this.animateButton(this.touchZones.right);
                break;
            case 'teleport':
                this.handleTeleport();
                this.animateButton(this.touchZones.teleport);
                break;
            case 'pause':
                this.togglePause();
                this.animateButton(this.touchZones.pause);
                break;
        }
    }
    
    // Handle swipe gesture
    handleSwipe(direction) {
        if (direction === 'left') {
            if (this.player.lane > 0) {
                this.player.moveToLane(this.player.lane - 1);
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('brake');
                }
            }
        } else if (direction === 'right') {
            if (this.player.lane < GAME_CONSTANTS.NUM_LANES - 1) {
                this.player.moveToLane(this.player.lane + 1);
                if (typeof soundManager !== 'undefined') {
                    soundManager.play('brake');
                }
            }
        }
    }
    
    // Handle double tap
    handleDoubleTap() {
        // Double tap could be used for special abilities
        if (this.powerUpManager && this.powerUpManager.isEffectActive && 
            this.powerUpManager.isEffectActive('teleport')) {
            this.player.handleKeyDown(' ', this.obstacleManager, this.powerUpManager);
        }
    }
    
    // Handle teleport
    handleTeleport() {
        // Teleport could be mapped to space key for special ability
        this.player.handleKeyDown(' ', this.obstacleManager, this.powerUpManager);
    }
    
    // Toggle pause game
    togglePause() {
        // Trigger pause key event
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    }
    
    // Animate button press
    animateButton(button) {
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Show/hide touch controls
    setVisible(visible) {
        const touchContainer = document.getElementById('touchContainer');
        if (touchContainer) {
            touchContainer.style.display = visible ? 'block' : 'none';
        }
    }
}

// TouchControls class will be instantiated in game.js

// Initialize touch controls after game objects are created
function initTouchControls(player, obstacleManager, powerUpManager) {
    return new TouchControls(player, obstacleManager, powerUpManager);
}