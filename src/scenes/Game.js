// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
  constructor() {
    super("Game");

    this.donutList = ["orange_donut", "blue_donut", "pink_donut"];
    this.complimentText = ["EXCELLENT JOB!", "GOOD JOB!", "GREAT JOB!"];
    this.boxes = [];
    this.donuts = [];
    this.winner = false;
    this.currentScore = 0;
    this.maxScore = 0;
    this.donutsPerBox = 25;
    this.waitTime = 3;
    this.lastClickTime = 0;
    this.clicked = false;
    this.guideDonut = null;
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
    this.matter.add.rectangle(-10, height / 2, 20, height * 4, {
      isStatic: true,
    }); // left
    this.matter.add.rectangle(width + 10, height / 2, 20, height * 4, {
      isStatic: true,
    }); // right

    const spacingX = 120;
    const spacingY = 120;

    const cols = Math.floor((width - 80) / spacingX);
    const rows = 30;

    // Spawn Donuts
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const key =
          this.donutList[Math.floor(Math.random() * this.donutList.length)];
        const x = 100 + j * spacingX;
        const y = 300 - i * spacingY;
        let donut = this.matter.add.image(x, y, key);
        donut.type = key;
        donut.destroyed = false;

        donut.setScale(0.5);
        donut.setCircle((donut.width * 0.5) / 2);
        donut.setBounce(0.2);
        donut.setFriction(0.05);
        donut.setMass(1.5);

        donut.setInteractive();
        donut.on("pointerdown", (pointer) => this.onClickDonut(donut, pointer));
        this.donuts.push(donut);
      }
    }
    // Header
    this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, width, 200);

    // Box
    const boxCounts = this.donutList.length;
    const boxSpacingX = 250;
    const boxY = 100;
    for (let i = 0; i < boxCounts; i++) {
      const boxX = 150 + boxSpacingX * i;
      const boxContainer = this.add.container(boxX, boxY);
      const boxImg = this.add.image(0, 0, "box").setScale(0.8);

      // Add donut image and glow
      const donut = this.add.image(0, -25, this.donutList[i]).setScale(0.4);
      donut.preFX.addGlow();

      boxContainer.donutCounts = this.donutsPerBox;
      const text = this.add
        .text(0, 50, "x" + boxContainer.donutCounts, {
          fontFamily: "Arial Black",
          fontSize: "35px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 10,
        })
        .setOrigin(0.5);

      boxContainer.add([boxImg, donut, text]);

      // Add boxContainer status
      boxContainer.type = this.donutList[i];
      boxContainer.box = boxImg;
      boxContainer.donut = donut;
      boxContainer.text = text;
      boxContainer.originalScale = boxContainer.scale;

      this.boxes.push(boxContainer);
    }

    this.maxScore = this.boxes.length * this.donutsPerBox;

    this.fingerclick = this.add
      .sprite(400, 600, "fingerclick")
      .play("fingerclick");
    this.fingerclick.setVisible(false);

    this.lastClickTime = performance.now();
    this.clicked = false;

    this.input.on("pointerdown", () => {
      this.lastClickTime = performance.now();
      this.fingerclick.setVisible(false);
      this.clicked = false;
    });
  }

  update() {
    if (!this.winner) {
      if (!this.guideDonut && this.donuts.length > 0) {
        const visibleDonuts = this.donuts.filter(
          (d) =>
            d.x >= 50 &&
            d.x <= this.scale.width - 50 &&
            d.y >= 300 &&
            d.y <= this.scale.height - 50
        );

        if (visibleDonuts.length > 0) {
          const randomIndex = Phaser.Math.Between(0, visibleDonuts.length - 1);
          const donut = visibleDonuts[randomIndex];
          this.guideDonut = donut;
          this.fingerclick.setPosition(donut.x + 30, donut.y);
        }
      }

      const elapsed = (performance.now() - this.lastClickTime) / 1000;
      if (!this.clicked && elapsed >= this.waitTime) {
        this.fingerclick.setVisible(true);
        this.clicked = true;
        this.guideDonut = null;
      }
    }
  }

  onClickDonut(donut, pointer) {
    if (pointer.y < 200) return;
    // Handle donut
    if (donut.destroyed) return;
    donut.destroyed = true;

    // Remove donut from donuts
    const index = this.donuts.indexOf(donut);
    if (index != -1) this.donuts.splice(index, 1);

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
          // Set donut status
          donut.setSensor(true);
          donut.setIgnoreGravity(true);
          donut.setDepth(999);
          donut.setStatic(true);
          donut.setVelocity(0, 0);
          donut.setAngle(0);

          box.donutCounts -= 1;
          this.currentScore += 1;

          this.checkWinner();
        } else {
          // Block click processing when any donutCounts = 0
          return;
        }
        break;
      }
    }

    // Move donut to box and popup box
    this.tweens.add({
      targets: donut,
      x: targetX,
      y: targetY,
      duration: 500,
      ease: "Linear",
      onComplete: () => {
        donut.destroy();

        targetBox.text.setText("x" + targetBox.donutCounts);

        this.tweens.add({
          targets: targetBox,
          scale: targetBox.originalScale * 1.1,
          duration: 100,
          ease: "Linear",
          yoyo: true,
          // Add tween beblow to fix scale when spam click donut
          onComplete: () => {
            this.tweens.add({
              targets: targetBox,
              scale: targetBox.originalScale,
              duration: 100,
              ease: "Linear",
            });
          },
        });

        // Glow box
        targetBox.box.preFX.setPadding(32);
        const fx = targetBox.box.preFX.addGlow();
        this.tweens.add({
          targets: fx,
          color: 0xffea00,
          outerStrength: 8,
          duration: 150,
          ease: "Linear",
          onComplete: () => {
            fx.destroy();
          },
        });
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
          fontSize: "100px",
          color: "#FFF",
          stroke: "#000000",
          strokeThickness: 20,
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

  checkWinner() {
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
  }
}
