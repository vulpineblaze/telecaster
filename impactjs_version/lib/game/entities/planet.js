ig.module(
	'game.entities.planet'
)
.requires(
	'impact.entity',
	'impact.sound'
)
.defines(function(){
	EntityPlanet = ig.Entity.extend({
    zIndex:100, //
		animSheet: new ig.AnimationSheet( 'media/planet_new_tileset.png', 48, 48 ),

		size: {x: 34, y:38},
		offset: {x: 6, y: 6},
		flip: false,
		drag:false,

		maxVel: {x: 100, y: 150},
		friction: {x: 500, y: 500},
		accelGround: 400,
		accelAir: 200,
		jump: 200,
		shootSpeed: 6, //larger numbers increase firing speed// in hz
		shootNext: 0,
		animSpeed: 0.0009,
		
		mouseRel: {x:0,y:0},
		
		health: 20,
		maxHealth: 20,
		regen:0.05,
		
		highlight:0,
    // lines: [],
    profile: 0,
    planetColor: [25,45,65],
		
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		startPosition: null,
		
		invincible: true,
		invincibleDelay: 2,
		invincibleTimer:null,
		
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
		
		jumpSFX: new ig.Sound( 'media/sounds/jump.*' ),
		shootSFX: new ig.Sound( 'media/sounds/shoot.*' ),
		deathSFX: new ig.Sound( 'media/sounds/death.*' ),

		
		init: function( x, y, settings ) {
		
			this.timer = new ig.Timer(0);
			
			this.animSpeed = this.animSpeed * (this.maxVel.x+this.maxVel.y)/2
			
			//this.setupAnimation(this.weapon);
			this.startPosition = {x:x,y:y};
			// this.invincibleTimer = new ig.Timer();
			
			this.parent( x, y, settings );
			this.addAnim( 'idle', 1, [Math.floor(1+Math.random()*2)-1 ] );
			this.addAnim( 'run', this.animSpeed, [1,2,3,4] );
			this.addAnim( 'jump', 1, [6] );
			this.addAnim( 'fall', 1, [0] );
			
			var leftup = 42;
			this.addAnim( 'run_leftup', this.animSpeed, [1+leftup,2+leftup,3+leftup,4+leftup] );
			var left = 36;
			this.addAnim( 'run_left', this.animSpeed, [1+left,2+left,3+left,4+left] );
			var leftdown = 30;
			this.addAnim( 'run_leftdown', this.animSpeed, [1+leftdown,2+leftdown,3+leftdown,4+leftdown] );
			var rightup = 6;
			this.addAnim( 'run_rightup', this.animSpeed, [1+rightup,2+rightup,3+rightup,4+rightup] );
			var right = 12;
			this.addAnim( 'run_right', this.animSpeed, [1+right,2+right,3+right,4+right] );
			var rightdown = 18;
			this.addAnim( 'run_rightdown', this.animSpeed, [1+rightdown,2+rightdown,3+rightdown,4+rightdown] );
			var down = 24;
			this.addAnim( 'run_down', this.animSpeed, [1+down,2+down,3+down,4+down] );
			
			this.planetColor = [Math.floor(20+Math.random()*230),
        Math.floor(20+Math.random()*230),
        Math.floor(20+Math.random()*230)
              ];

		},
		
		inFocus: function() {
		    return (
		       (this.pos.x <= (ig.input.mouse.x + ig.game.screen.x)) &&
		       ((ig.input.mouse.x + ig.game.screen.x) <= this.pos.x + this.size.x) &&
		       (this.pos.y <= (ig.input.mouse.y + ig.game.screen.y)) &&
		       ((ig.input.mouse.y + ig.game.screen.y) <= this.pos.y + this.size.y)
		    );
		 },

		update: function() {
			//creates turret
      this.currentAnim = this.anims.idle;
			if (ig.input.pressed('lbtn') && this.inFocus()) {
		        ig.log('clicked');
		        // this.highlight = 
		        if (this.highlight==0 && ig.game.highlighted != this){
		        	ig.game.highlighted = this;
			        this.highlight = ig.game.spawnEntity( EntityHighlight, 
			        									this.pos.x, 
			        									this.pos.y, 
			        									{flip:this.flip, angle:0.0, par:this} 
			        									); //Nothing to special here, just make sure you pass the angle we calculated in
              
					this.highlight.zIndex=this.zIndex+2;
				}
		    }else{
		    	// if (!(this.highlight==0)){
		    	// 	this.highlight.kill();
		    	// }
		    }

		    if(ig.game.highlighted != this && this.highlight != 0){
		    	this.highlight.kill();
		    	this.highlight = 0;
		    }
			
			
			// move!
			this.parent();
		},
		
		
		draw: function(){
      var r=this.planetColor[0],g=this.planetColor[1],b=this.planetColor[2];
      // console.log(r);
			var planetColor = "rgba("+r+","+g+","+b+",0.9)"; 
      var planetRadius = 24;
      var offset = 18; //  //  
      var ctx = ig.system.context;

      var startX = ig.system.getDrawPos(this.pos.x - ig.game.screen.x + offset);
      var startY = ig.system.getDrawPos(this.pos.y - ig.game.screen.y + offset);

      ctx.beginPath();
      // ctx.strokeStyle = guideColor;  //some color
      ctx.fillStyle = planetColor;
      ctx.arc( startX,
              startY ,
              planetRadius * ig.system.scale,
              0, 
              Math.PI * 2 );
      
      // ctx.stroke();
      ctx.fill();


      ctx.closePath();

			this.parent();
		},
		
		
		// kill: function(){
		// 	//this.deathSFX.play();
		// 	this.turret.kill();
		// 	this.parent();
		// 	ig.game.respawnPosition = this.startPosition;
		// 	ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, 
		// 		{callBack:this.onDeath} );
		// },
		
		// makeInvincible: function(){
		// 	this.invincible = true;
		// 	this.invincibleTimer.reset();
		// },
		
		// receiveDamage: function(amount, from){
		// 	if(this.invincible)
		// 	{
		// 		return;
		// 	}else{
		// 		this.invincibleDelay=0.3;
		// 		this.makeInvincible();
		// 	}
		// 	this.parent(amount, from);
		// },
		
		// onDeath: function(){
		// 	ig.game.stats.deaths++;
		// 	ig.game.lives--;
		// 	if(ig.game.lives < 0){
		// 		ig.game.gameOver();
		// 	}else{
		// 		ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, 
		// 		ig.game.respawnPosition.y);
		// 	}
		// },
		
		

	}); //end of player
	
	EntityHighlight = ig.Entity.extend({
    zIndex:500,
		size: {x: 48, y: 48},
		animSheet: new ig.AnimationSheet( 'media/planet_highlight.png', 48, 48 ),
		//offset:{x:9,y:5},
		shift:{x:0,y:0},
		
		//maxVel: {x: 200, y: 0},
		type: ig.Entity.TYPE.NONE,
		angle:0,
		//checkAgainst: ig.Entity.TYPE.B,
		//collides: ig.Entity.COLLIDES.PASSIVE,
		
		
		
		init: function( x, y, settings ) {
		
			var offset;
			offset = 6; //
			// var flipsetting, velsetting;
			// if(settings.flip){
			// 	flipsetting = -4;
			// 	velsetting = -this.maxVel.x;
			// }else{
			// 	flipsetting = 8;
			// 	velsetting = this.maxVel.x;
			// }
			this.parent( x - offset  , y - offset, settings );
			//this.vel.x = this.accel.x = velsetting;
			this.addAnim( 'idle', 0.2, [0] );
		},
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			
		},
		
		update: function(){
			
			
			// this.pos.x = this.par.pos.x + this.shift.x;
			// this.pos.y = this.par.pos.y + this.shift.y;
			// //ig.log( 'tur x pos', this.pos.x,' tur par x',this.par.pos.x  );
			
			// var mx = (ig.input.mouse.x + ig.game.screen.x); //Figures out the x coord of the mouse in the entire world
			// var my = (ig.input.mouse.y + ig.game.screen.y); //Figures out the y coord of the mouse in the entire world	
			
			// var px =this.pos.x + this.size.x/2;
			// var py = this.pos.y + this.size.y/2;
			
			// var r = Math.atan2(my-py, mx-px);
			
			
			// //this.currentAnim = this.anims.run;
			// this.angle = r;
			// r = r + Math.PI/2;
			// this.currentAnim.angle = r;
			
			
			this.parent();
		},

		check: function( other ) {
			//other.receiveDamage( 3, this );
			//this.kill();
		},
		
	});   //end of bullet

	EntityLine = ig.Entity.extend({
        start: {},
        finish: {},
        zIndex: 400,
 
        init: function(x, y, settings) {
          this.parent(x,y,settings);

          this.target.x = settings.target.x ;
          this.target.y = settings.target.y ;

        },
 
        update: function() {
          


          this.parent();
        },

        draw: function() {
          var guideColor = "rgb(196,0,245)";
          var guideRadius = 10;

          var offset = 18;
        	var startX = ig.system.getDrawPos(this.pos.x - ig.game.screen.x + offset);
          var startY = ig.system.getDrawPos(this.pos.y - ig.game.screen.y + offset);
                
          var endX = ig.system.getDrawPos(this.target.x-ig.game.screen.x + offset);
          var endY = ig.system.getDrawPos(this.target.y-ig.game.screen.y + offset);

          var ctx = ig.system.context;
                
          ctx.strokeStyle = guideColor; //
          ctx.lineWidth = 7.5;
          ctx.beginPath();
          ctx.moveTo(startX,startY);
          ctx.lineTo(endX,endY);
          ctx.stroke();
          ctx.closePath();
          

          
          ctx.beginPath();
          // ctx.strokeStyle = guideColor;  //some color
          ctx.fillStyle = guideColor;
          ctx.arc( startX,
                  startY,
                  guideRadius * ig.system.scale,
                  0, 
                  Math.PI * 2 );
          ctx.arc( endX,
                  endY,
                  guideRadius * ig.system.scale,
                  0, 
                  Math.PI * 2 );
          // ctx.stroke();
          ctx.fill();


          ctx.closePath();


        }
    });










}); //end of planet.js




















	
// 	EntityBullet = ig.Entity.extend({
// 		size: {x: 5, y: 3},
// 		animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
// 		maxVel: {x: 200, y: 0},
// 		type: ig.Entity.TYPE.NONE,
// 		checkAgainst: ig.Entity.TYPE.B,
// 		collides: ig.Entity.COLLIDES.PASSIVE,
		
		
		
