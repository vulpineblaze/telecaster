ig.module(
	'game.entities.zombie'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityZombie = ig.Entity.extend({
		animSheet: new ig.AnimationSheet( 'media/zombie.png', 16, 16 ),
		size: {x: 8, y:14},
		offset: {x: 4, y: 2},
		maxVel: {x: 100, y: 100},
		flip: false,
		lookAhead: 4,
		
		friction: {x: 150, y: 150},
		speed: 16,
		
		spawnerTimer:null,
		spawnerDelay:1,
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		
		
		init: function( x, y, settings ) {
			this.spawnerTimer = new ig.Timer();
			this.addAnim('walk', .07, [0,1,2,3,4,5]);
			this.parent( x, y, settings );
		},

		update: function() {
		
			if( !(this.spawnerTimer==null) && this.spawnerTimer.delta() > this.spawnerDelay ) {
				//this.invincible = false;
				//this.currentAnim.alpha = 1;
				var dist = Math.floor((Math.random()*20)+10);
				ig.game.spawnEntity(EntityZombie, this.pos.x, this.pos.y+dist, 
					{flip:!this.flip,spawnerDelay:this.spawnerDelay+1} );
				
				this.spawnerTimer=null;

			}
			
			// near an edge? return!
			var x_coord = 4; //4 = 8-4
			/*
			if(this.flip)
			{
				x_coord = 4;
			}else{
				x_coord = this.size.x − 4;
			}
			*/// end comment blocl from line 35
			if( ig.game.collisionMap.getTile(
				this.pos.x + x_coord,
				this.pos.y + this.size.y+1
				)
			) {
			this.flip = !this.flip;
			}
			//var xdir = this.flip ? −1 : 1;
			if(this.flip)
			{
				var xdir = -1;
			}else{
				var xdir = 1;
			}
			this.vel.x = this.speed * xdir;
			this.currentAnim.flip.x = this.flip;
			this.parent();
		},
		
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			// collision with a wall? return!
			if( res.collision.x ) {
				this.flip = !this.flip;
			}
		},
		
		check: function( other ) {
			other.receiveDamage( 6, this );
			other.vel.x *= (-100);
			other.vel.y *= (-100);
		},
		
		receiveDamage: function(value){
			this.parent(value);
			if(this.health > 0)
				ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1,checkAgainst: ig.Entity.TYPE.A});
		},
		
		kill: function(){
			this.parent();
			ig.game.spawnEntity(EntityDamageExplosion, this.pos.x, this.pos.y, {colorOffset: 1,checkAgainst: ig.Entity.TYPE.A});
			ig.game.stats.kills++;
		}
		
	});
});

/*
ig.module(
	'game.entities.zombie'
)
.requires(
	'impact.entity'
)
.defines(function(){
	EntityZombie = ig.Entity.extend({
		animSheet: new ig.AnimationSheet( 'media/zombie.png', 16, 16 ),
		size: {x: 8, y:14},
		offset: {x: 4, y: 2},
		maxVel: {x: 100, y: 100},
		flip: false,
		lookAhead: 4,
		
		friction: {x: 150, y: 0},
		speed: 14,
		
		type: ig.Entity.TYPE.B,
		checkAgainst: ig.Entity.TYPE.A,
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		
		
		init: function( x, y, settings ) {
			
			this.addAnim('walk', .07, [0,1,2,3,4,5]);
			this.parent( x, y, settings );
		},

		update: function() {
			// near an edge? return!
			var x_coord = 4; //4 = 8-4
			/*
			if(this.flip)
			{
				x_coord = 4;
			}else{
				x_coord = this.size.x − 4;
			}
			// end comment blocl from line 35
			if( !ig.game.collisionMap.getTile(
				this.pos.x + x_coord,
				this.pos.y + this.size.y+1
				)
			) {
			this.flip = !this.flip;
			}
			//var xdir = this.flip ? −1 : 1;
			if(this.flip)
			{
				var xdir = -1;
			}else{
				var xdir = 1;
			}
			this.vel.x = this.speed * xdir;
			this.currentAnim.flip.x = this.flip;
			this.parent();
		},
		
		
		handleMovementTrace: function( res ) {
			this.parent( res );
			// collision with a wall? return!
			if( res.collision.x ) {
				this.flip = !this.flip;
			}
		},
		
		check: function( other ) {
		other.receiveDamage( 10, this );
		},
		
		receiveDamage: function(value){
		this.parent(value);
		if(this.health > 0)
			ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {particles: 2, colorOffset: 1});
		},
		
		kill: function(){
			this.parent();
			ig.game.spawnEntity(EntityDeathExplosion, this.pos.x, this.pos.y, {colorOffset: 1});
			ig.game.stats.kills++;
		}

	});
});
*/