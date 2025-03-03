import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.add.image(width / 2, height / 2, 'background');

        // Add game title
        this.add.text(width / 2, height * 0.3, 'FORTRESS SIMULATOR', {
            fontFamily: 'monospace',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add buttons
        const startButton = this.add.image(width / 2, height * 0.5, 'button').setScale(2);
        const startText = this.add.text(width / 2, height * 0.5, 'START GAME', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);

        const optionsButton = this.add.image(width / 2, height * 0.6, 'button').setScale(2);
        const optionsText = this.add.text(width / 2, height * 0.6, 'OPTIONS', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);

        const creditButton = this.add.image(width / 2, height * 0.7, 'button').setScale(2);
        const creditText = this.add.text(width / 2, height * 0.7, 'CREDITS', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);

        // Make buttons interactive
        startButton.setInteractive();
        optionsButton.setInteractive();
        creditButton.setInteractive();

        // Add hover effects
        this.addButtonHoverEffects(startButton);
        this.addButtonHoverEffects(optionsButton);
        this.addButtonHoverEffects(creditButton);

        // Add click effects
        startButton.on('pointerdown', () => {
            this.sound.play('click-sound');
            this.scene.start('GameScene');
        });

        optionsButton.on('pointerdown', () => {
            this.sound.play('click-sound');
            // This would lead to an options scene in a full game
            console.log('Options button clicked');
        });

        creditButton.on('pointerdown', () => {
            this.sound.play('click-sound');
            // This would lead to a credits scene in a full game
            console.log('Credits button clicked');
        });

        // Play background music
        if (!this.sound.get('background-music')) {
            this.sound.play('background-music', {
                loop: true,
                volume: 0.5
            });
        }
    }

    addButtonHoverEffects(button) {
        button.on('pointerover', () => {
            button.setTint(0xdddddd);
        });

        button.on('pointerout', () => {
            button.clearTint();
        });
    }
}