// Vehicle selection and management system

class Vehicle {
    constructor(id, name, stats, color) {
        this.id = id;
        this.name = name;
        this.stats = stats;
        this.color = color;
        this.width = GAME_CONSTANTS.PLAYER_WIDTH;
        this.height = GAME_CONSTANTS.PLAYER_HEIGHT;
    }
    
    // Draw vehicle based on its type
    draw(ctx, x, y) {
        ctx.fillStyle = this.color;
        
        // Draw based on vehicle type
        switch (this.id) {
            case 'sports':
                this.drawSportsCar(ctx, x, y);
                break;
            case 'sedan':
                this.drawSedan(ctx, x, y);
                break;
            case 'truck':
                this.drawTruck(ctx, x, y);
                break;
            case 'motorcycle':
                this.drawMotorcycle(ctx, x, y);
                break;
            default:
                // Default car drawing
                ctx.fillRect(x, y, this.width, this.height);
        }
    }
    
    // Draw a sports car
    drawSportsCar(ctx, x, y) {
        // Car body (lower profile)
        ctx.fillRect(x, y, this.width, this.height * 0.8);
        
        // Windshield (angled)
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 5);
        ctx.lineTo(x + this.width - 5, y + 5);
        ctx.lineTo(x + this.width - 10, y + 20);
        ctx.lineTo(x + 10, y + 20);
        ctx.closePath();
        ctx.fill();
        
