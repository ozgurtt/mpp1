var Player = function(game, x, y) {
  this.game = game;

  Phaser.Sprite.call(this, game, x, y, 'player');

  this.cursor = this.game.input.keyboard.createCursorKeys();
  this.socket = io();


  //Setup WASD and extra keys
  wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
  aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
  sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
  dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);

  // this.anchor.setTo(0.5);

  this.game.physics.arcade.enable(this); // set up player physics

  this.body.fixedRotation = true; // no rotation
  // this.body.moves = false;

  this.game.add.existing(this);

  this.direction = 'down';
  this.animations.add('down', [6, 7], 6, true);
  this.animations.add('up', [8, 9], 6, true);
  this.animations.add('right', [4, 11], 6, true);
  this.animations.add('left', [5, 10], 6, true);

};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.update = function() {
  this.movements();
  this.updatecamera();
};
Player.prototype.updatecamera = function() {
    if (this.tweening) {
      return;
    }
    this.tweening = true;
    
    var speed = 700;
    var toMove = false;

    if (this.y > this.game.camera.y + Game.h) {
      Game.camera.y += 1;
      toMove = true;
    }
    else if (this.y < this.game.camera.y) {
      Game.camera.y -= 1;
      toMove = true;
    }
    else if (this.x > this.game.camera.x + Game.w) {
      Game.camera.x += 1;
      toMove = true;
    }
    else if (this.x < this.game.camera.x) {
      Game.camera.x -= 1;
      toMove = true;
    }

    if (toMove) {
      var t = this.game.add.tween(this.game.camera).to({x:Game.camera.x*Game.w, y:Game.camera.y*Game.h}, speed);
      t.start();
      t.onComplete.add(function(){this.tweening = false;}, this);
    }
    else {
      this.tweening = false;
    }
};
Player.prototype.reposition = function() {
    this.x = this.tilex*tileSize-tileSize/2;
    this.y = this.tiley*tileSize+tileSize/2;
};
Player.prototype.movements = function() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;


    var speed = 275;

    if (this.tweening) {
      //Don't move while camera is panning
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
    }else{
      //Don't move when the dialogue box is visible
      if (this.cursor.left.isDown || aKey.isDown) {
        this.body.velocity.x = -speed;
        this.socket.emit('x',this.x);
        this.socket.emit('y',this.y);
        this.direction = 'left';
        this.animations.play('left');
      }
      else if (this.cursor.right.isDown || dKey.isDown) {
        this.body.velocity.x = speed;
        this.direction = 'right';
        this.animations.play('right');
      }
      else if (this.cursor.up.isDown || wKey.isDown) {
        this.body.velocity.y = -speed;
        this.direction = 'up';
        this.animations.play('up');
      }
      else if (this.cursor.down.isDown || sKey.isDown) {
        this.body.velocity.y = speed;
        this.direction = 'down';
        this.animations.play('down');
      }
      else {
        if (this.direction === 'up') {
          this.frame = 1;
        }
        else if (this.direction === 'down') {
          this.frame = 0;
        }
        else if (this.direction === 'right') {
          this.frame = 2;
        }
        else if (this.direction === 'left') {
          this.frame = 3;
        }
        this.animations.stop();
      }
    } 

};
Player.prototype.constructor = Player;