// 		init: function( x, y, settings ) {
		
			 
// 			var flipsetting, velsetting;
// 			if(settings.flip){
// 				flipsetting = -4;
// 				velsetting = -this.maxVel.x;
// 			}else{
// 				flipsetting = 8;
// 				velsetting = this.maxVel.x;
// 			}
// 			this.parent( x + flipsetting , y+8, settings );
// 			this.vel.x = this.accel.x = velsetting;
// 			this.addAnim( 'idle', 0.2, [0] );
// 		},
		
// 		handleMovementTrace: function( res ) {
// 			this.parent( res );
// 			if( res.collision.x || res.collision.y ){
// 				this.kill();
// 			}
// 		},

// 		check: function( other ) {
// 			other.receiveDamage( 3, this );
// 			this.kill();
// 		},
		
// 	});   //end of bullet
	
	
// 	EntityMouseBullet = ig.Entity.extend({
// 		size: {x: 5, y: 3},
// 		animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
// 		maxVel: {x: 0, y: 0},
// 		type: ig.Entity.TYPE.NONE,
// 		checkAgainst: ig.Entity.TYPE.B,
// 		collides: ig.Entity.COLLIDES.PASSIVE,
		
// 		desiredVel: 300,
		
		
// 		init: function( x, y, settings ) {
		
