// Environment system for different road backgrounds and weather

class Environment {
    constructor(id, name, roadColor, laneColor, bgColor, skyColor, weatherEffect) {
        this.id = id;
        this.name = name;
        this.roadColor = roadColor;
        this.laneColor = laneColor;
        this.bgColor = bgColor;
        this.skyColor = skyColor;
        this.weatherEffect = weatherEffect;
    }
}

class EnvironmentManager {
    constructor() {
        this.environments = this.createEnvironments();
        this.currentEnvironment = 0;
        this.weatherParticles = [];
        this.unlockedEnvironments = new Set([0]); // Start with first environment unlocked
        
        // Load saved environment
        this.loadCurrentEnvironment();
    }
    
    createEnvironments() {
        return [
            // Day - Clear
            new Environment(
                0,
                'Day - Clear',
                '#3a3a3a',
                '#ffffff',
                '#87CEEB', // Sky blue
                '#87CEEB',
                null
            ),
            // Night
            new Environment(
                1,
                'Night',
                '#2a2a2a',
                '#ffff99',
                '#0a0a2a', // Dark blue
                '#000033', // Darker blue
                'stars'
            ),
            // Rain
            new Environment(
                2,
                'Rain',
                '#4a4a4a',
                '#ffffff',
                '#606080', // Gray
                '#606080',
                'rain'
            ),
            // Fog
            new Environment(
                3,
                'Fog',
                '#4a4a4a',
                '#cccccc',
                '#d0d0d0', // Light gray
                '#d0d0d0',
                'fog'
            ),
            // Sunset
            new Environment(
                4,
                'Sunset',
                '#5a3a3a',
                '#ffffff',
                '#ff9666', // Orange
                '#ff9666',
                null
            ),
            // Desert
            new Environment(
                5,
                'Desert',
                '#c2b280', // Sand
                '#ffffff',
                '#ffd89b', // Sandy sky
                '#ffd89b',
                null
            )
        ];
    }
    
    // Get current environment
    getCurrentEnvironment() {
        return this.environments[this.currentEnvironment];
    }
    
    // Get all environments
    getAllEnvironments() {
        return this.environments;
    }
    
    // Check if environment is unlocked
    isEnvironmentUnlocked(id) {
        return this.unlockedEnvironments.has(id);
    }
    
    // Unlock an environment
    unlockEnvironment(id) {
        this.unlockedEnvironments.add(id);
        this.saveUnlockedEnvironments();
        return true;
    }
    
    // Change to next environment
    nextEnvironment() {
        this.currentEnvironment = (this.currentEnvironment + 1) % this.environments.length;
        this.saveCurrentEnvironment();
        return this.currentEnvironment;
    }
    
    // Change to specific environment
    setEnvironment(id) {
        if (id >= 0 && id < this.environments.length && this.isEnvironmentUnlocked(id)) {
            this.currentEnvironment = id;
            this.saveCurrentEnvironment();
            return true;
        }
        return false;
    }
    
    // Save current environment
    saveCurrentEnvironment() {
        try {
            localStorage.setItem('racingGameEnvironment', this.currentEnvironment.toString());
        } catch (e) {
            console.error('Error saving environment:', e);
        }
    }
    
    // Load current environment
    loadCurrentEnvironment() {
        try {
            const saved = localStorage.getItem('racingGameEnvironment');
            if (saved !== null) {
                const envId = parseInt(saved, 10);
                if (envId >= 0 && envId < this.environments.length) {
                    this.currentEnvironment = envId;
                }
            }
        } catch (e) {
            console.error('Error loading environment:', e);
        }
    }
    
    // Save unlocked environments
    saveUnlockedEnvironments() {
        try {
            localStorage.setItem('racingGameUnlockedEnvironments', 
                JSON.stringify(Array.from(this.unlockedEnvironments)));
        } catch (e) {
            console.error('Error saving unlocked environments:', e);
        }
    }
    
    // Load unlocked environments
    loadUnlockedEnvironments() {
        try {
            const saved = localStorage.getItem('racingGameUnlockedEnvironments');
            if (saved) {
                const unlocked = JSON.parse(saved);
                if (Array.isArray(unlocked)) {
                    this.unlockedEnvironments = new Set(unlocked);
                }
            }
        } catch (e) {
            console.error('Error loading unlocked environments:', e);
        }
    }
    
    // Update weather effects
    update(deltaTime) {
        const env = this.getCurrentEnvironment();
        
        // Clear old particles
        this.weatherParticles = [];
        
        // Generate new weather particles based on current environment
        if (env.weatherEffect === 'rain') {
            this.updateRain(deltaTime);
        } else if (env.weatherEffect === 'stars') {
            this.updateStars();
        } else if (env.weatherEffect === 'fog') {
            this.updateFog(deltaTime);
        }
    }
    
