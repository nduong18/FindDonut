// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        // Set path
        this.load.setPath('assets');
        // Load images
        this.load.image('orange_donut', 'images/orange_donut.png');
        this.load.image('blue_donut', 'images/blue_donut.png');
        this.load.image('pink_donut', 'images/pink_donut.png');
        // Load sounds
        this.load.audio('pop','sounds/pop.mp3');
        this.load.audio('pop','sounds/pop.mp3');       
    }

    create() {
        this.scene.start('Game');
    }

}
