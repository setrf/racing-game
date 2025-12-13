// Leaderboard system for tracking top scores

class LeaderboardManager {
    constructor() {
        this.maxEntries = 10;
        this.storageKey = 'racingGameLeaderboard';
        this.leaderboard = this.loadLeaderboard();
        this.playerName = '';
        this.currentGameMode = 'endless';
    }
    
    // Load leaderboard from local storage
    loadLeaderboard() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsedData = JSON.parse(data);
                // Handle both old format (array) and new format (object with modes)
                return Array.isArray(parsedData) ? 
                    { endless: parsedData, timeTrial: [], challenge: [], zen: [] } :
                    { endless: [], timeTrial: [], challenge: [], zen: [], ...parsedData };
            }
            return { endless: [], timeTrial: [], challenge: [], zen: [] };
        } catch (e) {
            console.error('Error loading leaderboard:', e);
            return { endless: [], timeTrial: [], challenge: [], zen: [] };
        }
    }
    
    // Save leaderboard to local storage
    saveLeaderboard() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.leaderboard));
            return true;
        } catch (e) {
            console.error('Error saving leaderboard:', e);
            return false;
        }
    }
    
    // Add a new score to the leaderboard
    addScore(score, gameMode = 'endless', playerName = '') {
        // Get current mode leaderboard or initialize if needed
        if (!this.leaderboard[gameMode]) {
            this.leaderboard[gameMode] = [];
        }
        
        const entry = {
            score: score,
            playerName: playerName || 'Anonymous',
            gameMode: gameMode,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };
        
        this.leaderboard[gameMode].push(entry);
        
        // Sort by score (descending)
        this.leaderboard[gameMode].sort((a, b) => b.score - a.score);
        
        // Keep only top entries
        if (this.leaderboard[gameMode].length > this.maxEntries) {
            this.leaderboard[gameMode] = this.leaderboard[gameMode].slice(0, this.maxEntries);
        }
        
        // Save to local storage
        this.saveLeaderboard();
        
        // Return the rank of the new entry
        return this.getRank(score, gameMode);
    }
    
    // Get the rank of a score in a specific game mode
    getRank(score, gameMode) {
        const modeLeaderboard = this.leaderboard[gameMode] || [];
        for (let i = 0; i < modeLeaderboard.length; i++) {
            if (modeLeaderboard[i].score === score) {
                return i + 1;
            }
        }
        return -1;
    }
    
    // Get top scores for all game modes
    getTopScores(limit = this.maxEntries) {
        const allScores = [];
        
        // Combine scores from all modes
        Object.values(this.leaderboard).forEach(modeScores => {
            modeScores.forEach(entry => {
                allScores.push(entry);
            });
        });
        
        // Sort by score (descending)
        allScores.sort((a, b) => b.score - a.score);
        
        // Return top scores
        return allScores.slice(0, limit);
    }
    
    // Get top scores for a specific game mode
    getTopScoresByGameMode(gameMode, limit = this.maxEntries) {
        const modeLeaderboard = this.leaderboard[gameMode] || [];
        return modeLeaderboard.slice(0, limit);
    }
    
    // Get top scores by difficulty
    getTopScoresByDifficulty(difficulty, limit = 5) {
        const allScores = [];
        
        // Combine scores from all modes and filter by difficulty
        Object.values(this.leaderboard).forEach(modeScores => {
            modeScores.forEach(entry => {
                if (entry.difficulty === difficulty) {
                    allScores.push(entry);
                }
            });
        });
        
        // Sort by score (descending)
        allScores.sort((a, b) => b.score - a.score);
        
        // Return top scores
        return allScores.slice(0, limit);
    }
    
    // Clear all scores
    clearLeaderboard() {
        this.leaderboard = { endless: [], timeTrial: [], challenge: [], zen: [] };
        this.saveLeaderboard();
    }
    
    // Clear scores for a specific game mode
    clearGameModeLeaderboard(gameMode) {
        this.leaderboard[gameMode] = [];
        this.saveLeaderboard();
    }
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    // Get formatted time from timestamp
    getFormattedTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    }
    
    // Format score with commas
    formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    // Render leaderboard to a table
    renderLeaderboard(gameMode = 'endless') {
        const leaderboard = this.getTopScoresByGameMode(gameMode);
        const leaderboardBody = document.getElementById('leaderboardBody');
        const emptyMessage = document.getElementById('emptyLeaderboard');
        
        // If elements don't exist, don't try to render
        if (!leaderboardBody || !emptyMessage) return;
        
        // Clear existing content
        leaderboardBody.innerHTML = '';
        
        if (leaderboard.length === 0) {
            // Show empty message
            emptyMessage.classList.remove('hidden');
            document.getElementById('leaderboardTable').classList.add('hidden');
        } else {
            // Hide empty message and show table
            emptyMessage.classList.add('hidden');
            document.getElementById('leaderboardTable').classList.remove('hidden');
            
            // Add entries
            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                
                // Format date
                const date = new Date(entry.date);
                const formattedDate = date.toLocaleDateString();
                
                // Create cells
                const rankCell = document.createElement('td');
                rankCell.textContent = index + 1;
                
                const nameCell = document.createElement('td');
                nameCell.textContent = entry.playerName;
                
                const scoreCell = document.createElement('td');
                scoreCell.textContent = this.formatScore(entry.score);
                
                const dateCell = document.createElement('td');
                dateCell.textContent = formattedDate;
                
                // Add cells to row
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                row.appendChild(dateCell);
                
                // Add special styling for top 3
                if (index < 3) {
                    row.classList.add('top-score');
                }
                
                // Add row to table
                leaderboardBody.appendChild(row);
            });
        }
    }
    
    // Setup leaderboard UI
    setupUI() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                // Update active tab
                document.querySelectorAll('.tab-button').forEach(tab => {
                    tab.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Update current tab
                this.currentGameMode = e.target.getAttribute('data-tab');
                
                // Render leaderboard for selected tab
                this.renderLeaderboard(this.currentGameMode);
            });
        });
        
        // Render initial tab
        this.renderLeaderboard(this.currentGameMode);
    }
    
    // Prompt for player name and add score
    saveScore(score, gameMode = 'endless') {
        // Prompt for player name
        const name = prompt(`Congratulations! You scored ${score} points. Enter your name for the leaderboard:`) || 'Anonymous';
        
        // Add score to leaderboard
        const rank = this.addScore(score, gameMode, name);
        
        // Show rank if made it to leaderboard
        if (rank) {
            alert(`Your score ranked #${rank} on the ${gameMode} leaderboard!`);
        } else {
            alert(`Your score was good, but didn't make the top ${this.maxEntries} on the ${gameMode} leaderboard. Try again!`);
        }
        
        // Update the UI to show the new leaderboard
        this.renderLeaderboard(gameMode);
    }
}

// Create a global leaderboard manager instance
const leaderboardManager = new LeaderboardManager();