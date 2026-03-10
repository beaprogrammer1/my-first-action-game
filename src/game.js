// Game ki Configuration
const config = {
    type: Phaser.AUTO,
    width: 400, // Mobile screen size width
    height: 600, // Mobile screen size height
    physics: {
        default: 'arcade', // Takranay aur girnay ki physics
        arcade: {
            gravity: { y: 0 }, // Action game hai to gravity 0 rakhtay hain (Top-down)
            debug: false
        }
    },
    scene: [Scene1] // Level 1 ko load karo
};

const game = new Phaser.Game(config);