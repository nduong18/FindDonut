// "Every great game begins with a single scene. Let's make this one unforgettable!"
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');

        this.donutList = ['orange_donut', 'blue_donut', 'pink_donut'];
        this.complimentText = ['EXCELLENT JOB!', 'GOOD JOB!', 'GREAT JOB!'];
    }

    create() {
        this.cameras.main.setBackgroundColor(0x313131);

        const width = this.scale.width;
        const height = this.scale.height;


        this.matter.add.rectangle(width/2, height+10, width, 20, { isStatic: true }); // bottom
        this.matter.add.rectangle(-10, height/2, 20, height, { isStatic: true }); // left
        this.matter.add.rectangle(width+10, height/2, 20, height, { isStatic: true }); // right

        this.donuts = [];

        const spacingX = 120;
        const spacingY = 120;

        const cols = Math.floor((width - 80) / spacingX);   
        const rows = Math.floor((height - 100) / spacingY);

        for (let i = 0; i < rows; i++){
            for (let j = 0; j < cols; j++){
                const key = this.donutList[Math.floor(Math.random() * this.donutList.length)];
                const x = 100 + j * spacingX;
                const y = 100 + i * spacingY;
                let donut = this.matter.add.image(x,y,key);

                donut.setScale(0.5);
                donut.setCircle(donut.width * 0.5 / 2);
                donut.setBounce(0.2);
                donut.setFriction(0.05);
                donut.setMass(1);

                donut.setInteractive();
                donut.on('pointerdown', () => this.onClickDonut(donut));
                this.donuts.push(donut);
            }
        }

        // Header
        const boxW = 200;
        const boxH = 200;
        const boxCounts = this.donutList.length;
        const totalBoxWidth = boxCounts * boxW;
        const remainingSpace = width - totalBoxWidth;
        const boxSpacing = remainingSpace / (boxCounts + 1);

        this.add.graphics().fillStyle(0x000000, 1).fillRect(0, 0, width, 300);
        const boxY = 50;

        for (let i = 0; i < boxCounts; i++){
            const boxX = boxSpacing * (i + 1) + boxW * i;
            const box = this.add.graphics()
            .fillStyle(0x3e3e3d, 1)
            .fillRoundedRect(boxX, boxY, boxW, boxH, 20)
            .lineStyle(10, 0x515657, 1)
            .strokeRoundedRect(boxX, boxY, boxW, boxW, 20);

            const donut = this.add.image(boxX + boxW / 2, boxY + boxH / 3, this.donutList[i]).setScale(0.5);
        }


        // ------------------------------------------------------------------------------------------

    }

    onClickDonut(donut){
        donut.destroy();
    }
}
