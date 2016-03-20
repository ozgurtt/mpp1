/*global Game*/

/**
 * Returns a random integer between min and max
 * Using Math.round() will give you a non-uniform distribution!
 */

// // Choose Random integer in a range
// function rand (min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// var musicOn = true;


var wKey;
var aKey;
var sKey;
var dKey;
var cursors;
var leftArrow;
var rightArrow;
var upArrow;
var downArrow;
var score = 0;
var FLOOR,WALL;
var actors = {};
var SOCKET = io();
var player;

Game.Play = function(game) {
  this.game = game;
};

Game.Play.prototype = {
  init: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
  },
  create: function() {
    this.game.world.setBounds(0, 0 ,Game.w ,Game.h);

    //Setup WASD and extra keys
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    cursors = this.game.input.keyboard.createCursorKeys();




		FLOOR = 0;
		WALL = 1;

    this.auto = new Automata(COLS, ROWS);
    this.auto.generate();
    this.auto.cleanup();

    var cave = this.auto.csv();

    this.game.load.tilemap('level', null, cave, Phaser.Tilemap.CSV );
    this.map = this.game.add.tilemap('level', 64, 64);
    this.map.addTilesetImage('tiles'); //use generated sheet
    // this.map.setTileIndexCallback(5, this.collectCoin, this);

    this.layer = this.map.createLayer(0);

    this.map.setCollision(WALL); //Black Empty Space
    this.layer.resizeWorld();

		// player = this.game.add.sprite(Game.w/2, Game.h/2, 'player');

		player = new Actor(this.game, Game.w/2, Game.h/2, 'hero');
    player.sid = SOCKET.io.engine.id;

    actors['/#'+SOCKET.io.engine.id] = player;


    SOCKET.on('actor', function(actor) {
      if (actors[actor.sid] != player) {
        if (actors[actor.sid] === undefined) {

          actors[actor.sid] = new Actor(game, actor.x, actor.y, 'hero');

        }else {

          // actors[actor.sid] = {x: actor.x, y: actor.y};
          if (actor.moving) {
            if (actor.direction === 'up') {
              actors[actor.sid].animations.play('up');
            }else if (actor.direction === 'down') {
              actors[actor.sid].animations.play('down');
            }else if (actor.direction === 'left') {
              actors[actor.sid].animations.play('left');
            }else if (actor.direction === 'right') {
              actors[actor.sid].animations.play('right');
            }
          }else {
            actors[actor.sid].animations.stop();
            if (actor.direction === 'up') {
              actors[actor.sid].frame = 1;
            }
            else if (actor.direction === 'down') {
              actors[actor.sid].frame = 0;
            }
            else if (actor.direction === 'right') {
              actors[actor.sid].frame = 2;
            }
            else if (actor.direction === 'left') {
              actors[actor.sid].frame = 3;
            }

          }
          actors[actor.sid].x = actor.x;
          actors[actor.sid].y = actor.y;
          // console.log(actors[actor.sid].body.velocity.x);
          // console.log(Phaser.Point.equals(actors[actor.sid].body.velocity,new Phaser.Point(0,0)));
          // if (Phaser.Point.equals(actors[actor.sid].body.velocity,new Phaser.Point(0,0))) {
          //   actors[actor.sid].animations.stop();
          //   if (actor.direction === 'up') {
          //     actors[actor.sid].frame = 1;
          //   }
          //   else if (actor.direction === 'down') {
          //     actors[actor.sid].frame = 0;
          //   }
          //   else if (actor.direction === 'right') {
          //     actors[actor.sid].frame = 2;
          //   }
          //   else if (actor.direction === 'left') {
          //     actors[actor.sid].frame = 3;
          //   }
          //
          // }else {
          //   if (actor.direction === 'up') {
          //     actors[actor.sid].animations.play('up');
          //   }else if (actor.direction === 'down') {
          //     actors[actor.sid].animations.play('down');
          //   }else if (actor.direction === 'left') {
          //     actors[actor.sid].animations.play('left');
          //   }else if (actor.direction === 'right') {
          //     actors[actor.sid].animations.play('right');
          //   }
          //
          // }
        }
      }
    });

    player.movements = function() {
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;

      var speed = 275;
      // var pos = {x: this.x, y: this.y}; 

      if (this.tweening) {
        //Don't move while camera is panning
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
      }else{
        //Don't move when the dialogue box is visible
        if (cursors.left.isDown || aKey.isDown || leftArrow) {
          // SOCKET.emit('player',pos);
          this.body.velocity.x = -speed;
          this.direction = 'left';
          this.animations.play('left');
          SOCKET.emit('player',{x: this.x, y: this.y, moving: true, direction: 'left'});
        }
        else if (cursors.right.isDown || dKey.isDown || rightArrow) {
          // SOCKET.emit('player',pos);
          this.body.velocity.x = speed;
          this.direction = 'right';
          this.animations.play('right');
          SOCKET.emit('player',{x: this.x, y: this.y, moving: true, direction: 'right'});
        }
        else if (cursors.up.isDown || wKey.isDown || upArrow) {
          // SOCKET.emit('player',pos);
          this.body.velocity.y = -speed;
          this.direction = 'up';
          this.animations.play('up');
          SOCKET.emit('player',{x: this.x, y: this.y, moving: true, direction: 'up'});
        }
        else if (cursors.down.isDown || sKey.isDown || downArrow) {
          // SOCKET.emit('player',pos);
          this.body.velocity.y = speed;
          this.direction = 'down';
          this.animations.play('down');
          SOCKET.emit('player',{x: this.x, y: this.y, moving: true, direction: 'down'});
        }
        else {
          if (this.direction === 'up') {
            this.frame = 1;
            SOCKET.emit('player',{x: this.x, y: this.y, moving: false, direction: 'up'});
          }
          else if (this.direction === 'down') {
            this.frame = 0;
            SOCKET.emit('player',{x: this.x, y: this.y, moving: false, direction: 'down'});
          }
          else if (this.direction === 'right') {
            this.frame = 2;
            SOCKET.emit('player',{x: this.x, y: this.y, moving: false, direction: 'right'});
          }
          else if (this.direction === 'left') {
            this.frame = 3;
            SOCKET.emit('player',{x: this.x, y: this.y, moving: false, direction: 'left'});
          }
          this.animations.stop();
        }
      } 
    };

    // // Music
    // this.music = this.game.add.sound('music');
    // this.music.volume = 0.5;
    // this.music.play('',0,1,true);

    //Setup WASD and extra keys
    wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    // muteKey = game.input.keyboard.addKey(Phaser.Keyboard.M);


    this.loadTouchControls();




    //Create Twitter button as invisible, show during win condition to post highscore
    this.twitterButton = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 200,'twitter', this.twitter, this);
    this.twitterButton.anchor.set(0.5);
    this.twitterButton.visible = false;
  },
  loadTouchControls: function() {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      //Draw Arrow w/ Bitmap Data
      var bmdsize = 80;
      this.arrowbmd = this.game.add.bitmapData(bmdsize,bmdsize);
      this.arrowbmd.ctx.clearRect(0,0,bmdsize,bmdsize);
      this.arrowbmd.ctx.strokeStyle = 'white';
      this.arrowbmd.ctx.lineWidth = 2;
      this.arrowbmd.ctx.fill();
      this.arrowbmd.ctx.beginPath();
      this.arrowbmd.ctx.moveTo(bmdsize*1/2,0);
      this.arrowbmd.ctx.lineTo(0,bmdsize*1/2);
      this.arrowbmd.ctx.lineTo(bmdsize*1/4,bmdsize*1/2);
      this.arrowbmd.ctx.lineTo(bmdsize*1/4,bmdsize);
      this.arrowbmd.ctx.lineTo(bmdsize*3/4,bmdsize);
      this.arrowbmd.ctx.lineTo(bmdsize*3/4,bmdsize*1/2);
      this.arrowbmd.ctx.lineTo(bmdsize,bmdsize*1/2);
      this.arrowbmd.ctx.fill();

      //Add Touch Controls for mobile
      //Up Arrow
      this.upArrow = this.game.add.sprite(140, Game.h - 160, this.arrowbmd);
      this.upArrow.tint = 0xdcdcdc;
      this.upArrow.alpha = 0.5;
      this.upArrow.anchor.setTo(0.5, 0.5);
      this.upArrow.inputEnabled = true;
      this.upArrow.fixedToCamera = true;
      this.upArrow.events.onInputDown.add(function() {
        upArrow = true;
      },this);
      this.upArrow.events.onInputUp.add(function() {
        upArrow = false;
      },this);
      // this.upArrow.visible = false;

      //Up Down
      this.downArrow = this.game.add.sprite(140, Game.h - 40, this.arrowbmd);
      this.downArrow.tint = 0xdcdcdc;
      this.downArrow.alpha = 0.5;
      this.downArrow.anchor.setTo(0.5, 0.5);
      this.downArrow.inputEnabled = true;
      this.downArrow.angle = 180;
      this.downArrow.fixedToCamera = true;
      this.downArrow.events.onInputDown.add(function() {
        downArrow = true;
      },this);
      this.downArrow.events.onInputUp.add(function() {
        downArrow = false;
      },this);
      // this.downArrow.visible = false;

      //Up Left 
      this.leftArrow = this.game.add.sprite(60, Game.h - 100, this.arrowbmd);
      this.leftArrow.tint = 0xdcdcdc;
      this.leftArrow.alpha = 0.5;
      this.leftArrow.anchor.setTo(0.5, 0.5);
      this.leftArrow.inputEnabled = true;
      this.leftArrow.fixedToCamera = true;
      this.leftArrow.angle = -90;
      this.leftArrow.events.onInputDown.add(function() {
        leftArrow = true;
      },this);
      this.leftArrow.events.onInputUp.add(function() {
        leftArrow = false;
      },this);
      // this.leftArrow.visible = false;

      //Up Right 
      this.rightArrow = this.game.add.sprite(220, Game.h - 100, this.arrowbmd);
      this.rightArrow.tint = 0xdcdcdc;
      this.rightArrow.alpha = 0.5;
      this.rightArrow.anchor.setTo(0.5, 0.5);
      this.rightArrow.inputEnabled = true;
      this.rightArrow.angle = 90;
      this.rightArrow.fixedToCamera = true;
      this.rightArrow.events.onInputDown.add(function() {
        rightArrow = true;
      },this);
      this.rightArrow.events.onInputUp.add(function() {
        rightArrow = false;
      },this);
      // this.rightArrow.visible = false;

    }

  },

	makeBox: function(x,y) {
		var bmd = this.game.add.bitmapData(x, y);
		bmd.ctx.beginPath();
		bmd.ctx.rect(0, 0, x, y);
		bmd.ctx.fillStyle = '#fff';
		bmd.ctx.fill();
		return bmd;
	},
  update: function() {
    player.movements();
  },
  twitter: function() {
    //Popup twitter window to post highscore
    var game_url = 'http://www.divideby5.com/games/GAMETITLE/'; 
    var twitter_name = 'rantt_';
    var tags = ['1GAM'];

    window.open('http://twitter.com/share?text=My+best+score+is+'+score+'+playing+GAME+TITLE+See+if+you+can+beat+it.+at&via='+twitter_name+'&url='+game_url+'&hashtags='+tags.join(','), '_blank');
  },

  // render: function() {
  //   game.debug.text('Health: ' + tri.health, 32, 96);
  // }

};