// 			//this.angle++;
// 			ig.log( 'angle', settings.angle );
// 			//settings.angle = settings.angle/1000; // //
			
// 			this.maxVel.x = this.maxVel.y = this.desiredVel;
			
// 			var vely = Math.sin(settings.angle) * this.desiredVel; //.desiredVel is just the velocity I would want if we were going in a straight line directly out of the right of the player. I just put it as a property of the entity since I refer to it in multiple locations
// 			var velx =  Math.cos(settings.angle) * this.desiredVel;
// 			 /*
// 			 I'm a fan of fullspeed projectiles with no acceleration so we set the velocity, max velocity and for good measure acceleration too.
// 			 You might want to start with a bit of velocity and some sort of acceleration so your projectile starts off slower and speeds up for something like a rocket 
// 			 If that's the case, you'll want to do something like the following
// 			 this.maxVel.x = whatever max you want;
// 			 this.accel.x = Math.sin(this.angle)  * desiredAcceleration;
// 			 this.accel.y = Math.cos(this.angle)  * desiredAcceleration;
// 			 this.vel.x = Math.sin(this.angle)  * desiredStartingVelocity;
// 			 this.vel.y = Math.cos(this.angle)  * desiredStartingVelocity;
// 			 */
// 			//this.maxVel.x = this.vel.x = this.accel.x = velx;
// 			//this.maxVel.y = this.vel.y = this.accel.y = vely;
		
		
// 			this.parent( x  , y+8, settings );
// 			this.vel.x = this.accel.x = velx;
// 			this.vel.y = this.accel.y = vely;
			
