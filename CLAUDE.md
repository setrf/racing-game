# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Highway Racer is a feature-rich, browser-based racing game built with vanilla JavaScript, HTML5 Canvas, and CSS3. The game is a Progressive Web App (PWA) with multiple game modes, achievements, leaderboards, and extensive customization options.

## Development Commands

### Running the Game
```bash
# No build process required - it's a static web app
# Simply serve the files or open index.html in a browser
# For local development:
python3 -m http.server 8000
# or
npx serve .
```

### Testing
The project does not have automated tests. Testing is done manually by:
1. Opening the game in different browsers
2. Testing responsive behavior on different screen sizes
3. Verifying touch controls on mobile devices

### Building
No build process is required - all files are ready for production:
- Assets are inlined (icons are base64-encoded in manifest.json)
- CSS and JavaScript are loaded directly
- Service worker handles caching for PWA functionality

## Architecture Overview

### Core Game System
The game follows a modular architecture with each major feature in its own file:

- **game.js** - Main game loop, state management, and coordination
- **player.js** - Player vehicle controls and physics
- **obstacles.js** - Obstacle generation, movement, and collision detection
- **utils.js** - Shared constants, helper functions, and math utilities

### Key Managers (initialized in game.js)
1. **ObstacleManager** - Spawns and controls traffic obstacles
2. **PowerUpManager** - Handles collectible power-ups and effects
3. **EnvironmentManager** - Manages different visual environments and weather
4. **VehicleManager** - Controls vehicle selection and customization
5. **GameModeManager** - Implements different game modes (Endless, Time Trial, Challenge, Zen)
6. **AchievementManager** - Tracks and unlocks achievements
7. **LeaderboardManager** - Maintains high scores for each mode
8. **SoundManager** - Generates procedural audio using Web Audio API
9. **ParticleSystem** - Creates visual effects and animations
10. **TouchControls** - Handles mobile touch input
11. **AccessibilityManager** - Manages accessibility features

### Game States
The game uses a finite state machine pattern:
- `GameState.MENU` - Main menu and mode selection
- `GameState.PLAYING` - Active gameplay
- `GameState.PAUSED` - Temporary pause
- `GameState.GAME_OVER` - Score display and restart

### Rendering Pipeline
All rendering goes through the main game loop:
1. Clear canvas with environment background
2. Draw road markings and environment effects
3. Render obstacles and power-ups
4. Draw player vehicle
5. Overlay UI elements and particle effects

### Data Persistence
Game data is stored in localStorage:
- High scores (separated by game mode)
- Achievement progress and unlocks
- Player settings and preferences
- Selected vehicle and environment

### Performance Considerations
- Object pooling for frequently created/destroyed objects (obstacles, particles)
- RequestAnimationFrame for smooth 60 FPS rendering
- Dynamic quality adjustment based on device capabilities
- Efficient collision detection using rectangle bounds checking

## Important Implementation Details

### No External Dependencies
The game uses zero external libraries - everything is built with:
- Native browser APIs (Canvas, Web Audio, LocalStorage)
- Vanilla JavaScript (ES6+ features)
- CSS3 for styling

### Coordinate System
- Canvas size: 400x600 pixels
- 4-lane highway system with lane positions pre-calculated
- Y-axis increases downward (standard Canvas orientation)

### Power-Up System
Power-ups use a factory pattern with duration-based effects:
- Shield (protects from collision)
- Speed Boost (increases player speed)
- Slow Motion (reduces obstacle speed)
- Score Multiplier (doubles points)
- Clear Road (removes all obstacles)

### Achievement System
Achievements track various metrics:
- Score milestones
- Time survived
- Near-miss bonuses
- Special challenges
- Game mode completions

### Mobile Optimization
Touch controls are implemented using:
- Touch event listeners for swipe detection
- On-screen buttons for tap controls
- Responsive layout that adapts to screen size
- Haptic feedback where supported

### PWA Features
- Service worker for offline play (sw.js)
- Web App Manifest (manifest.json)
- Responsive design works standalone
- Background sync capabilities (placeholder for future features)

## Common Tasks

### Adding a New Game Mode
1. Create mode definition in gamemodes.js
2. Add UI option in index.html
3. Implement mode-specific logic in GameModeManager
4. Update leaderboard to track mode scores

### Adding a New Achievement
1. Define achievement in achievements.js
2. Add tracking logic in relevant game systems
3. Update UI to display new achievement

### Adding a New Power-Up
1. Create power-up class in powerups.js
2. Add to spawn logic in PowerUpManager
3. Implement visual effects in particle system
4. Add sound effect in sound manager

### Modifying Game Difficulty
- Adjust `DIFFICULTY_SETTINGS` in utils.js
- Modify spawn rates in ObstacleManager
- Update speed multipliers in game loop

## File Structure Notes

- All JavaScript files are loaded synchronously in index.html
- CSS uses a single file (style.css) with feature sections
- No bundling or minification is used for easy debugging
- Version query parameters (?v=3) prevent caching during development