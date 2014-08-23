
ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.timer',
	'game.levels.hom1',
  'game.planet-profiles',
	//'game.levels.dorm1'
	
	'impact.debug.debug' // <- Add this
)
.defines(function(){

	MyGame = ig.Game.extend({
	
		font: new ig.Font( 'media/04b03.font.png' ),
		outputMsg: 'It works!',
		statText: new ig.Font( 'media/04b03.font.png' ),
		showStats: false,
		statMatte: new ig.Image('media/stat-matte.png'),
		levelTimer: new ig.Timer(),
		levelExit: null,

		stats: { fuel: 0,
              crew: 0,
              hull: 0,
              filler: 0,
              crystal: 0,
              time: 0, 
              kills: 0, 
              deaths: 0
              },
		
		lives: 1,
		
		gravity:0,

		highlighted:0,
		lastHL:0,
		lines: [],

    allPlanetProfiles: {},
    lengthPlanetProfiles: 0,

		mapAccel:2.1,
		
		init: function() {
		// Initialize your game here; bind keys etc.
			//this.loadLevel( LevelDorm1 );
			this.loadLevel( LevelHom1 );

      this.stats.fuel = 300;
      this.stats.crew = 100;
      this.stats.hull = 100;
      this.stats.crystal = 0.0;

			
			// Bind keys
			ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
			ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
			ig.input.bind( ig.KEY.DOWN_ARROW, 'down' );
			ig.input.bind( ig.KEY.UP_ARROW, 'up' );
			ig.input.bind( ig.KEY.A, 'left' );
			ig.input.bind( ig.KEY.D, 'right' );
			ig.input.bind( ig.KEY.S, 'down' );
			ig.input.bind( ig.KEY.W, 'up' );
			ig.input.bind( ig.KEY.X, 'jump' );
			ig.input.bind( ig.KEY.C, 'shoot' );
			
			
			ig.input.initMouse();
			ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );

			// spawn planet entities
			ig.game.spawnEntity( EntityPlanet, 100, 100 );

      // var xobj = new XMLHttpRequest();
      // xobj.overrideMimeType("application/json");
      // xobj.open('GET', 'lib/game/planet-profiles.json', true);
      // xobj.onreadystatechange = function () {
      //     if (xobj.readyState == 4) {
      //         this.allPlanetProfiles = xobj.responseText
      //         // this.lengthPlanetProfiles = this.allPlanetProfiles.profiles.length
      //         // var jsonTexto = xobj.responseText;
      //         // ProcessTheData(jsonTexto);
      //     }
      // }
      // xobj.send(null);

      // this.allPlanetProfiles = jsonTexto;
      // this.lengthPlanetProfiles = Object.keys(this.allPlanetProfiles.profiles).length
      // this.lengthPlanetProfiles = this.allPlanetProfiles.profiles[0].name

      this.allPlanetProfiles = planetProfilesJSON;
      // jQuery.getJSON("planet-profiles.json", function(json) {
      //   console.log(json); // this will show the info it in firebug console
      // });

		},
		
		update: function(){
		
				// screen follows the player
			// var player = this.getEntitiesByType( EntityPlayer )[0];
			var player = 0;

			// if(ig.game.highlighted != 0){
			// 	player = ig.game.highlighted;
			// }
			if(ig.game.highlighted != ig.game.lastHL){
				// this.outputMsg = 0;

				if (this.highlighted != 0 && this.lastHL != 0){
					this.lines.push(ig.game.spawnEntity( EntityLine ,
	                                ig.game.highlighted.pos.x,
	                                ig.game.highlighted.pos.y,
	                                {target:
	                                  {x:ig.game.lastHL.pos.x,
	                                    y:ig.game.lastHL.pos.y}
	                                  }
	                                  ));
          this.loadProfile();
				}

				ig.game.lastHL = ig.game.highlighted ;
				player = ig.game.highlighted;
        

			}else{
				player = 0;
			}

			if( player != 0) {
				this.screen.x = player.pos.x - ig.system.width/2;
				this.screen.y = player.pos.y - (.50)*ig.system.height;
			}
			
			if(!(this.instructText == null)){if( (this.instructText == null) || this.instructText && player.accel.x > 0)
			{this.instructText = null;}}

			if( ig.input.state('left') ) {
				this.screen.x += -this.mapAccel;
			}else if( ig.input.state('right') ) {
				this.screen.x += this.mapAccel;
			}else if( ig.input.state('up') ) {
				this.screen.y += -this.mapAccel;
			}else if( ig.input.state('down') ) {
				this.screen.y += this.mapAccel;
			}

			
			this.parent();
			
		},
		
		draw: function(){
			this.parent();
			
			var x =ig.system.width/2;
			var y = ig.system.height/2;
			
      if(this.outputMsg != 0){
        this.outputMsg='Click a planet to Connect via Telecaster!';
        // this.font.draw(this.outputMsg,x,y,ig.Font.ALIGN.CENTER );
      }
			
			// if(this.instructText){
			// 	var x = ig.system.width/2,
			// 	y = ig.system.height - 100;
			// 	this.instructText.draw( 
			// 		'Click a planet to Connect via Telecaster!', 
			// 		x, y, ig.Font.ALIGN.CENTER );
			// }
			
			if(this.showStats){
				this.statMatte.draw(0,0);
				var x = ig.system.width/2;
				var y = ig.system.height/2 - 20;
				this. statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
				this. statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
				this. statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
				this. statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
				this. statText.draw('Press Spacebar to continue.', x, ig.system.height - 10, 
				ig.Font.ALIGN.CENTER);
			}
			
		},
		
		
		loadLevel: function( data ) {
			this.stats = {time: 0, kills: 0, deaths: 0};
			this.parent(data);
			this.levelTimer.reset();
		},
		
		toggleStats: function(levelExit){
			this.showStats = true;
			this.stats.time = Math.round(this.levelTimer.delta());
			this.levelExit = levelExit;
		},
		
		gameOver: function(){
			ig.finalStats = ig.game.stats;
			ig.system.setGame(GameOverScreen);
		},
	
		loadProfile: function(){
      // console.log(this.allPlanetProfiles.profiles.length);
      
      if (this.highlighted.profile == 0){
        var items = ig.game.allPlanetProfiles.profiles;
        var index = Math.floor(Math.random()*items.length);
        console.log(index);
        var item = items[index];
        this.highlighted.profile = item;
        this.outputMsg = item.text;
        this.stats.crew += item.crew;
        this.stats.hull += item.hull;
        

        this.stats.crystal += item.crystal;
      }

        this.stats.fuel += this.highlighted.profile.fuel;

    },


		
	});
	
	
	StartScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/screen-bg.png'),
		mainCharacter: new ig.Image('media/screen-main-character.png'),
		title: new ig.Image('media/game-title.png'),
		
		init: function() {
			ig.input.initMouse();
			ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );
		},
		
		update: function() {
			if(ig.input.pressed ('lbtn')){
				ig.system.setGame(MyGame)
			}
			this.parent();
		},
		
		draw: function() {
			this.parent();
			this.background.draw(0,0);
			this.mainCharacter.draw(0,0);
			this.title.draw(ig.system.width - this.title.width, 0);
			var x = ig.system.width/2,
			y = ig.system.height - 100;
			this.instructText.draw( 'Click/Tap To Start', x+30, y, 
			ig.Font.ALIGN.CENTER );
		}
	});
	
	GameOverScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/screen-bg.png'),
		gameOver: new ig.Image('media/game-over.png'),
		stats: {},
		
		init: function() {
			ig.input.initMouse();
			ig.input.bind( ig.KEY.MOUSE1, 'lbtn' );
			this.stats = ig.finalStats;
		},
		
		update: function() {
			if(ig.input.pressed('lbtn')){
			ig.system.setGame(StartScreen)
			}
			this.parent();
		},
		
		draw: function() {
			this.parent();
			this.background.draw(0,0);
			var x = ig.system.width/2;
			var y = ig.system.height/2 - 20;
			this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
			var score = (this.stats.kills * 100) - (this.stats.deaths * 50);
			this.instructText.draw('Total Kills: '+this.stats.kills, x, y+30, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Total Deaths: '+this.stats.deaths, x, y+40, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
			this.instructText.draw('Click/Tap To Continue.', x, ig.system.height - 
				100, ig.Font.ALIGN.CENTER);
		}
	});
	
	
	
	
	
	
	
	var game_x, game_y, game_z;
	
	if( ig.ua.mobile ) {
		// Disable sound for all mobile devices
		ig.Sound.enabled = false;
		game_x =312;
		game_y =468;
		game_z =4;
	}else{
		game_x =400; //
		game_y =320;
		game_z =2;
	}
	
	/*
	game_x =312;
	game_y =468;
	game_z =2;
	*/
	ig.main('#canvas',StartScreen,60,game_x,game_y,game_z);
	//ig.main('#canvas',MyGame,60,312,468,2);
	//ig.main('#canvas',MyGame,60,624,936,2);
	//ig.main('#canvas',MyGame,60,1248,1872,0.5);


  var planetProfilesJSON = {"profiles":
    [
      {"name":"mean",
        "text":"Evil monsters attacked!",
        "fuel":-30,
        "crew":-30,
        "hull":-30,
        "crystal":0
        },
      {"name":"good",
        "text":"Cool stuff was lying around.",
        "fuel":10,
        "crew":10,
        "hull":10,
        "crystal":10
        },
      {"name":"great",
        "text":"Super friendly and advanced aliens hook it up with goodies!",
        "fuel":30,
        "crew":30,
        "hull":30,
        "crystal":20
        }


    ]


  };

}); //end of the whole game

















