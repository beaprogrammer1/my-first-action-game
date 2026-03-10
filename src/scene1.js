class Scene1 extends Phaser.Scene {
    constructor() {
        super("Scene1");
    }

    init(data) {
        this.level = data.level || 1;
        this.score = data.score || 0;
        this.ammo = data.ammo || 20;
        this.bossActive = false;
        this.bossHP = 20;
        
        // Buttons ke liye flags (Yaad rakhne ke liye ke kaunsa button dabaya gaya hai)
        this.isLeftDown = false;
        this.isRightDown = false;
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/ship.png');
        this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet6.png');
        this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/alien1.png');
        this.load.image('boss', 'https://labs.phaser.io/assets/sprites/bsquadron1.png');
        
        // Buttons ki images
        this.load.image('leftBtn', 'https://labs.phaser.io/assets/sprites/arrow.png'); 
        
        this.load.audio('shoot', 'https://labs.phaser.io/assets/audio/SoundEffects/pistol.wav');
        this.load.audio('explosion', 'https://labs.phaser.io/assets/audio/SoundEffects/explosion.mp3');
    }

    create() {
        // Colors & Background
        this.cameras.main.setBackgroundColor(this.level === 1 ? '#001a33' : (this.level === 2 ? '#1a1a1a' : '#1a0033'));

        this.player = this.physics.add.sprite(200, 450, 'player');
        this.player.setCollideWorldBounds(true);
        
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();

        // --- MOBILE BUTTONS SETUP ---
        
        // 1. Left Button
        let leftBtn = this.add.image(60, 540, 'leftBtn').setInteractive().setScale(1.5);
        leftBtn.setAngle(-180); // Ulta kar diya taake left ishara kare
        leftBtn.on('pointerdown', () => { this.isLeftDown = true; });
        leftBtn.on('pointerup', () => { this.isLeftDown = false; });
        leftBtn.on('pointerout', () => { this.isLeftDown = false; });

        // 2. Right Button
        let rightBtn = this.add.image(160, 540, 'leftBtn').setInteractive().setScale(1.5);
        rightBtn.on('pointerdown', () => { this.isRightDown = true; });
        rightBtn.on('pointerup', () => { this.isRightDown = false; });
        rightBtn.on('pointerout', () => { this.isRightDown = false; });

        // 3. Fire Button (Ek bara laal circle)
        let fireBtn = this.add.circle(330, 540, 40, 0xff0000).setInteractive();
        this.add.text(310, 530, "FIRE", { fontWeight: 'bold' });
        fireBtn.on('pointerdown', () => { this.fireBullet(); });

        // UI Text
        this.levelText = this.add.text(20, 10, "LEVEL: " + this.level, { fontSize: '20px', fill: '#0ff' });
        this.scoreText = this.add.text(20, 35, "Kills: " + this.score, { fill: '#0f0' });
        this.ammoText = this.add.text(20, 55, "Ammo: " + this.ammo, { fill: '#ff0' });
        this.bossHPText = this.add.text(150, 10, "", { fontSize: '22px', fill: '#f00' });

        // Spawner
        this.spawnTimer = this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.gameOver, null, this);
        
        // Keyboard Support (Taake PC par bhi chalti rahay)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        // Movement: Check Keyboard OR Mobile Buttons
        if (this.cursors.left.isDown || this.isLeftDown) {
            this.player.setVelocityX(-250);
        } else if (this.cursors.right.isDown || this.isRightDown) {
            this.player.setVelocityX(250);
        } else {
            this.player.setVelocityX(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) this.fireBullet();

        // Enemy Zig-Zag
        if (this.level >= 2 && !this.bossActive) {
            this.enemies.children.each(function(enemy) {
                enemy.setVelocityX(Math.sin((this.time.now + (enemy.y * 5)) / 200) * 100);
            }, this);
        }
    }

    fireBullet() {
        if (this.ammo > 0) {
            let bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
            bullet.setVelocityY(-500);
            this.ammo--;
            this.ammoText.setText("Ammo: " + this.ammo);
            this.sound.play('shoot');
        }
    }

    spawnEnemy() {
        if (this.bossActive) return;
        let x = Phaser.Math.Between(50, 350);
        let enemy = this.enemies.create(x, -50, 'enemy');
        enemy.setVelocityY(this.level === 1 ? 150 : 180);
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        if (enemy === this.boss) {
            this.bossHP--;
            this.bossHPText.setText("BOSS HP: " + this.bossHP);
            this.cameras.main.shake(100, 0.005);
            if (this.bossHP <= 0) {
                enemy.destroy();
                alert("YOU WON!");
                this.scene.start("Scene1", { level: 1, score: 0, ammo: 20 });
            }
        } else {
            enemy.destroy();
            this.sound.play('explosion');
            this.score++;
            this.scoreText.setText("Kills: " + this.score);
            if (this.score % 5 === 0) this.ammo += 10;
            if (this.score === 15 && this.level === 1) this.scene.start("Scene1", { level: 2, score: 15, ammo: this.ammo + 20 });
            if (this.score === 30 && this.level === 2) this.startBossFight();
        }
    }

    startBossFight() {
        this.bossActive = true;
        this.level = 3;
        this.levelText.setText("BOSS FIGHT!");
        this.spawnTimer.remove();
        this.boss = this.physics.add.sprite(200, 100, 'boss').setScale(1.5);
        this.enemies.add(this.boss);
        this.bossHPText.setText("BOSS HP: 20");
    }

    gameOver() {
        alert("GAME OVER!");
        this.scene.start("Scene1", { level: 1, score: 0, ammo: 20 });
    }
}