    // Update rain effect
    updateRain(deltaTime) {
        // Generate new raindrops occasionally
        if (Math.random() < 0.3) {
            this.weatherParticles.push({
                x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
                y: -10,
                length: Math.random() * 10 + 5,
                speed: Math.random() * 5 + 10,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        // Update existing raindrops
        for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
            const drop = this.weatherParticles[i];
            drop.y += drop.speed;
            
            // Remove raindrops that have gone off screen
            if (drop.y > GAME_CONSTANTS.CANVAS_HEIGHT) {
                this.weatherParticles.splice(i, 1);
            }
        }
    }
    
    // Update stars effect
    updateStars() {
        // Static stars for night environment
        if (this.weatherParticles.length === 0) {
            for (let i = 0; i < 30; i++) {
                this.weatherParticles.push({
                    x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
                    y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT / 2, // Only in upper half
                    size: Math.random() * 2 + 1,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        }
        
        // Update twinkle effect
        for (const star of this.weatherParticles) {
            star.twinkle += 0.05;
        }
    }
    
    // Update fog effect
    updateFog(deltaTime) {
        // Generate fog patches occasionally
        if (this.weatherParticles.length < 5) {
            this.weatherParticles.push({
                x: Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
                y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
                radius: Math.random() * 50 + 30,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.2 + 0.1
            });
        }
        
        // Update existing fog patches
        for (let i = this.weatherParticles.length - 1; i >= 0; i--) {
            const fog = this.weatherParticles[i];
            fog.x += fog.speed;
            
            // Remove fog that has gone off screen
            if (fog.x > GAME_CONSTANTS.CANVAS_WIDTH + fog.radius) {
                this.weatherParticles.splice(i, 1);
            }
        }
    }
    
    // Draw environment background
    drawBackground(ctx) {
        const env = this.getCurrentEnvironment();
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONSTANTS.CANVAS_HEIGHT);
        gradient.addColorStop(0, env.skyColor);
        gradient.addColorStop(1, env.bgColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        
        // Draw weather effects
        this.drawWeatherEffects(ctx);
    }
    
    // Draw weather effects
    drawWeatherEffects(ctx) {
        const env = this.getCurrentEnvironment();
        
        if (env.weatherEffect === 'rain') {
            this.drawRain(ctx);
        } else if (env.weatherEffect === 'stars') {
            this.drawStars(ctx);
        } else if (env.weatherEffect === 'fog') {
            this.drawFog(ctx);
        }
    }
    
    // Draw rain effect
    drawRain(ctx) {
        ctx.strokeStyle = 'rgba(200, 200, 255, 0.7)';
        
        for (const drop of this.weatherParticles) {
            ctx.globalAlpha = drop.opacity;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x, drop.y + drop.length);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // Draw stars effect
    drawStars(ctx) {
        ctx.fillStyle = '#ffffff';
        
        for (const star of this.weatherParticles) {
            const twinkle = Math.sin(star.twinkle) * 0.5 + 0.5;
            ctx.globalAlpha = twinkle;
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
    
    // Draw fog effect
    drawFog(ctx) {
        for (const fog of this.weatherParticles) {
            const gradient = ctx.createRadialGradient(
                fog.x, fog.y, 0,
                fog.x, fog.y, fog.radius
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${fog.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                fog.x - fog.radius, 
                fog.y - fog.radius, 
                fog.radius * 2, 
                fog.radius * 2
            );
        }
    }
    
    // Draw road with current environment colors
    drawRoad(ctx) {
        const env = this.getCurrentEnvironment();
        
        // Road background
        ctx.fillStyle = env.roadColor;
        ctx.fillRect(GAME_CONSTANTS.ROAD_LEFT_X, 0, GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        
        // Road edges
        ctx.strokeStyle = env.laneColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(GAME_CONSTANTS.ROAD_LEFT_X, 0);
        ctx.lineTo(GAME_CONSTANTS.ROAD_LEFT_X, GAME_CONSTANTS.CANVAS_HEIGHT);
        ctx.moveTo(GAME_CONSTANTS.ROAD_LEFT_X + GAME_CONSTANTS.ROAD_WIDTH, 0);
        ctx.lineTo(GAME_CONSTANTS.ROAD_LEFT_X + GAME_CONSTANTS.ROAD_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
        ctx.stroke();
        
        // Lane markings
        const laneWidth = GAME_CONSTANTS.LANE_WIDTH;
        const roadLeft = GAME_CONSTANTS.ROAD_LEFT_X;
        const markingWidth = 5;
        const markingHeight = 20;
        const markingGap = 30;
        
        ctx.fillStyle = env.laneColor;
        for (let lane = 1; lane < GAME_CONSTANTS.NUM_LANES; lane++) {
            const x = roadLeft + lane * laneWidth - markingWidth / 2;
            
            // Animate lane markings based on current game speed
            const offset = (Date.now() / 10) % (markingHeight + markingGap);
            
            for (let y = -offset - markingHeight; y < GAME_CONSTANTS.CANVAS_HEIGHT + markingHeight; y += markingHeight + markingGap) {
                ctx.fillRect(x, y, markingWidth, markingHeight);
            }
        }
    }
    
    // Get environment UI data
    getEnvironmentUIData() {
        return this.environments.map((env, index) => ({
            id: env.id,
            name: env.name,
            unlocked: this.isEnvironmentUnlocked(env.id),
            current: this.currentEnvironment === env.id
        }));
    }
    
    // Reset environment manager
    reset() {
        this.currentEnvironment = 0;
        this.weatherParticles = [];
        this.unlockedEnvironments = new Set([0]);
    }
}

// EnvironmentManager class will be instantiated in game.js