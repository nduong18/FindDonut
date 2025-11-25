// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    // Set path
    this.load.setPath("assets");
    // Load images
    this.load.image("box", "images/box.png");
    this.load.image("orange_donut", "images/orange_donut.png");
    this.load.image("blue_donut", "images/blue_donut.png");
    this.load.image("pink_donut", "images/pink_donut.png");
    this.load.image("star", "images/star.png");
    // Load sounds
    this.load.audio("pop", "sounds/pop.mp3");
    this.load.audio("background_music", "sounds/background_music.mp3");
    // Load finger click animation
    this.load.spritesheet("fingerclick", "animations/fingerclick200x200.png", {
      frameWidth: 200,
      frameHeight: 200,
    });
  }

  create() {
    this.scene.start("Game");
  }
}