// 			this.addAnim( 'idle', 0.2, [0] );
// 		},
		
		
		
// 		handleMovementTrace: function( res ) {
// 			this.parent( res );
// 			if( res.collision.x || res.collision.y ){
// 				this.kill();
// 			}
// 		},

// 		check: function( other ) {
// 			other.receiveDamage( 1, this );
// 			other.vel.x += this.vel.x/10;
// 			other.vel.y += this.vel.y/10;
// 			this.kill();
// 		},
// 		kill: function(){
			
// 			this.parent();
// 			ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, 
// 				{callBack:this.onDeath} );
// 		},
		
// 	});   //end of bullet
	
// 	EntityDeathExplosion = ig.Entity.extend({
// 		lifetime: 1,
// 		callBack: null,
// 		particles: 25,
		
// 		init: function( x, y, settings ) {
// 			this.parent( x, y, settings );
// 			for(var i = 0; i < this.particles; i++)
// 				var offsetColor;
// 				if(settings.colorOffset)
// 				{
// 					offsetColor = settings.colorOffset;
// 				}else{
// 					offsetColor = 0;
// 				}
// 				ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: offsetColor});
// 			this.idleTimer = new ig.Timer();
// 		},
// 		update: function() {
// 		if( this.idleTimer.delta() > this.lifetime ) {
// 			this.kill();
// 			if(this.callBack)
// 				this.callBack();
// 				return;
// 			}
// 		},
		
// 	});
	
	
// 	EntityDeathExplosionParticle = ig.Entity.extend({
// 		size: {x: 2, y: 2},
// 		maxVel: {x: 160, y: 200},
// 		lifetime: 3,
// 		fadetime: 2,
// 		bounciness: 0,
// 		vel: {x: 100, y: 30},
// 		friction: {x:100, y: 0},
// 		collides: ig.Entity.COLLIDES.LITE,
// 		colorOffset: 0,
// 		totalColors: 7,
// 		animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
// 		init: function( x, y, settings ) {
// 			this.parent( x, y, settings );
// 			var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
// 			* (this.totalColors+1));
// 			this.addAnim( 'idle', 0.2, [frameID] );
// 			this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
// 			this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
// 			this.idleTimer = new ig.Timer();
// 		},
// 		update: function() {
// 			if( this.idleTimer.delta() > this.lifetime ) {
// 				this.kill();
// 				return;
// 			}
// 			this.currentAnim.alpha = this.idleTimer.delta().map(
// 				this.lifetime - this.fadetime, this.lifetime,1, 0);
// 			this.parent();
// 		}
	// });
	
	
	
	
	
	
	
	
