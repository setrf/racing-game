// Accessibility features for the racing game

class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            colorBlindMode: 'normal', // normal, protanopia, deuteranopia, tritanopia
            difficulty: 'normal' // easy, normal, hard
        };
        
        this.loadSettings();
        this.applySettings();
    }
    
    // Load settings from localStorage
    loadSettings() {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('racingGameAccessibility') || '{}');
            
            if (savedSettings.highContrast !== undefined) {
                this.settings.highContrast = savedSettings.highContrast;
            }
            
            if (savedSettings.reducedMotion !== undefined) {
                this.settings.reducedMotion = savedSettings.reducedMotion;
            }
            
            if (savedSettings.largeText !== undefined) {
                this.settings.largeText = savedSettings.largeText;
            }
            
            if (savedSettings.colorBlindMode !== undefined) {
                this.settings.colorBlindMode = savedSettings.colorBlindMode;
            }
            
            if (savedSettings.difficulty !== undefined) {
                this.settings.difficulty = savedSettings.difficulty;
            }
        } catch (error) {
            console.warn("Failed to load accessibility settings:", error);
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        try {
            localStorage.setItem('racingGameAccessibility', JSON.stringify(this.settings));
        } catch (error) {
            console.warn("Failed to save accessibility settings:", error);
        }
    }
    
    // Apply settings to DOM and game
    applySettings() {
        this.applyHighContrast();
        this.applyReducedMotion();
        this.applyLargeText();
        this.applyColorBlindMode();
        this.applyDifficulty();
    }
    
    // Apply high contrast mode
    applyHighContrast() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    // Apply reduced motion
    applyReducedMotion() {
        if (this.settings.reducedMotion) {
            document.body.classList.add('reduced-motion');
            
            // Reduce visual effects
            if (typeof particleSystem !== 'undefined') {
                particleSystem.maxParticles = 50; // Reduce max particles
            }
        } else {
            document.body.classList.remove('reduced-motion');
            
            // Restore normal visual effects
            if (typeof particleSystem !== 'undefined') {
                particleSystem.maxParticles = 200; // Restore normal max
            }
        }
    }
    
    // Apply large text
    applyLargeText() {
        if (this.settings.largeText) {
            document.body.classList.add('large-text');
        } else {
            document.body.classList.remove('large-text');
        }
    }
    
    // Apply color blind mode
    applyColorBlindMode() {
        // Remove any existing colorblind classes
        document.body.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
        
        // Add new colorblind class if needed
        if (this.settings.colorBlindMode !== 'normal') {
            document.body.classList.add(`colorblind-${this.settings.colorBlindMode}`);
        }
        
        // Store color mapping for use in game
        this.adjustColorPalette();
    }
    
    // Apply difficulty settings
    applyDifficulty() {
        // Apply difficulty modifiers to game
        switch(this.settings.difficulty) {
            case 'easy':
                document.body.classList.add('easy');
                break;
            case 'hard':
                document.body.classList.add('hard');
                break;
            default:
                document.body.classList.remove('easy', 'hard');
        }
        
        // Apply game speed modifier
        if (typeof obstacleManager !== 'undefined') {
            const speedMultiplier = this.getSpeedMultiplier();
            obstacleManager.difficultyMultiplier = speedMultiplier;
        }
    }
    
    // Get speed multiplier based on difficulty
    getSpeedMultiplier() {
        switch(this.settings.difficulty) {
            case 'easy':
                return 0.8; // 20% slower
            case 'hard':
                return 1.2; // 20% faster
            default:
                return 1.0; // Normal speed
        }
    }
    
    // Adjust color palette for colorblind modes
    adjustColorPalette() {
        // Color mappings for different types of colorblindness
        const colorMappings = {
            normal: {
                red: '#ff4d4d',
                green: '#4dff4d',
                blue: '#4d79ff',
                yellow: '#ffcc33',
                orange: '#ff9900',
                purple: '#9900ff',
                cyan: '#00ffff'
            },
            protanopia: {
                red: '#0080ff', // Replace red with blue
                green: '#ffcc00', // Replace green with yellow
                blue: '#4d79ff',
                yellow: '#ffcc33',
                orange: '#ffcc00', // Replace orange with yellow
                purple: '#4d79ff', // Replace purple with blue
                cyan: '#00ffff'
            },
            deuteranopia: {
                red: '#800080', // Replace red with purple
                green: '#ffff00', // Replace green with yellow
                blue: '#4d79ff',
                yellow: '#ffcc33',
                orange: '#ffff00', // Replace orange with yellow
                purple: '#800080',
                cyan: '#00ffff'
            },
            tritanopia: {
                red: '#008080', // Replace red with teal
                green: '#ffcc00', // Replace green with yellow
                blue: '#4d79ff',
                yellow: '#ffcc33',
                orange: '#ffcc00', // Replace orange with yellow
                purple: '#008080', // Replace purple with teal
                cyan: '#00ffff'
            }
        };
        
        // Apply the color mapping
        const mapping = colorMappings[this.settings.colorBlindMode] || colorMappings.normal;
        
        // Store for use in game
        window.accessibilityColors = mapping;
    }
    
    // Set up UI controls
    setupUIControls() {
        // High contrast
        const highContrastCheckbox = document.getElementById('highContrast');
        if (highContrastCheckbox) {
            highContrastCheckbox.checked = this.settings.highContrast;
            highContrastCheckbox.addEventListener('change', () => {
                this.settings.highContrast = highContrastCheckbox.checked;
                this.applyHighContrast();
                this.saveSettings();
            });
        }
        
        // Reduced motion
        const reducedMotionCheckbox = document.getElementById('reducedMotion');
        if (reducedMotionCheckbox) {
            reducedMotionCheckbox.checked = this.settings.reducedMotion;
            reducedMotionCheckbox.addEventListener('change', () => {
                this.settings.reducedMotion = reducedMotionCheckbox.checked;
                this.applyReducedMotion();
                this.saveSettings();
            });
        }
        
        // Large text
        const largeTextCheckbox = document.getElementById('largeText');
        if (largeTextCheckbox) {
            largeTextCheckbox.checked = this.settings.largeText;
            largeTextCheckbox.addEventListener('change', () => {
                this.settings.largeText = largeTextCheckbox.checked;
                this.applyLargeText();
                this.saveSettings();
            });
        }
        
        // Colorblind mode
        const colorBlindModeSelect = document.getElementById('colorBlindMode');
        if (colorBlindModeSelect) {
            colorBlindModeSelect.value = this.settings.colorBlindMode;
            colorBlindModeSelect.addEventListener('change', () => {
                this.settings.colorBlindMode = colorBlindModeSelect.value;
                this.applyColorBlindMode();
                this.saveSettings();
            });
        }
        
        // Difficulty
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            difficultySelect.value = this.settings.difficulty;
            difficultySelect.addEventListener('change', () => {
                this.settings.difficulty = difficultySelect.value;
                this.applyDifficulty();
                this.saveSettings();
            });
        }
    }
    
    // Get accessible color
    getAccessibleColor(colorName) {
        if (window.accessibilityColors && window.accessibilityColors[colorName]) {
            return window.accessibilityColors[colorName];
        }
        
        // Default colors if no mapping available
        const defaultColors = {
            red: '#ff4d4d',
            green: '#4dff4d',
            blue: '#4d79ff',
            yellow: '#ffcc33',
            orange: '#ff9900',
            purple: '#9900ff',
            cyan: '#00ffff'
        };
        
        return defaultColors[colorName] || colorName;
    }
    
    // Create accessibility settings UI
    createSettingsUI() {
        // Check if settings UI already exists
        const existingUI = document.getElementById('accessibilitySettings');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Create settings container
        const settingsContainer = document.createElement('div');
        settingsContainer.id = 'accessibilitySettings';
        settingsContainer.className = 'settings-panel';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Accessibility Settings';
        settingsContainer.appendChild(title);
        
        // Create form
        const form = document.createElement('form');
        form.className = 'settings-form';
        
        // High contrast toggle
        const highContrastGroup = this.createToggleSetting(
            'highContrast',
            'High Contrast',
            'Increase contrast for better visibility'
        );
        form.appendChild(highContrastGroup);
        
        // Reduced motion toggle
        const reducedMotionGroup = this.createToggleSetting(
            'reducedMotion',
            'Reduced Motion',
            'Reduce visual effects for motion sensitivity'
        );
        form.appendChild(reducedMotionGroup);
        
        // Large text toggle
        const largeTextGroup = this.createToggleSetting(
            'largeText',
            'Large Text',
            'Increase text size for better readability'
        );
        form.appendChild(largeTextGroup);
        
        // Color blind mode select
        const colorBlindGroup = this.createSelectSetting(
            'colorBlindMode',
            'Color Blind Mode',
            'Adjust colors for different types of color blindness',
            [
                { value: 'normal', text: 'Normal' },
                { value: 'protanopia', text: 'Protanopia (Red-Blind)' },
                { value: 'deuteranopia', text: 'Deuteranopia (Green-Blind)' },
                { value: 'tritanopia', text: 'Tritanopia (Blue-Blind)' }
            ]
        );
        form.appendChild(colorBlindGroup);
        
        // Difficulty select
        const difficultyGroup = this.createSelectSetting(
            'difficulty',
            'Difficulty',
            'Adjust game difficulty',
            [
                { value: 'easy', text: 'Easy' },
                { value: 'normal', text: 'Normal' },
                { value: 'hard', text: 'Hard' }
            ]
        );
        form.appendChild(difficultyGroup);
        
        settingsContainer.appendChild(form);
        
        // Add to page
        document.body.appendChild(settingsContainer);
        
        // Set up event listeners
        this.setupUIControls();
        
        // Return container for positioning
        return settingsContainer;
    }
    
    // Create toggle setting UI
    createToggleSetting(id, label, description) {
        const group = document.createElement('div');
        group.className = 'setting-group';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.checked = this.settings[id];
        
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;
        
        const desc = document.createElement('div');
        desc.className = 'setting-description';
        desc.textContent = description;
        
        group.appendChild(input);
        group.appendChild(labelElement);
        group.appendChild(desc);
        
        return group;
    }
    
    // Create select setting UI
    createSelectSetting(id, label, description, options) {
        const group = document.createElement('div');
        group.className = 'setting-group';
        
        const labelElement = document.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;
        
        const select = document.createElement('select');
        select.id = id;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            select.appendChild(optionElement);
        });
        
        select.value = this.settings[id];
        
        const desc = document.createElement('div');
        desc.className = 'setting-description';
        desc.textContent = description;
        
        group.appendChild(labelElement);
        group.appendChild(select);
        group.appendChild(desc);
        
        return group;
    }
    
    // Show settings UI
    showSettings() {
        let settingsUI = document.getElementById('accessibilitySettings');
        
        if (!settingsUI) {
            settingsUI = this.createSettingsUI();
            
            // Position and style
            settingsUI.style.position = 'fixed';
            settingsUI.style.top = '50%';
            settingsUI.style.left = '50%';
            settingsUI.style.transform = 'translate(-50%, -50%)';
            settingsUI.style.zIndex = '1000';
            settingsUI.style.backgroundColor = 'rgba(0,0,0,0.8)';
            settingsUI.style.padding = '20px';
            settingsUI.style.borderRadius = '10px';
            settingsUI.style.color = 'white';
            settingsUI.style.maxWidth = '400px';
            
            // Add close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.marginTop = '10px';
            closeButton.addEventListener('click', () => {
                settingsUI.style.display = 'none';
            });
            settingsUI.appendChild(closeButton);
        } else {
            settingsUI.style.display = 'block';
        }
    }
    
    // Hide settings UI
    hideSettings() {
        const settingsUI = document.getElementById('accessibilitySettings');
        if (settingsUI) {
            settingsUI.style.display = 'none';
        }
    }
}

// AccessibilityManager class will be instantiated in game.js