        // Racing stripe
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + this.width/2 - 2, y, 4, this.height * 0.8);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(x + 3, y + 2, 8, 4);
        ctx.fillRect(x + this.width - 11, y + 2, 8, 4);
    }
    
    // Draw a sedan
    drawSedan(ctx, x, y) {
        // Car body
        ctx.fillRect(x, y, this.width, this.height);
        
        // Car front (windshield)
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 5, y + 5, this.width - 10, 15);
        
        // Car back
        ctx.fillRect(x + 5, y + this.height - 15, this.width - 10, 10);
        
        // Car sides (windows)
        ctx.fillStyle = '#333333';
        ctx.fillRect(x + 5, y + 25, this.width - 10, 20);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(x + 5, y + 5, 10, 5);
        ctx.fillRect(x + this.width - 15, y + 5, 10, 5);
        
        // Taillights
        ctx.fillStyle = '#ff4d4d';
        ctx.fillRect(x + 5, y + this.height - 5, 10, 3);
        ctx.fillRect(x + this.width - 15, y + this.height - 5, 10, 3);
    }
    
    // Draw a truck
    drawTruck(ctx, x, y) {
        // Truck body (slightly taller)
        ctx.fillRect(x, y, this.width, this.height + 10);
        
        // Truck cabin
        ctx.fillStyle = '#444444';
        ctx.fillRect(x, y + 15, this.width, 20);
        
        // Stripes
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(x, y + 5, this.width, 3);
        ctx.fillRect(x, y + this.height - 5, this.width, 3);
        
        // Headlights
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(x + 5, y + 2, 8, 4);
        ctx.fillRect(x + this.width - 13, y + 2, 8, 4);
    }
    
    // Draw a motorcycle
    drawMotorcycle(ctx, x, y) {
        // Slightly wider for balance
        const adjustedWidth = this.width * 0.7;
        const adjustedX = x + (this.width - adjustedWidth) / 2;
        
        // Body
        ctx.fillRect(adjustedX, y + 10, adjustedWidth, this.height - 20);
        
        // Windshield
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.moveTo(adjustedX + 5, y + 10);
        ctx.lineTo(adjustedX + adjustedWidth - 5, y + 10);
        ctx.lineTo(adjustedX + adjustedWidth - 8, y + 25);
        ctx.lineTo(adjustedX + 8, y + 25);
        ctx.closePath();
        ctx.fill();
        
        // Wheels
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.arc(adjustedX + adjustedWidth / 2, y + this.height - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(adjustedX + adjustedWidth / 2, y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Handlebars
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(adjustedX + adjustedWidth / 2, y + 10);
        ctx.lineTo(adjustedX + adjustedWidth / 2 - 8, y + 5);
        ctx.moveTo(adjustedX + adjustedWidth / 2, y + 10);
        ctx.lineTo(adjustedX + adjustedWidth / 2 + 8, y + 5);
        ctx.stroke();
    }
}

class VehicleManager {
    constructor() {
        this.vehicles = this.createVehicles();
        this.currentVehicleId = 'sedan'; // Default vehicle
        this.unlockedVehicles = new Set(['sedan']); // Start with sedan unlocked
        this.highScores = {}; // Track high scores for each vehicle
        
        // Load saved data
        this.load();
    }
    
    // Create all available vehicles
    createVehicles() {
        return new Map([
            ['sedan', new Vehicle(
                'sedan',
                'Standard Sedan',
                {
                    speed: 5,       // 1-10 scale
                    handling: 5,    // 1-10 scale
                    size: 5         // 1-10 scale (1 = small, 10 = large)
                },
                '#4d79ff'
            )],
            ['sports', new Vehicle(
                'sports',
                'Sports Car',
                {
                    speed: 8,
                    handling: 7,
                    size: 3
                },
                '#ff4d4d'
            )],
            ['truck', new Vehicle(
                'truck',
                'Heavy Truck',
                {
                    speed: 3,
                    handling: 3,
                    size: 8
                },
                '#8B4513'
            )],
            ['motorcycle', new Vehicle(
                'motorcycle',
                'Motorcycle',
                {
                    speed: 9,
                    handling: 9,
                    size: 2
                },
                '#666666'
            )]
        ]);
    }
    
    // Get current vehicle
    getCurrentVehicle() {
        return this.vehicles.get(this.currentVehicleId);
    }
    
    // Select a vehicle
    selectVehicle(vehicleId) {
        if (this.vehicles.has(vehicleId) && this.unlockedVehicles.has(vehicleId)) {
            this.currentVehicleId = vehicleId;
            this.save(); // Save selection
            return true;
        }
        return false;
    }
    
    // Unlock a vehicle
    unlockVehicle(vehicleId) {
        if (this.vehicles.has(vehicleId)) {
            this.unlockedVehicles.add(vehicleId);
            this.save(); // Save unlock status
            return true;
        }
        return false;
    }
    
    // Check if a vehicle is unlocked
    isVehicleUnlocked(vehicleId) {
        return this.unlockedVehicles.has(vehicleId);
    }
    
    // Get all vehicles with unlock status
    getAllVehicles() {
        const result = [];
        for (const [id, vehicle] of this.vehicles.entries()) {
            result.push({
                id: id,
                name: vehicle.name,
                stats: vehicle.stats,
                color: vehicle.color,
                unlocked: this.unlockedVehicles.has(id),
                current: id === this.currentVehicleId
            });
        }
        return result;
    }
    
    // Update vehicle stats based on current selection
    updatePlayerStats(player) {
        const vehicle = this.getCurrentVehicle();
        
        // Update player movement speed based on vehicle speed stat
        player.moveSpeed = 5 + vehicle.stats.speed * 0.8;
        
        // Adjust player size based on vehicle size stat
        const sizeFactor = 0.7 + (vehicle.stats.size / 10) * 0.6;
        player.width = GAME_CONSTANTS.PLAYER_WIDTH * sizeFactor;
        player.height = GAME_CONSTANTS.PLAYER_HEIGHT * sizeFactor;
        
        // Update player color
        player.color = vehicle.color;
        
        // Recalculate position to match new size
        player.x = player.calculateXPosition(player.lane);
        
        // Update vehicle type in game stats for achievements
        if (typeof gameStats !== 'undefined') {
            gameStats.carType = vehicle.id;
        }
    }
    
    // Unlock vehicles based on achievements
    checkAndUnlockVehicles(score) {
        // Unlock sports car at 100 points
        if (score >= 100 && !this.unlockedVehicles.has('sports')) {
            this.unlockVehicle('sports');
            return 'sports';
        }
        
        // Unlock truck at 200 points
        if (score >= 200 && !this.unlockedVehicles.has('truck')) {
            this.unlockVehicle('truck');
            return 'truck';
        }
        
        // Unlock motorcycle at 300 points
        if (score >= 300 && !this.unlockedVehicles.has('motorcycle')) {
            this.unlockVehicle('motorcycle');
            return 'motorcycle';
        }
        
        return null;
    }
    
    // Create vehicle selection UI
    createVehicleSelectionUI() {
        // Check if UI already exists
        const existingUI = document.getElementById('vehicleSelection');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Create selection container
        const container = document.createElement('div');
        container.id = 'vehicleSelection';
        container.className = 'vehicle-selection-panel';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Select Vehicle';
        container.appendChild(title);
        
        // Create vehicle options
        const vehiclesContainer = document.createElement('div');
        vehiclesContainer.className = 'vehicles-container';
        
        const vehicles = this.getAllVehicles();
        vehicles.forEach(vehicle => {
            const vehicleOption = document.createElement('div');
            vehicleOption.className = 'vehicle-option';
            if (vehicle.current) {
                vehicleOption.classList.add('selected');
            }
            
            // Create preview
            const preview = document.createElement('canvas');
            preview.width = 80;
            preview.height = 60;
            const previewCtx = preview.getContext('2d');
            
            // Draw vehicle preview
            const vehicleObj = this.vehicles.get(vehicle.id);
            vehicleObj.draw(previewCtx, 10, 10);
            
            // Create vehicle info
            const info = document.createElement('div');
            info.className = 'vehicle-info';
            
            const name = document.createElement('div');
            name.className = 'vehicle-name';
            name.textContent = vehicle.name;
            info.appendChild(name);
            
            // Show stats or locked status
            if (vehicle.unlocked) {
                const stats = document.createElement('div');
                stats.className = 'vehicle-stats';
                
                // Create stat bars
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
                const locked = document.createElement('div');
                locked.className = 'vehicle-locked';
                locked.textContent = '🔒 Locked';
                info.appendChild(locked);
            }
            
            vehicleOption.appendChild(preview);
            vehicleOption.appendChild(info);
            
            // Add click handler
            if (vehicle.unlocked) {
                vehicleOption.addEventListener('click', () => {
                    // Remove selected class from all options
                    document.querySelectorAll('.vehicle-option').forEach(option => {
                        option.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    vehicleOption.classList.add('selected');
                    
                    // Select vehicle
                    this.selectVehicle(vehicle.id);
                    
                    // Update player if game is initialized
                    if (typeof player !== 'undefined') {
                        this.updatePlayerStats(player);
                    }
                });
            }
            
            vehiclesContainer.appendChild(vehicleOption);
        });
        
        container.appendChild(vehiclesContainer);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'close-button';
        closeButton.addEventListener('click', () => {
            container.style.display = 'none';
        });
        container.appendChild(closeButton);
        
        // Add to page
        document.body.appendChild(container);
        
        // Return container for positioning
        return container;
    }
    
    // Show vehicle selection UI
    showVehicleSelection() {
        let selectionUI = document.getElementById('vehicleSelection');
        
        if (!selectionUI) {
            selectionUI = this.createVehicleSelectionUI();
            
            // Position and style
            selectionUI.style.position = 'fixed';
            selectionUI.style.top = '50%';
            selectionUI.style.left = '50%';
            selectionUI.style.transform = 'translate(-50%, -50%)';
            selectionUI.style.zIndex = '1000';
            selectionUI.style.backgroundColor = 'rgba(0,0,0,0.8)';
            selectionUI.style.padding = '20px';
            selectionUI.style.borderRadius = '10px';
            selectionUI.style.color = 'white';
            selectionUI.style.maxWidth = '600px';
            selectionUI.style.maxHeight = '80vh';
            selectionUI.style.overflow = 'auto';
        } else {
            selectionUI.style.display = 'block';
        }
    }
    
    // Hide vehicle selection UI
    hideVehicleSelection() {
        const selectionUI = document.getElementById('vehicleSelection');
        if (selectionUI) {
            selectionUI.style.display = 'none';
        }
    }
    
    // Save vehicle data
    save() {
        const data = {
            currentVehicleId: this.currentVehicleId,
            unlockedVehicles: Array.from(this.unlockedVehicles),
            highScores: this.highScores
        };
        localStorage.setItem('racingGameVehicles', JSON.stringify(data));
    }
    
    // Load vehicle data
    load() {
        const dataString = localStorage.getItem('racingGameVehicles');
        if (!dataString) return;
        
        try {
            const data = JSON.parse(dataString);
            this.currentVehicleId = data.currentVehicleId || 'sedan';
            this.unlockedVehicles = new Set(data.unlockedVehicles || ['sedan']);
            this.highScores = data.highScores || {};
        } catch (e) {
            console.error('Failed to load vehicle data:', e);
        }
    }
    
    // Reset to default state
    reset() {
        this.currentVehicleId = 'sedan';
        this.unlockedVehicles = new Set(['sedan']);
        this.save();
    }
}

// VehicleManager class will be instantiated in game.js