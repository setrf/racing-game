// Particle effects system for racing game

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 5;
        this.vy = options.vy || (Math.random() - 0.5) * 5;
        this.size = options.size || Math.random() * 5 + 2;
        this.color = options.color || '#ffffff';
        this.life = options.life || 1.0;
        this.decay = options.decay || 0.02;
        this.type = options.type || 'circle';
        this.gravity = options.gravity || 0.1;
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.2;
    }
    
    update(deltaTime) {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply gravity if needed
        if (this.type === 'debris' || this.type === 'spark') {
            this.vy += this.gravity;
        }
        
        // Update rotation
        this.rotation += this.rotationSpeed;
        
        // Update life
        this.life -= this.decay;
        
        // Fade out near end of life
        if (this.life < 0.2) {
            this.size *= 0.98;
        }
        
        // Return true if particle is still alive
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Apply alpha based on life
        ctx.globalAlpha = this.life;
        
        // Apply rotation
        if (this.rotation !== 0) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.translate(-this.x, -this.y);
        }
        
        // Draw based on type
        switch (this.type) {
            case 'circle':
                this.drawCircle(ctx);
                break;
            case 'square':
                this.drawSquare(ctx);
                break;
            case 'spark':
                this.drawSpark(ctx);
                break;
            case 'debris':
                this.drawDebris(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            case 'trail':
                this.drawTrail(ctx);
                break;
            case 'line':
                this.drawLine(ctx);
                break;
            case 'triangle':
                this.drawTriangle(ctx);
                break;
            default:
                this.drawCircle(ctx);
        }
        
        ctx.restore();
    }
    
    drawCircle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSquare(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    
    drawSpark(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 2;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size, this.y);
        ctx.lineTo(this.x + this.size, this.y);
        ctx.stroke();
    }
    
    drawDebris(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    
    drawStar(ctx) {
        ctx.fillStyle = this.color;
        this.drawStarShape(ctx, this.x, this.y, 5, this.size, this.size/2);
    }
    
    drawTrail(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.stroke();
    }
    
    drawLine(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x - this.size * 2, this.y);
        ctx.lineTo(this.x + this.size * 2, this.y);
        ctx.stroke();
    }
    
    drawTriangle(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x - this.size, this.y + this.size);
        ctx.lineTo(this.x + this.size, this.y + this.size);
        ctx.closePath();
        ctx.fill();
    }
    
    drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.activeEffects = new Map();
        this.maxParticles = 200;
    }
    
    // Update all particles
    update(deltaTime) {
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            const isAlive = particle.update(deltaTime);
            
            if (!isAlive) {
                this.particles.splice(i, 1);
            }
        }
        
        // Limit particle count for performance
        if (this.particles.length > this.maxParticles) {
            this.particles = this.particles.slice(-this.maxParticles);
        }
    }
    
    // Draw all particles
    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }
    
    // Create explosion effect
    createExplosion(x, y, options = {}) {
        const count = options.count || 20;
        const colors = options.colors || ['#ff9900', '#ff6600', '#ffff00'];
        const color = typeof options.color === 'string' ? options.color : 
                     colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < count; i++) {
            const speed = Math.random() * 8 + 2;
            const angle = (Math.PI * 2 * i) / count;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            const particleType = Math.random() < 0.5 ? 'circle' : 'square';
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: Math.random() * 6 + 2,
                color: color,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                type: particleType,
                gravity: 0.1
            }));
        }
        
        // Create some sparks
        for (let i = 0; i < 10; i++) {
            const speed = Math.random() * 10 + 5;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: Math.random() * 4 + 1,
                color: '#ffff99',
                life: 1.0,
                decay: 0.03 + Math.random() * 0.03,
                type: 'spark',
                gravity: 0.15
            }));
        }
    }
    
    // Create near miss effect
    createNearMiss(x, y) {
        // Create star burst effect
        for (let i = 0; i < 8; i++) {
            const speed = 3;
            const angle = (Math.PI * 2 * i) / 8;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: 3,
                color: '#00ffff',
                life: 1.0,
                decay: 0.05,
                type: 'star'
            }));
        }
        
        // Create speed lines
        for (let i = -2; i <= 2; i++) {
            if (i === 0) continue;
            
            this.particles.push(new Particle(x + i * 10, y, {
                vx: 0,
                vy: -5,
                size: Math.abs(i) * 2 + 1,
                color: '#ffffff',
                life: 0.8,
                decay: 0.08,
                type: 'trail'
            }));
        }
    }
    
    // Create power-up collection effect
    createPowerUpEffect(x, y, color) {
        // Create expanding ring
        for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            const vx = Math.cos(angle) * 4;
            const vy = Math.sin(angle) * 4;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: 3,
                color: color,
                life: 1.0,
                decay: 0.02,
                type: 'circle'
            }));
        }
        
        // Create sparkles
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: Math.random() * 4 + 2,
                color: '#ffffff',
                life: 1.0,
                decay: 0.03,
                type: 'star'
            }));
        }
    }
    
    // Create shield break effect
    createShieldBreak(x, y) {
        // Create shattered shield pieces
        for (let i = 0; i < 12; i++) {
            const speed = Math.random() * 4 + 2;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: Math.random() * 8 + 4,
                color: '#00ccff',
                life: 1.0,
                decay: 0.02,
                type: 'debris',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            }));
        }
        
        // Create electrical sparks
        for (let i = 0; i < 8; i++) {
            const speed = Math.random() * 6 + 3;
            const angle = Math.random() * Math.PI * 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new Particle(x, y, {
                vx: vx,
                vy: vy,
                size: Math.random() * 3 + 1,
                color: '#ffffff',
                life: 0.8,
                decay: 0.04,
                type: 'spark'
            }));
        }
    }
    
    // Create speed boost effect
    createSpeedBoost(x, y) {
        // Create speed lines
        for (let i = 0; i < 5; i++) {
            const offsetX = (Math.random() - 0.5) * 30;
            const speed = Math.random() * 2 + 8;
            
            this.particles.push(new Particle(x + offsetX, y + 10, {
                vx: 0,
                vy: -speed,
                size: 2,
                color: '#ff9900',
                life: 0.7,
                decay: 0.1,
                type: 'trail'
            }));
        }
    }
    
    // Create exhaust smoke
    createExhaust(x, y, options = {}) {
        const colors = ['#666666', '#888888', '#aaaaaa'];
        
        for (let i = 0; i < 3; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y,
                {
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 2 - 1,
                    size: Math.random() * 8 + 4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: 0.6,
                    decay: 0.02,
                    type: 'circle'
                }
            ));
        }
    }
    
    // Create speed lines effect
    createSpeedLines(x, y, options = {}) {
        const count = options.count || 5;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * GAME_CONSTANTS.LANE_WIDTH,
                y,
                {
                    vx: 0,
                    vy: Math.random() * 8 + 4,
                    size: Math.random() * 2 + 1,
                    color: '#ffffff',
                    life: 0.8,
                    decay: 0.03,
                    type: 'line'
                }
            ));
        }
    }
    
    // Create spark effect for power-ups
    createSparkles(x, y, options = {}) {
        const count = options.count || 10;
        const color = options.color || '#ffff00';
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 2 + 1,
                color: color,
                life: 1.0,
                decay: 0.02,
                type: 'star',
                rotationSpeed: (Math.random() - 0.5) * 0.2
            }));
        }
    }
    
    // Create trail effect
    createTrail(x, y, options = {}) {
        const color = options.color || '#4d79ff';
        
        this.particles.push(new Particle(x, y, {
            vx: 0,
            vy: 2,
            size: 6,
            color: color,
            life: 0.4,
            decay: 0.05,
            type: 'circle'
        }));
    }
    
    // Create rain effect
    createRain(options = {}) {
        const count = options.count || 5;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                Math.random() * GAME_CONSTANTS.CANVAS_WIDTH,
                -10,
                {
                    vx: 1,
                    vy: Math.random() * 4 + 8,
                    size: 1,
                    color: '#aaaaaa',
                    life: 1.0,
                    decay: 0.01,
                    type: 'line'
                }
            ));
        }
    }
    
    // Reset particle system
    reset() {
        this.particles = [];
        this.activeEffects.clear();
    }
    
    // Get particle count
    count() {
        return this.particles.length;
    }
}

// ParticleSystem class will be instantiated in game.js