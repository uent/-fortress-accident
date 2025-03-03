import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Display loading screen
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add loading background and progress bar
        const background = this.add.image(width / 2, height / 2, 'loading-background');
        const loadingBar = this.add.image(width / 2, height / 2, 'loading-bar');
        
        // Set up progress bar animation
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        // Add loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        // Update progress bar as assets are loaded
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        // Load game assets
        this.loadGameAssets();
        
        // When loading is complete
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            loadingBar.destroy();
            background.destroy();
        });
    }

    loadGameAssets() {
        // For Vite development, try to use the asset import system
        if (import.meta && import.meta.env && import.meta.env.DEV) {
            try {
                // Dynamic import for Vite's asset handling
                import('@assets').then(({ preloadAssets }) => {
                    preloadAssets(this);
                    
                    // We still need to load sprite sheets with specific frame data
                    this.loadSpriteSheets();
                }).catch(error => {
                    console.warn('Asset module not available, using standard loading', error);
                    this.loadStandardAssets();
                });
            } catch (error) {
                console.warn('Error using asset import system, falling back to standard loading', error);
                this.loadStandardAssets();
            }
        } else {
            // Standard asset loading for production builds
            this.loadStandardAssets();
        }
    }
    
    loadSpriteSheets() {
        // Sprite sheets with specific frame data
        this.load.spritesheet('colonist', 'assets/sprites/colonist.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('buildings', 'assets/sprites/buildings.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('terrain', 'assets/sprites/terrain.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('resources', 'assets/sprites/resources.png', { frameWidth: 32, frameHeight: 32 });
    }
    
    loadStandardAssets() {
        // Sprite sheets
        this.loadSpriteSheets();
        
        // Images
        this.load.image('background', 'assets/images/background.png');
        this.load.image('ui-panel', 'assets/images/ui-panel.png');
        this.load.image('button', 'assets/images/button.png');
        
        // Audio
        this.load.audio('background-music', 'assets/audio/background-music.mp3');
        this.load.audio('build-sound', 'assets/audio/build-sound.mp3');
        this.load.audio('click-sound', 'assets/audio/click-sound.mp3');
    }

    create() {
        // Create animations
        this.createAnimations();
        
        // Transition to the main menu scene
        this.scene.start('MainMenuScene');
    }

    createAnimations() {
        // Colonist animations
        this.anims.create({
            key: 'colonist-walk-down',
            frames: this.anims.generateFrameNumbers('colonist', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'colonist-walk-up',
            frames: this.anims.generateFrameNumbers('colonist', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'colonist-walk-left',
            frames: this.anims.generateFrameNumbers('colonist', { start: 8, end: 11 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'colonist-walk-right',
            frames: this.anims.generateFrameNumbers('colonist', { start: 12, end: 15 }),
            frameRate: 10,
            repeat: -1
        });
    }
}