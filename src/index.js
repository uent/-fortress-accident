import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';

// Enable hot module replacement for Vite
if (import.meta.hot) {
  import.meta.hot.accept();
}

// Use environment variables if available from Vite
const gameWidth = import.meta.env.VITE_GAME_WIDTH || 800;
const gameHeight = import.meta.env.VITE_GAME_HEIGHT || 600;

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene
    ]
};

// Initialize the game
const game = new Phaser.Game(config);

// Add game to window for debugging purposes
window.game = game;

// Let parent window know that the game is loaded
window.addEventListener('load', () => {
    console.log('Fortress Simulator loaded!', import.meta.env.MODE);
});