// 	EntityDamageExplosion = ig.Entity.extend({
		
// 		callBack: null,
// 		particles: 25,
		
// 		checkAgainst: ig.Entity.TYPE.BOTH,
		
// 		init: function( x, y, settings ) {
// 			this.parent( x, y, settings );
// 			for(var i = 0; i < this.particles; i++)
// 				var offsetColor;
// 				if(settings.colorOffset)
// 				{
// 					offsetColor = settings.colorOffset;
// 				}else{
// 					offsetColor = 0;
// 				}
// 				ig.game.spawnEntity(EntityDamageExplosionParticle, x, y, {colorOffset: offsetColor,checkAgainst:this.checkAgainst});
			
// 		},
// 		update: function() {
		
// 			this.kill();
			
// 		},
		
// 	});
	
	
// 	EntityDamageExplosionParticle = ig.Entity.extend({
// 		size: {x: 2, y: 2},
// 		maxVel: {x: 160, y: 200},
// 		lifetime: 3,
// 		fadetime: 2,
// 		bounciness: 1,
// 		vel: {x: 100, y: 100},
// 		friction: {x:50, y: 50},
// 		collides: ig.Entity.COLLIDES.LITE,
// 		colorOffset: 0,
// 		totalColors: 7,
// 		animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
// 		init: function( x, y, settings ) {
// 			this.parent( x, y, settings );
// 			var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
// 			* (this.totalColors+1));
// 			this.addAnim( 'idle', 0.2, [frameID] );
// 			this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
// 			this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
// 			this.idleTimer = new ig.Timer();
// 		},
// 		update: function() {
// 			if( this.idleTimer.delta() > this.lifetime ) {
// 				this.kill();
// 				return;
// 			}
// 			this.currentAnim.alpha = this.idleTimer.delta().map(
// 				this.lifetime - this.fadetime, this.lifetime,1, 0);
// 			this.parent();
// 		},
// 		check: function( other ) {
// 			other.receiveDamage( 1, this );
// 			other.vel.x += this.vel.x/100;
// 			other.vel.y += this.vel.y/100;
// 			this.kill();
// 		},
// 	});
	
// 