/*
ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.timer',
	'game.levels.hom1'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	instructText: new ig.Font( 'media/04b03.font.png' ),
	
	
	gravity: 300,
	
	statText: new ig.Font( 'media/04b03.font.png' ),
	showStats: false,
	statMatte: new ig.Image('media/stat-matte.png'),
	levelTimer: new ig.Timer(),
	levelExit: null,
	stats: {time: 0, kills: 0, deaths: 0},
	
	lives: 3,
	lifeSprite: new ig.Image('media/life-sprite.png'),
	
	
	init: function() {
		// Initialize your game here; bind keys etc.
		ig.music.add( 'media/sounds/theme.*' );
		ig.music.volume = 0.5;
		ig.music.play();
		
		// Bind keys
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.X, 'jump' );
		ig.input.bind( ig.KEY.C, 'shoot' );
		ig.input.bind( ig.KEY.TAB, 'switch' );
		ig.input.bind( ig.KEY.SPACE, 'continue' );

		this.loadLevel( LevelDorm1 );
	},
	
	update: function() {
		// screen follows the player
		var player = this.getEntitiesByType( EntityPlayer )[0];
		if( player ) {
			this.screen.x = player.pos.x - ig.system.width/2;
			this.screen.y = player.pos.y - ig.system.height/2;
		}
		if(!(this.instructText == null)){if( (this.instructText == null) || this.instructText && player.accel.x > 0)
			{this.instructText = null;}}
		// Update all entities and BackgroundMaps
		if(!this.showStats){
			this.parent();
		}else{
			if(ig.input.state('continue')){
				this.showStats = false;
				this.levelExit.nextLevel();
				this.parent();
			}
		}
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		// Add your own drawing code here
		if(this.instructText){
			var x = ig.system.width/2,
			y = ig.system.height - 10;
			this.instructText.draw( 
				'Left/Right Moves, X Jumps, C Fires & Tab Switches Weapons.', 
				x, y, ig.Font.ALIGN.CENTER );
		}
		
		if(this.showStats){
			this.statMatte.draw(0,0);
			var x = ig.system.width/2;
			var y = ig.system.height/2 - 20;
			this. statText.draw('Level Complete', x, y, ig.Font.ALIGN.CENTER);
			this. statText.draw('Time: '+this.stats.time, x, y+30, ig.Font.ALIGN.CENTER);
			this. statText.draw('Kills: '+this.stats.kills, x, y+40, ig.Font.ALIGN.CENTER);
			this. statText.draw('Deaths: '+this.stats.deaths, x, y+50, ig.Font.ALIGN.CENTER);
			this. statText.draw('Press Spacebar to continue.', x, ig.system.height - 10, 
			ig.Font.ALIGN.CENTER);
		}
		
		this.statText.draw("Lives", 5,5);
		for(var i=0; i < this.lives; i++)
		{
			this.lifeSprite.draw(((this.lifeSprite.width + 2) * i)+5, 15);
		}


	},
	
	loadLevel: function( data ) {
		this.stats = {time: 0, kills: 0, deaths: 0};
		this.parent(data);
		this.levelTimer.reset();
	},
	
	toggleStats: function(levelExit){
		this.showStats = true;
		this.stats.time = Math.round(this.levelTimer.delta());
		this.levelExit = levelExit;
	},
	
	gameOver: function(){
		ig.finalStats = ig.game.stats;
		ig.system.setGame(GameOverScreen);
	},
	
	
});

	if( ig.ua.mobile ) {
		// Disable sound for all mobile devices
		ig.Sound.enabled = false;
	}
	
	
	
	StartScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/screen-bg.png'),
		mainCharacter: new ig.Image('media/screen-main-character.png'),
		title: new ig.Image('media/game-title.png'),
		
		init: function() {
			ig.input.bind( ig.KEY.SPACE, 'start');
		},
		
		update: function() {
			if(ig.input.pressed ('start')){
				ig.system.setGame(MyGame)
			}
			this.parent();
		},
		
		draw: function() {
			this.parent();
			this.background.draw(0,0);
			this.mainCharacter.draw(0,0);
			this.title.draw(ig.system.width - this.title.width, 0);
			var x = ig.system.width/2,
			y = ig.system.height - 10;
			this.instructText.draw( 'Press Spacebar To Start', x+40, y, 
			ig.Font.ALIGN.CENTER );
		}
	});
	
	GameOverScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/screen-bg.png'),
		gameOver: new ig.Image('media/game-over.png'),
		stats: {},
		
		init: function() {
			ig.input.bind( ig.KEY.SPACE, 'start');
			this.stats = ig.finalStats;
		},
		
		update: function() {
			if(ig.input.pressed('start')){
			ig.system.setGame(StartScreen)
			}
			this.parent();
		},
		
		draw: function() {
			this.parent();
			this.background.draw(0,0);
			var x = ig.system.width/2;
			var y = ig.system.height/2 - 20;
			this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
			var score = (this.stats.kills * 100) - (this.stats.deaths * 50);
			this.instructText.draw('Total Kills: '+this.stats.kills, x, y+30, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Total Deaths: '+this.stats.deaths, x, y+40, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
			this.instructText.draw('Press Spacebar To Continue.', x, ig.system.height - 
				10, ig.Font.ALIGN.CENTER);
		}
	});

	
	// Start the Game with 60fps, a resolution of 320x240, scaled
	// up by a factor of 2
	ig.main( '#canvas', StartScreen, 60, 320, 240, 2 );

});
*/