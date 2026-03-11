class Scene1 extends Phaser.Scene {
    constructor() {
        super("Scene1");
    }

    init(data) {
        this.level = data.level || 1;
        this.score = 0;
        this.lives = 3; // Total 3 Lives
        this.isLeft = false;
        this.isRight = false;
        
        // Auto-Difficulty
        this.enemySpeed = 150 + (this.level * 5);
        this.spawnDelay = Math.max(1000 - (this.level * 10), 300);
        this.targetKills = 10 + (this.level * 5);
        this.ammo = 20 + (this.level * 2);
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/ship.png');
        this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet6.png');
        this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/alien1.png');
        this.load.image('reward', 'https://labs.phaser.io/assets/sprites/gem.png');
        this.load.audio('shoot', 'https://labs.phaser.io/assets/audio/SoundEffects/pistol.wav');
        this.load.audio('explosion', 'https://labs.phaser.io/assets/audio/SoundEffects/explosion.mp3');
    }

    create() {
        let colors = ['#001a33', '#1a0000', '#001a00', '#1a1a00', '#1a001a', '#001a1a', '#0d0d0d'];
        this.cameras.main.setBackgroundColor(colors[this.level % colors.length]);

        this.player = this.physics.add.sprite(200, 450, 'player');
        this.player.setCollideWorldBounds(true);
        
        this.bullets = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.powerups = this.physics.add.group();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.createMobileButtons();

        // UI Text
        this.levelText = this.add.text(20, 10, "LEVEL: " + this.level, { fontSize: '20px', fill: '#0ff', fontStyle: 'bold' });
        this.ammoText = this.add.text(280, 10, "AMMO: " + this.ammo, { fontSize: '18px', fill: '#ff0' });
        this.livesText = this.add.text(20, 40, "❤️ LIVES: " + this.lives, { fontSize: '18px', fill: '#f00', fontStyle: 'bold' });
        this.goalText = this.add.text(20, 65, `GOAL: ${this.score}/${this.targetKills}`, { fontSize: '14px', fill: '#fff' });

        this.spawnTimer = this.time.addEvent({ delay: this.spawnDelay, callback: this.spawnEnemy, callbackScope: this, loop: true });

        // Collisions
        this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handleCollision, null, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectReward, null, this);
    }

    createMobileButtons() {
        let lBtn = this.add.circle(60, 540, 40, 0x444444, 0.5).setInteractive();
        lBtn.on('pointerdown', () => this.isLeft = true);
        lBtn.on('pointerup', () => this.isLeft = false);
        lBtn.on('pointerout', () => this.isLeft = false);

        let rBtn = this.add.circle(160, 540, 40, 0x444444, 0.5).setInteractive();
        rBtn.on('pointerdown', () => this.isRight = true);
        rBtn.on('pointerup', () => this.isRight = false);
        rBtn.on('pointerout', () => this.isRight = false);

        let fBtn = this.add.circle(330, 540, 45, 0xff0000, 0.6).setInteractive();
        fBtn.on('pointerdown', () => this.fireBullet());
    }

    update() {
        if (this.cursors.left.isDown || this.isLeft) this.player.setVelocityX(-250);
        else if (this.cursors.right.isDown || this.isRight) this.player.setVelocityX(250);
        else this.player.setVelocityX(0);

        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) this.fireBullet();

        // --- MISSED ENEMIES CHECK ---
        this.enemies.children.each((enemy) => {
            // Agar dushman screen ke niche se nikal jaye (Height 600 hai)
            if (enemy.y > 600) {
                enemy.destroy();
                this.loseLife("Enemy Missed!");
            }
            
            if (this.level > 2) {
                enemy.setVelocityX(Math.sin((this.time.now + (enemy.y * 5)) / 200) * 100);
            }
        });
    }

    fireBullet() {
        if (this.ammo > 0) {
            let bullet = this.bullets.create(this.player.x, this.player.y - 20, 'bullet');
            bullet.setVelocityY(-500);
            this.ammo--;
            this.ammoText.setText("AMMO: " + this.ammo);
            this.sound.play('shoot', { volume: 0.3 });
        }
    }

    spawnEnemy() {
        let x = Phaser.Math.Between(50, 350);
        let enemy = this.enemies.create(x, -50, 'enemy');
        enemy.setVelocityY(this.enemySpeed);
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.sound.play('explosion', { volume: 0.2 });
        
        if (Phaser.Math.Between(1, 5) === 1) {
            this.powerups.create(enemy.x, enemy.y, 'reward').setVelocityY(100);
        }

        this.score++;
        this.goalText.setText(`GOAL: ${this.score}/${this.targetKills}`);

        if (this.score >= this.targetKills) {
            this.scene.start("Scene1", { level: this.level + 1 });
        }
    }

    handleCollision(player, enemy) {
        enemy.destroy();
        this.loseLife("Crashed!");
    }

    loseLife(reason) {
        this.lives--;
        this.livesText.setText("❤️ LIVES: " + this.lives);
        
        // Screen Flash Red Effect
        this.cameras.main.flash(300, 255, 0, 0);
        this.cameras.main.shake(200, 0.02);

        if (this.lives <= 0) {
            alert("GAME OVER! " + reason);
            this.scene.start("MainMenu");
        }
    }

    collectReward(player, reward) {
        reward.destroy();
        this.ammo += 15;
        this.ammoText.setText("AMMO: " + this.ammo);
        this.cameras.main.flash(200, 0, 255, 0);
    }
}