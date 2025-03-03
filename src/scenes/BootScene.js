import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the loading screen
        this.load.image('loading-background', 'assets/images/loading-background.png');
        this.load.image('loading-bar', 'assets/images/loading-bar.png');
    }

    create() {
        // Set up any game settings
        this.cameras.main.setBackgroundColor('#000000');
        
        // Transition to the preload scene
        this.scene.start('PreloadScene');
    }
}