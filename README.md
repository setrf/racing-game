# Highway Racer

A simple, fun, and addictive web-based top-down racing game built with HTML5 Canvas, CSS3, and vanilla JavaScript.

## Game Description

Navigate through traffic in this endless racing game! Dodge other vehicles and obstacles as long as you can while the speed progressively increases. Test your reflexes and compete for the high score!

## How to Play

### Controls
- **Arrow Keys (← →)** or **A/D**: Move left/right between lanes
- **ESC**: Pause/Resume game

### Objective
Survive as long as possible while avoiding obstacles. The game gets progressively harder as your speed increases over time.

### Scoring
- **Time Survival**: Earn 1 point for every 100ms you survive
- **Near Misses**: Get bonus points for dodging obstacles at the last second

## Features

- **Smooth Gameplay**: 60 FPS game loop with requestAnimationFrame
- **Progressive Difficulty**: Speed increases every 5 seconds
- **Visual Effects**: Screen shake on collision, animated lane markings
- **Score Tracking**: High score saved locally in your browser
- **Responsive Design**: Works on desktop and mobile devices
- **Multiple Obstacle Types**: Cars, trucks, and barriers with different colors

## Technical Details

### Technology Stack
- **HTML5 Canvas**: For game rendering
- **Vanilla JavaScript**: Game logic and state management
- **CSS3**: UI styling and responsive design
- **LocalStorage**: For high score persistence

### File Structure
```
racing-game/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Game styling
├── js/
│   ├── game.js             # Main game loop and state management
│   ├── player.js           # Player car logic and controls
│   ├── obstacles.js        # Obstacle generation and movement
│   └── utils.js            # Helper functions and constants
├── assets/                 # Asset folders (currently empty)
│   ├── images/
│   └── sounds/
└── README.md               # This file
```

## Game Architecture

### Core Components

1. **Player**: Manages the player's car with smooth lane transitions
2. **Obstacle Manager**: Generates and controls obstacles with increasing difficulty
3. **Game Controller**: Handles game states, input, and scoring
4. **Collision Detection**: Rectangle-based collision detection system
5. **Visual Effects**: Screen shake and animations for better feedback

### Game States

1. **Menu**: Start screen with instructions and high score
2. **Playing**: Active gameplay with HUD
3. **Paused**: Temporary game pause
4. **Game Over**: End screen with final score and restart option

## Getting Started

1. Clone or download the repository
2. Open `index.html` in your web browser
3. Click "Start Game" to begin playing

## Browser Compatibility

The game works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (with touch controls to be implemented)

## Future Enhancements

Potential features for future versions:
- Sound effects and background music
- Power-ups and special abilities
- Multiple game modes
- Vehicle customization
- Leaderboard system
- Mobile touch controls
- Multiple road environments

## Contributing

This is a simple project for educational purposes. Feel free to fork it and make your own improvements!

## License

This project is open source and available under the [MIT License](LICENSE).

---

Enjoy the game and try to beat your high score!