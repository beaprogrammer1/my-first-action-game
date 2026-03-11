class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');
    }

    create() {
        this.add.image(200, 300, 'bg');
        this.add.text(60, 150, "GALAXY STRIKE", { fontSize: '40px', fill: '#fff', fontStyle: 'bold' });
        
        let startBtn = this.add.text(140, 350, "START GAME", { fontSize: '25px', fill: '#0f0', backgroundColor: '#222', padding: 10 })
            .setInteractive()
            .on('pointerdown', () => this.scene.start("Scene1"));

        this.add.text(100, 500, "Mission: Defeat the Boss", { fontSize: '16px', fill: '#aaa' });
    }
}