// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.donutList = ["orange_donut", "blue_donut", "pink_donut"];
    this.complimentText = ["EXCELLENT JOB!", "GOOD JOB!", "GREAT JOB!"];
    this.boxes = [];
    this.winner = false;
    this.currentScore = 0;
    this.maxScore = 0;
    this.donutsPerBox = 25;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x313131);
    this.sound.play("background_music", { loop: true, volume: 0.3 });

    // Create finger click animations
    this.anims.create({
      key: "fingerclick",
      frames: this.anims.generateFrameNumbers("fingerclick", {
        start: 0,
        end: 23,
      }),
      frameRate: 30,
      repeat: -1,
    });

    const width = this.scale.width;
    const height = this.scale.height;

    this.matter.add.rectangle(width / 2, height + 10, width, 20, {
      isStatic: true,
    }); // bottom
    this.matter.add.rectangle(-10, height / 2, 20, height, { isStatic: true }); // left
    this.matter.add.rectangle(width + 10, height / 2, 20, height, {
      isStatic: true,
    }); // right

    const spacingX = 120;
    const spacingY = 120;

    const cols = Math.floor((width - 80) / spacingX);
    const rows = 15;

    // Spawn Donuts
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const key =
          this.donutList[Math.floor(Math.random() * this.donutList.length)];
        const x = 100 + j * spacingX;
        const y = 300 - i * spacingY;
        let donut = this.matter.add.image(x, y, key);
        donut.type = key;

        donut.setScale(0.5);
        donut.setCircle((donut.width * 0.5) / 2);
        donut.setBounce(0.2);
        donut.setFriction(0.05);
        donut.setMass(2);

        donut.setInteractive();
        donut.on("pointerdown", () => this.onClickDonut(donut));
      }
    }

    // Header
    this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, width, 300);

    // Box
    const boxCounts = this.donutList.length;
    const boxSpacingX = 250;
    const boxY = 150;
    for (let i = 0; i < boxCounts; i++) {
      const boxX = 150 + boxSpacingX * i;
      const boxContainer = this.add.container(boxX, boxY);
      const boxImg = this.add.image(0, 0, "box");
      const donut = this.add.image(0, -30, this.donutList[i]).setScale(0.5);

      boxContainer.donutCounts = this.donutsPerBox;
      const text = this.add
        .text(0, 60, "x" + boxContainer.donutCounts, {
          fontFamily: "Arial Black",
          fontSize: "50px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 10,
        })
        .setOrigin(0.5);

      boxContainer.add([boxImg, donut, text]);

      boxContainer.type = this.donutList[i];
      boxContainer.box = boxImg;
      boxContainer.donut = donut;
      boxContainer.text = text;

      this.boxes.push(boxContainer);
    }

    this.maxScore = this.boxes.length * this.donutsPerBox;

    this.add.sprite(400, 600, "fingerclick").play("fingerclick");
  }

  onClickDonut(donut) {
    // Check Winner
    if (this.currentScore >= this.maxScore) {
      if (!this.winner) {
        const winnerText = this.add
          .text(400, 600, "WINNER", {
            fontFamily: "Arial Black",
            fontSize: "100px",
            color: "#ffea00",
            stroke: "#000000",
            strokeThickness: 10,
          })
          .setOrigin(0.5);

        this.tweens.add({
          targets: winnerText,
          scale: 1.2,
          duration: 400,
          yoyo: true,
          loop: -1,
          ease: "Linear",
        });
        this.winner = true;
      }
      return;
    }

    // Handle donut
    if (donut.destroyed) return;
    donut.destroyed = true;

    let targetX = 0;
    let targetY = 0;
    let targetBox = null;
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];
      if (donut.type === box.type) {
        targetX = box.x;
        targetY = box.y;
        targetBox = box;
        if (box.donutCounts > 0) {
          box.donutCounts -= 1;
        }
        break;
      }
    }

    // Set donut status
    donut.setSensor(true);
    donut.setIgnoreGravity(true);
    donut.setDepth(999);

    // Move donut to box and popup box
    this.tweens.add({
      targets: donut,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Linear",
      onComplete: () => {
        if (targetBox) {
          this.tweens.add({
            targets: [targetBox.box, targetBox.text],
            scale: 1.1,
            duration: 200,
            ease: "Linear",
            yoyo: true,
            onActive: () => {
              targetBox.box.preFX.setPadding(32);
              const fx = targetBox.box.preFX.addGlow();
              this.tweens.add({
                targets: fx,
                color: 0xffea00,
                outerStrength: 8,
                duration: 400,
                ease: "Linear",
                onComplete: () => {
                  fx.destroy();
                },
              });
              this.tweens.add({
                targets: targetBox.donut,
                scale: 0.6,
                duration: 200,
                ease: "Linear",
                yoyo: true,
              });
            },
          });
          targetBox.text.setText("x" + targetBox.donutCounts);
          this.currentScore += 1;
        }
        donut.destroy();
      },
    });

    // Spawn star particle
    this.spawnParticle(donut.x, donut.y);
    // Spawn compliment
    this.onCompliment();
  }

  onCompliment() {
    this.sound.play("pop", { volume: 0.5 });
    const index = Math.floor(Math.random() * this.complimentText.length);
    const comp = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 1.5,
        this.complimentText[index],
        {
          fontFamily: "Arial Black",
          fontSize: "60px",
          color: "#FFF",
          stroke: "#000000",
          strokeThickness: 8,
        }
      )
      .setOrigin(0.5)
      .setScale(0);
    this.tweens.add({
      targets: comp,
      scale: 0.6,
      duration: 500,
      ease: "Back.out",
      onComplete: () => comp.destroy(),
    });
  }

  // Spawn star particle
  spawnParticle(x, y) {
    this.add
      .particles(x, y, "star", {
        lifespan: 1000,
        speed: { min: 150, max: 250 },
        scale: { start: 1, end: 0 },
        gravityY: 100,
        blendMode: "ADD",
        emitting: false,
      })
      .explode(15);
  }
}
