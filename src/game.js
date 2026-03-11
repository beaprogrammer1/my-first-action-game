const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    // MainMenu aur Scene1 yahan define hona zaroori hain
    scene: [MainMenu, Scene1] 
};

const game = new Phaser.Game(config);