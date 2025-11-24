import { Preloader } from './scenes/Preloader.js';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'DonutMatch',
    description: '',
    parent: 'game-container',
    width: 800,
    height: 1200,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Preloader, Game
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        arcade: {
            debug: false,
            gravity: {y: 1.5}
        },
    },
}

new Phaser.Game(config);
            