// Achievement system for tracking player milestones

class Achievement {
    constructor(id, name, description, icon, condition) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.condition = condition;
        this.unlocked = false;
        this.unlockDate = null;
    }
    
    // Check if achievement should be unlocked based on game stats
    checkUnlock(stats) {
        if (this.unlocked) return false;
        
        if (this.condition(stats)) {
            this.unlocked = true;
            this.unlockDate = new Date().toISOString();
            return true;
        }
        
        return false;
    }
    
    // Get progress towards achievement (0-1)
    getProgress(stats) {
        if (this.unlocked) return 1;
        
        // For achievements with simple numeric conditions, calculate progress
        if (typeof this.condition === 'function') {
            // Try to extract progress from condition
            // This is a simplified approach - in a real game, you'd have more sophisticated tracking
            return 0; // Default to 0 for complex conditions
        }
        
        return 0;
    }
}

class AchievementManager {
    constructor() {
        this.achievements = this.createAchievements();
        this.unlockedAchievements = this.loadUnlockedAchievements();
        this.pendingNotifications = [];
        this.showNotificationDuration = 5000; // ms
    }
    
    // Create all achievements
    createAchievements() {
        return [
            // Score achievements
            new Achievement(
                'score_100',
                'Rookie',
                'Score 100 points in a single game',
                '🏆',
                stats => stats.highScore >= 100
            ),
            new Achievement(
                'score_500',
                'Expert',
                'Score 500 points in a single game',
                '🏆',
                stats => stats.highScore >= 500
            ),
            new Achievement(
                'score_1000',
                'Master',
                'Score 1000 points in a single game',
                '🏆',
                stats => stats.highScore >= 1000
            ),
            new Achievement(
                'score_5000',
                'Legend',
                'Score 5000 points in a single game',
                '🏆',
                stats => stats.highScore >= 5000
            ),
            
            // Time achievements
            new Achievement(
                'survive_30',
                'Endurance',
                'Survive for 30 seconds',
                '⏱️',
                stats => stats.maxTime >= 30000
            ),
            new Achievement(
                'survive_60',
                'Marathon',
                'Survive for 60 seconds',
                '⏱️',
                stats => stats.maxTime >= 60000
            ),
            new Achievement(
                'survive_120',
                'Immortal',
                'Survive for 120 seconds',
                '⏱️',
                stats => stats.maxTime >= 120000
            ),
            
            // Near miss achievements
            new Achievement(
                'nearmiss_10',
                'Daredevil',
                'Get 10 near misses in a single game',
                '💨',
                stats => stats.maxNearMisses >= 10
            ),
            new Achievement(
                'nearmiss_25',
                'Risk Taker',
                'Get 25 near misses in a single game',
                '💨',
                stats => stats.maxNearMisses >= 25
            ),
            
            // Power-up achievements
            new Achievement(
                'powerup_10',
                'Collector',
                'Collect 10 power-ups',
                '⚡',
                stats => stats.totalPowerUps >= 10
            ),
            new Achievement(
                'powerup_50',
                'Gadgeteer',
                'Collect 50 power-ups',
                '⚡',
                stats => stats.totalPowerUps >= 50
            ),
            
            // Gameplay achievements
            new Achievement(
                'games_10',
                'Committed',
                'Play 10 games',
                '🎮',
                stats => stats.totalGames >= 10
            ),
            new Achievement(
                'games_50',
                'Dedicated',
                'Play 50 games',
                '🎮',
                stats => stats.totalGames >= 50
            ),
            new Achievement(
                'games_100',
                'Veteran',
                'Play 100 games',
                '🎮',
                stats => stats.totalGames >= 100
            ),
            
            // Environment achievements
            new Achievement(
                'environments_all',
                'World Traveler',
                'Play in all environments',
                '🌍',
                stats => stats.environmentsPlayed && stats.environmentsPlayed.size >= 5
            ),
            
            // Difficulty achievements
            new Achievement(
                'insane_complete',
                'Insane',
                'Complete a game on Insane difficulty',
                '😈',
                stats => stats.maxInsaneScore > 0
            ),
            
            // Vehicle achievements
            new Achievement(
                'cars_all',
                'Collector',
                'Play with all car types',
                '🚗',
                stats => stats.carsUsed && stats.carsUsed.size >= 4
            )
        ];
    }
    
    // Initialize achievement system
    init() {
        // Mark achievements as unlocked based on saved data
        for (const achievement of this.achievements) {
            if (this.unlockedAchievements.includes(achievement.id)) {
                achievement.unlocked = true;
            }
        }
    }
    