/*

ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity',
	'impact.sound'
)
.defines(function(){
	EntityPlayer = ig.Entity.extend({
		animSheet: new ig.AnimationSheet( 'media/player.png', 16, 16 ),
		
		size: {x: 8, y:14},
		offset: {x: 4, y: 2},
		flip: false,
		
		maxVel: {x: 100, y: 150},
		friction: {x: 600, y: 0},
		accelGround: 400,
		accelAir: 200,
		jump: 200,
		
		type: ig.Entity.TYPE.A,
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		weapon: 0,
		totalWeapons: 2,
		activeWeapon: "EntityBullet",
		
		startPosition: null,
		
		invincible: true,
		invincibleDelay: 2,
		invincibleTimer:null,
		
		_wmDrawBox: true,
		_wmBoxColor: 'rgba(255, 0, 0, 0.7)',
		
		jumpSFX: new ig.Sound( 'media/sounds/jump.*' ),
		shootSFX: new ig.Sound( 'media/sounds/shoot.*' ),
		deathSFX: new ig.Sound( 'media/sounds/death.*' ),
		
		init: function( x, y, settings ) {
			
			this.setupAnimation(this.weapon);
			this.startPosition = {x:x,y:y};
			this.invincibleTimer = new ig.Timer();
			this.makeInvincible();
			this.parent( x, y, settings );
		},
		
		
		update: function() {
			// move left or right
			var accel = this.standing ? this.accelGround : this.accelAir;
			if( ig.input.state('left') ) {
				this.accel.x = -accel;
				this.flip = true;
			}else if( ig.input.state('right') ) {
				this.accel.x = accel;
				this.flip = false;
			}else{
				this.accel.x = 0;
			}
			// jump
			if( this.standing && ig.input.pressed('jump') ) {
				this.vel.y = -this.jump;
				this.jumpSFX.play();
			}
			// move!
			this.currentAnim.flip.x = this.flip;
			
			// shoot
			if( ig.input.pressed('shoot') ) {
				ig.game.spawnEntity( this.activeWeapon, this.pos.x, this.pos.y, {flip:this.flip} );
				this.shootSFX.play();
			}
			
			
			// set the current animation, based on the player's speed
			if( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
			}else if( this.vel.y > 0 ) {
				this.currentAnim = this.anims.fall;
			}else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
			}else{
				this.currentAnim = this.anims.idle;
			}
			
			if( ig.input.pressed('switch') ) {
				this.weapon ++;
				if(this.weapon >= this.totalWeapons)
					this.weapon = 0;
				switch(this.weapon){
					case(0):
						this.activeWeapon = "EntityBullet";
						break;
					case(1):
						this.activeWeapon = "EntityGrenade";
						break;
				}
				this.setupAnimation(this.weapon);
			}
			
			if( this.invincibleTimer.delta() > this.invincibleDelay ) {
				this.invincible = false;
				this.currentAnim.alpha = 1;
			}

			this.parent();
			
		},
		
		setupAnimation: function(offset){
			offset = offset * 10;
			this.addAnim('idle', 1, [0+offset]);
			this.addAnim('run', .07, [0+offset,1+offset,2+offset,3+offset,4+offset,5+offset]);
			this.addAnim('jump', 1, [9+offset]);
			this.addAnim('fall', 0.4, [6+offset,7+offset]);
		},
		
		kill: function(){
			this.deathSFX.play();
			this.parent();
			ig.game.respawnPosition = this.startPosition;
			ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, 
				{callBack:this.onDeath} );
		},
		
		makeInvincible: function(){
			this.invincible = true;
			this.invincibleTimer.reset();
		},
		
		receiveDamage: function(amount, from){
			if(this.invincible)
			{
				return;
			}
			this.parent(amount, from);
		},
		draw: function(){
			if(this.invincible)
			{
				this.currentAnim.alpha = this.invincibleTimer.delta()/this.invincibleDelay * 1 ;
			}
			this.parent();
		},
		
		onDeath: function(){
			ig.game.stats.deaths++;
			ig.game.lives--;
			if(ig.game.lives < 0){
				ig.game.gameOver();
			}else{
				ig.game.spawnEntity( EntityPlayer, ig.game.respawnPosition.x, 
				ig.game.respawnPosition.y);
			}
		},
		
		

	});
	
	
	EntityBullet = ig.Entity.extend({
		size: {x: 5, y: 3},
		animSheet: new ig.AnimationSheet( 'media/bullet.png', 5, 3 ),
		maxVel: {x: 200, y: 0},
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		
		init: function( x, y, settings ) {
			var flipsetting, velsetting;
			if(settings.flip){
				flipsetting = -4;
				velsetting = -this.maxVel.x;
			}else{
				flipsetting = 8;
				velsetting = this.maxVel.x;
			}
			this.parent( x + flipsetting , y+8, settings );
			this.vel.x = this.accel.x = velsetting;
			this.addAnim( 'idle', 0.2, [0] );
		},
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			if( res.collision.x || res.collision.y ){
				this.kill();
			}
		},

		check: function( other ) {
			other.receiveDamage( 3, this );
			this.kill();
		},
		
	});
	
	EntityGrenade = ig.Entity.extend({
		size: {x: 4, y: 4},
		offset: {x: 2, y: 2},
		animSheet: new ig.AnimationSheet( 'media/grenade.png', 8, 8 ),
		type: ig.Entity.TYPE.NONE,
		checkAgainst: ig.Entity.TYPE.BOTH,
		collides: ig.Entity.COLLIDES.PASSIVE,
		maxVel: {x: 200, y: 200},
		bounciness: 0.6,
		bounceCounter: 0,
		
		
		init: function( x, y, settings ) {
			if(settings.flip){
				flipsetting = -4;
				velsetting = -this.maxVel.x;
			}else{
				flipsetting = 7;
				velsetting = this.maxVel.x;
			}
			this.parent( x + (flipsetting), y, settings );
			this.vel.x = (velsetting);
			this.vel.y = -(50 + (Math.random()*100));
			this.addAnim( 'idle', 0.2, [0,1] );
		},
		
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			if( res.collision.x || res.collision.y ) {
			// only bounce 3 times
				this.bounceCounter++;
				if( this.bounceCounter > 3 ) {
					this.kill();
				}
			}
		},
		
		check: function( other ) {
			other.receiveDamage( 10, this );
			this.kill();
		},
		
		kill: function(){
			for(var i = 0; i < 20; i++)
			ig.game.spawnEntity(EntityGrenadeParticle, this.pos.x, this.pos.y);
			this.parent();
		},
		
	});
	
	
	
	EntityDeathExplosion = ig.Entity.extend({
		lifetime: 1,
		callBack: null,
		particles: 25,
		
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			for(var i = 0; i < this.particles; i++)
				var offsetColor;
				if(settings.colorOffset)
				{
					offsetColor = settings.colorOffset;
				}else{
					offsetColor = 0;
				}
				ig.game.spawnEntity(EntityDeathExplosionParticle, x, y, {colorOffset: offsetColor});
			this.idleTimer = new ig.Timer();
		},
		update: function() {
		if( this.idleTimer.delta() > this.lifetime ) {
			this.kill();
			if(this.callBack)
				this.callBack();
				return;
			}
		},
		
	});
	
	
	EntityDeathExplosionParticle = ig.Entity.extend({
		size: {x: 2, y: 2},
		maxVel: {x: 160, y: 200},
		lifetime: 2,
		fadetime: 1,
		bounciness: 0,
		vel: {x: 100, y: 30},
		friction: {x:100, y: 0},
		collides: ig.Entity.COLLIDES.LITE,
		colorOffset: 0,
		totalColors: 7,
		animSheet: new ig.AnimationSheet( 'media/blood.png', 2, 2 ),
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			var frameID = Math.round(Math.random()*this.totalColors) + (this.colorOffset 
			* (this.totalColors+1));
			this.addAnim( 'idle', 0.2, [frameID] );
			this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
			this.vel.y = (Math.random() * 2 - 1) * this.vel.y;
			this.idleTimer = new ig.Timer();
		},
		update: function() {
			if( this.idleTimer.delta() > this.lifetime ) {
				this.kill();
				return;
			}
			this.currentAnim.alpha = this.idleTimer.delta().map(
				this.lifetime - this.fadetime, this.lifetime,1, 0);
			this.parent();
		}
	});
	
	
	EntityGrenadeParticle = ig.Entity.extend({
		size: {x: 1, y: 1},
		maxVel: {x: 160, y: 200},
		lifetime: 1,
		fadetime: 1,
		bounciness: 0.3,
		vel: {x: 40, y: 50},
		friction: {x:20, y: 20},
		checkAgainst: ig.Entity.TYPE.B,
		collides: ig.Entity.COLLIDES.LITE,
		animSheet: new ig.AnimationSheet( 'media/explosion.png', 1, 1 ),
		init: function( x, y, settings ) {
			this.parent( x, y, settings );
			this.vel.x = (Math.random() * 4 - 1) * this.vel.x;
			this.vel.y = (Math.random() * 10 - 1) * this.vel.y;
			this.idleTimer = new ig.Timer();
			var frameID = Math.round(Math.random()*7);
			this.addAnim( 'idle', 0.2, [frameID] );
		},
		update: function() {
			if( this.idleTimer.delta() > this.lifetime ) {
				this.kill();
				return;
			}
			this.currentAnim.alpha = this.idleTimer.delta().map(
				this.lifetime - this.fadetime, this.lifetime,1, 0);
			this.parent();
		},
	});
	
});
*/