    // Check for new achievements after a game
    checkAchievements(gameStats) {
        const newUnlocks = [];
        
        for (const achievement of this.achievements) {
            if (achievement.checkUnlock(gameStats)) {
                newUnlocks.push(achievement);
                this.unlockAchievement(achievement.id);
            }
        }
        
        // Add to pending notifications
        if (newUnlocks.length > 0) {
            this.pendingNotifications.push(...newUnlocks);
        }
        
        return newUnlocks;
    }
    
    // Update game stats
    updateStats(gameStats) {
        // Load current stats
        const stats = this.loadStats();
        
        // Update with new game stats
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.highScore = Math.max(stats.highScore || 0, gameStats.score);
        stats.maxTime = Math.max(stats.maxTime || 0, gameStats.gameTime);
        stats.maxNearMisses = Math.max(stats.maxNearMisses || 0, gameStats.nearMisses);
        stats.totalPowerUps = (stats.totalPowerUps || 0) + (gameStats.powerUpsCollected || 0);
        stats.maxInsaneScore = Math.max(stats.maxInsaneScore || 0, 
            gameStats.difficulty === 'insane' ? gameStats.score : 0);
        
        // Track environments played
        if (!stats.environmentsPlayed) stats.environmentsPlayed = new Set();
        if (gameStats.environmentId !== undefined) {
            stats.environmentsPlayed.add(gameStats.environmentId);
        }
        
        // Track cars used
        if (!stats.carsUsed) stats.carsUsed = new Set();
        if (gameStats.carType !== undefined) {
            stats.carsUsed.add(gameStats.carType);
        }
        
        // Save updated stats
        this.saveStats(stats);
        
        return stats;
    }
    
    // Unlock an achievement
    unlockAchievement(achievementId) {
        if (!this.unlockedAchievements.includes(achievementId)) {
            this.unlockedAchievements.push(achievementId);
            this.saveUnlockedAchievements();
            
            // Play achievement sound
            if (typeof soundManager !== 'undefined') {
                soundManager.play('achievement');
            }
            
            // Create celebration effect
            if (typeof particleSystem !== 'undefined') {
                particleSystem.createPowerUpEffect(
                    GAME_CONSTANTS.CANVAS_WIDTH / 2,
                    GAME_CONSTANTS.CANVAS_HEIGHT / 2,
                    '#00ff00'
                );
            }
        }
    }
    
    // Get all achievements
    getAllAchievements() {
        return this.achievements;
    }
    
    // Get unlocked achievements
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }
    
    // Get locked achievements
    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }
    
    // Get count of unlocked achievements
    getUnlockedCount() {
        return this.unlockedAchievements.length;
    }
    
    // Get total count of achievements
    getTotalCount() {
        return this.achievements.length;
    }
    
    // Update pending notifications
    updateNotifications(deltaTime) {
        // This would be used in the game loop to handle notification display timing
        // For simplicity, we'll just keep track of what's pending
    }
    
    // Get pending notifications
    getPendingNotifications() {
        return this.pendingNotifications;
    }
    
    // Clear pending notifications
    clearPendingNotifications() {
        this.pendingNotifications = [];
    }
    
    // Save unlocked achievements to local storage
    saveUnlockedAchievements() {
        try {
            localStorage.setItem('racingGameAchievements', JSON.stringify(this.unlockedAchievements));
            return true;
        } catch (e) {
            console.error('Error saving achievements:', e);
            return false;
        }
    }
    
    // Load unlocked achievements from local storage
    loadUnlockedAchievements() {
        try {
            const data = localStorage.getItem('racingGameAchievements');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading achievements:', e);
            return [];
        }
    }
    
    // Save stats to local storage
    saveStats(stats) {
        try {
            // Convert Sets to Arrays for JSON serialization
            const statsToSave = {
                ...stats,
                environmentsPlayed: stats.environmentsPlayed ? Array.from(stats.environmentsPlayed) : [],
                carsUsed: stats.carsUsed ? Array.from(stats.carsUsed) : []
            };
            localStorage.setItem('racingGameStats', JSON.stringify(statsToSave));
            return true;
        } catch (e) {
            console.error('Error saving stats:', e);
            return false;
        }
    }
    
    // Load stats from local storage
    loadStats() {
        try {
            const data = localStorage.getItem('racingGameStats');
            const stats = data ? JSON.parse(data) : {};
            
            // Convert Arrays back to Sets
            if (stats.environmentsPlayed) {
                stats.environmentsPlayed = new Set(stats.environmentsPlayed);
            }
            if (stats.carsUsed) {
                stats.carsUsed = new Set(stats.carsUsed);
            }
            
            return stats;
        } catch (e) {
            console.error('Error loading stats:', e);
            return {};
        }
    }
}

// Create a global achievement manager instance
const achievementManager = new AchievementManager();