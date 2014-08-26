
ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.timer',
	'game.levels.hom1',
	//'game.levels.dorm1'
	
	'impact.debug.debug' // <- Add this
)
.defines(function(){

	MyGame = ig.Game.extend({
	
		font: new ig.Font( 'media/04b03.font.png' ),
		outputMsg: 0,
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
              deaths: 0,
              deathText:0
              },
		
		lives: 1,
		
		gravity:0,

		highlighted:0,
		lastHL:0,
		lines: [],

    map: [],
    mapSize: 64,

    allPlanetProfiles: {},
    homePlanetProfiles: {},
    lengthPlanetProfiles: 0,

		mapAccel:2.1,
		
		init: function() {
		// Initialize your game here; bind keys etc.
			//this.loadLevel( LevelDorm1 );
      // console.log(LevelHom1.layer[0].name);

      this.randomizeMap(LevelHom1.layer[0].data);
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
      this.homePlanetProfiles = homeProfilesJSON;

      this.spawnAllThePlanets();
      // jQuery.getJSON("planet-profiles.json", function(json) {
      //   console.log(json); // this will show the info it in firebug console
      // });

		},
		
		update: function(){
		
				// screen follows the player
			// var player = this.getEntitiesByType( EntityPlayer )[0];
			var player = 0;
      if(ig.game.highlighted == 0 && ig.game.lastHL == 0){
        //this is the very first momnet
        var homePlanet = ig.game.getEntitiesByType( EntityPlanet );
        ig.game.highlighted = homePlanet[0];
        this.setHomeProfile(ig.game.highlighted);
      }
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
          this.deductFuelViaDistance();
				}

				ig.game.lastHL = ig.game.highlighted ;
				player = ig.game.highlighted;
        

			}else{
				player = 0;
			}

			if( player != 0) { //pretty much can only be 0 if game is new
				this.screen.x = player.pos.x - ig.system.width/2;
				this.screen.y = player.pos.y - (.50)*ig.system.height;
        this.checkForNegativeResources();
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

			this.checkForScreenOutsideMap();

			this.parent();
			
		},
		
		draw: function(){
			this.parent();
			
			var x =ig.system.width/2;
			var y = ig.system.height/2;
			
      if(this.outputMsg == 0){
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
		

		randomizeMap: function(mapArray){
      // var tiles = new ig.Image( 'media/planet_tileset.png' );
      // // this.collisionMap = new ig.CollisionMap( this.mapSize, this.map );
      // //   var bgmap = new ig.BackgroundMap( this.mapSize, this.map, this.tiles );

      // //   this.backgroundMaps.push( bgmap );
      // for(var i=0;i<this.mapSize;i++){
      //   this.map[i] = this.getRow();
      // }

      // var bgmap = new ig.BackgroundMap( this.mapSize, this.map, tiles );

      // this.backgroundMaps.push( bgmap );

      for(var y=0;y<mapArray.length;y++){
        for(var x=0;x<mapArray[0].length;x++){
          mapArray[y][x] = this.randomNumGen(0,25); //should be 23, pad w black?
        }
      }

    },

    // getRow: function() {
    //     var row = [];
    //     for( var x = 0; x < this.mapSize; x++ ) {
    //         // row[x] = Math.random() > 0.93 ? 1 : 0;

    //         row[x] = this.randomNumGen(0,3);
    //     }
    //     return row;
    // },

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
      ig.game.stats.deathText += this.outputMsg;
			ig.finalStats = ig.game.stats;
			ig.system.setGame(GameOverScreen);
		},
	
		loadProfile: function(){
      // console.log(this.allPlanetProfiles.profiles.length);
      
      if (this.highlighted.profile == 0){
        var items = ig.game.allPlanetProfiles.profiles;
        var index = Math.floor(Math.random()*items.length);
        // console.log(index);
        var item = items[index];
        this.highlighted.profile = item;
        this.outputMsg = item.text;
        // this.stats.crew += item.crew;
        this.stats.hull += item.hull;
        this.additionalModsViaProfileName(item.name);

        if(item.fuel > 10){
          this.highlighted.setAsFuelPlanet();
        }else{
          this.highlighted.setAsDullPlanet();
        }
        if (item.crew < 0){
          if(this.stats.crew < -item.crew){
            this.stats.deaths += this.stats.crew;
            this.stats.crew = 0;
          }else{
            this.stats.deaths += -item.crew;
            this.stats.crew += item.crew;
          }
          
        }else{
          this.stats.crew += item.crew;
        }

        this.stats.crystal += item.crystal;

        
      }//end of big if

      var fuelReward=0;
      if(this.highlighted.timesVisited > 0){
        if(this.highlighted.home ){
          fuelReward = this.highlighted.profile.fuel - this.highlighted.timesVisited;
        }else{
          fuelReward = this.highlighted.profile.fuel - this.highlighted.timesVisited*5;
        }

        if(fuelReward >= 0){
          if(this.highlighted.home){
            this.outputMsg = "Your homeworld showers you in praise, and fuel.";
          }else{
            this.outputMsg = "This world repeats in gift of fuel.";
          }
          this.stats.fuel += fuelReward;
        }else{
          if(this.highlighted.home){
            this.outputMsg = "Your homeworld has no more fuel to spare.";
          }else{
            this.outputMsg = "This world cannot give any more fuel.";
          }
        }

      }//end timesvisited > 0 if
      
      this.highlighted.timesVisited += 1;


      if(this.stats.crystal < 0){
        this.stats.crystal = 0;
      }
      if(this.stats.crew < 0){
        this.stats.crew = 0;
      }
      if(this.stats.fuel < 0){
        this.stats.fuel = 0;
      }

    },

    setHomeProfile: function(homePlanet){
      var items = ig.game.homePlanetProfiles.profiles;
      var index = Math.floor(Math.random()*items.length);
      // console.log(index);
      var item = items[index];
      homePlanet.profile = item;
      this.outputMsg = item.text;
      // this.stats.crew += item.crew;
      this.stats.hull += item.hull;
      this.additionalModsViaProfileName(item.name);

      this.stats.crew += item.crew;
      this.stats.hull += item.hull;
      this.stats.fuel += item.fuel;
      this.stats.crystal += item.crystal;

      homePlanet.setAsHomePlanet();

    },

    deductFuelViaDistance: function(){
      var adjFactor = 0.1; 
      var distanceX = this.highlighted.pos.x - this.lastHL.pos.x;
      var distanceY = this.highlighted.pos.y - this.lastHL.pos.y;

      var distanceH = Math.sqrt(Math.pow(distanceX,2) + Math.pow(distanceY,2)) * adjFactor; 

      this.stats.fuel -= Math.floor(distanceH) ;
    },

    checkForNegativeResources: function(){ //
      if(this.stats.fuel <= 0 ){
        this.stats.deathText = "You ran out of fuel.\n";
        this.gameOver();
      }
      if(this.stats.hull <= 0){
        this.stats.deathText = "Your hull was destroyed.\n";
        this.gameOver();
      }
      if( this.stats.crew <= 0   ){

        this.stats.deathText = "The ship no longer has a crew.\n";
        this.gameOver();
      }

    },

    spawnAllThePlanets: function(){
      var totalPlanets = 100;
      for (i = 0; i < totalPlanets; i++) { 
        var allPlanets = ig.game.getEntitiesByType( EntityPlanet );
        var mapX = ig.game.collisionMap.width * 24;
        var mapY = ig.game.collisionMap.height * 24;
        // console.log(mapX, mapY);
        var maybePlanet = ig.game.spawnEntity( EntityPlanet,
                                       40 + Math.floor(Math.random()*mapX),
                                       40 + Math.floor(Math.random()*mapY)
                                         );
        // console.log(maybePlanet.pos.x , maybePlanet.pos.y); //

        for(j=0;j<allPlanets.length;j++){
          if(Math.abs(allPlanets[j].pos.x - maybePlanet.pos.x) < 40
            & Math.abs(allPlanets[j].pos.y - maybePlanet.pos.y) < 40 ){ //
            // console.log(allPlanets[j].pos.x ,
            //  maybePlanet.pos.x,
            //  allPlanets[j].pos.y ,
            //   maybePlanet.pos.y);
            maybePlanet.kill();
            totalPlanets++;
            break;
          }
        }//end looking for
      }//end outer rand for
      // console.log(totalPlanets);
    },//end spawn func

    additionalModsViaProfileName: function(name){
      if(name == "Gas Giant"){
        this.stats.fuel += this.randomNumGen(1,20);
        this.stats.crew -= this.randomNumGen(1,5);
        this.stats.hull -= this.randomNumGen(1,5);
      }

    },

    randomNumGen: function(smallest,largest){
      return (smallest + Math.floor(Math.random()*largest-smallest+1));
    },

    checkForScreenOutsideMap: function(){
      //ig.system.width , height
      //ig.game.collisionMap.width, height
      //this.screen.x,y
      var mapX = ig.game.collisionMap.width * 24;
      var mapY = ig.game.collisionMap.height * 24;

      // console.log(this.screen.x,
      //             this.screen.y,
      //             mapX,
      //             mapY,
      //             ig.system.width,
      //             ig.system.height);

      if(this.screen.x + ig.system.width > mapX){
        this.screen.x = mapX - ig.system.width;
      }else if(this.screen.x < 0){
        this.screen.x = 0;
      }

      if(this.screen.y + ig.system.height > mapY){
        this.screen.y = mapY - ig.system.height;
      }else if(this.screen.y < 0){
        this.screen.y = 0;
      }

    } //end cehck for screen bounds func
		
	}); //end game enitity thing
	
	
	StartScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/telecaster_screen.png'),
		// mainCharacter: new ig.Image('media/screen-main-character.png'),
		// title: new ig.Image('media/game-title.png'),
		
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
			// this.mainCharacter.draw(0,0);
			// this.title.draw(ig.system.width - this.title.width, 0);
			var x = ig.system.width/2,
			y = ig.system.height - 100;
			this.instructText.draw( 'Click/Tap To Start', x+30, y, 
			ig.Font.ALIGN.CENTER );
		}
	});
	
	GameOverScreen = ig.Game.extend({
		instructText: new ig.Font( 'media/04b03.font.png' ),
		background: new ig.Image('media/telecaster_screen.png'),
		gameOver: new ig.Image('media/game_over.png'),
		stats: {},
    outputMsg: "",
		
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
      var crystalScore = 55;
      var crewScore = 91;
			this.parent();
			this.background.draw(0,0);
			var x = ig.system.width/2;
			var y = ig.system.height/2 - 20;
			this.gameOver.draw(x - (this.gameOver.width * .5), y - 30);
			var score = (this.stats.crystal * crystalScore) - (this.stats.deaths * crewScore);
			this.instructText.draw('Total Crystals Acquired: '+this.stats.crystal, x, y+30, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Total Crew Lost: '+this.stats.deaths, x, y+40, 
				ig.Font.ALIGN.CENTER);
			this.instructText.draw('Score: '+score, x, y+50, ig.Font.ALIGN.CENTER);
			this.instructText.draw('Click/Tap To Continue.', x, ig.system.height - 
				100, ig.Font.ALIGN.CENTER);

      this.instructText.draw(this.stats.deathText,
          ig.system.width/2,
          ig.system.height*(0.1),
          ig.Font.ALIGN.CENTER );
		}
	});
	
	
	
	
	
	
	
	var game_x, game_y, game_z;
	
	if( ig.ua.mobile ) {
		// Disable sound for all mobile devices
		ig.Sound.enabled = false;
		game_x =322;
		game_y =368; // 
		game_z =3;
	}else{
		game_x =400; 
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


  var homeProfilesJSON = {"profiles":
    [
      {"name":"Science Home Planet",
        "text":"As a scientist, your job is to explore and record your findings as you"
        +"\n travel the galaxy. Your observations will help shape your planet's perception"
        +"\nof the universe, and ultimately shape history."
        +"\nClick to activate the telecaster and explore your first planet!",
        "fuel":40,
        "crew":0,
        "hull":0,
        "crystal":20
        },

         {"name":"Warrior Home Planet",
        "text":"You come from a long line of military generals and bloodthirsty warriors."
        +"\nYou plan on making your people proud as you conquer the galaxy,"
        +"\none planet at a time."
        +"\nFire the telecaster to conquer your first planet and claim it for your people!",
        "fuel":30,
        "crew":0,
        "hull":40,
        "crystal":0
        },

         {"name":"Overpopulated Home Planet",
        "text":"Your species is numerous and your home planet crowded. As a desperate measure,"
        +"\nyou have been sent forth to explore and colonize other planets and search for"
        +"\nlife-sustaining resources."
        +"\nClick to transport your colonists to your first planet via telecaster! ",
        "fuel":30,
        "crew":40,
        "hull":0,
        "crystal":0
        }
    ]
  }; //end of home profile json


  var planetProfilesJSON = {"profiles":
    [
      {"name":"Gas Giant",
        "text":"You were able to harvest fuel from a gas giant, but the process was dangerous."
        +"\nYou have lost crew members and damaged your hull.",
        "fuel":25,
        "crew":-5,
        "hull":-5,
        "crystal":0
        },

        {"name":"Native Tribe Planet",
        "text":"Indigenous peoples believe you a god and have gifted you sacred crystals"
        +"\nin return for a plentiful harvest and an end to their drought.",
        "fuel":5,
        "crew":0,
        "hull":0,
        "crystal":30
        },

        {"name":"Friendly Planet",
        "text":"The locals are very accommodating and some have chosen to leave their homes"
        +"\nand join your crew to seek adventure among the stars!",
        "fuel":10,
        "crew":25,
        "hull":10,
        "crystal":0
        },

        {"name":"Utopia",
        "text":"You have found a perfect planet, a utopia!"
        +"\nUnfortunately... "
        +"\nIt's so perfect that your crew members have decided to stay here forever...",
        "fuel":25,
        "crew":-300,
        "hull":25,
        "crystal":20
        },

        {"name":"Crystal Planet",
        "text":"You've found a crystal planet!"
        +"\nYour hull has been damaged while trying to gather an absurd amount of crystals."
        +"\nHope it was worth it...",
        "fuel":0,
        "crew":0,
        "hull":-50,
        "crystal":75
        },

        {"name":"Planet o' Robbers",
        "text":"You've been tricksed!"
        +"\nSpace pirates have stolen your crystals and your crew has been enslaved.",
        "fuel":0,
        "crew":-100,
        "hull":30,
        "crystal":-100
        },

        {"name":"Repair Station",
        "text":"You've found a repair station! They won't accept your strange currency..."
        +"\nbut will settle for crystals.",
        "fuel":30,
        "crew":0,
        "hull":50,
        "crystal":-40
        },

        {"name":"Scrap Metal Planet",
        "text":"You've found the ruins of a civilization with plenty of scrap metal"
        +"\nto patch your ship up. Takes a bit of fuel to collect it all, though.",
        "fuel":-30,
        "crew":0,
        "hull":40,
        "crystal":0
        },

        {"name":"Because Empire!",
        "text":"You've enslaved a technologically inferior race and stolen their wealth..."
        +"\nand also renamed their planet after yourself."
        +"\nNot cool, bro.",
        "fuel":0,
        "crew":75,
        "hull":-5,
        "crystal":50
        },

        {"name":"The Captain's Descent into Madness",
        "text":"You just sold your crew into slavery because crystals were on sale."
        +"\nA trip to the psychological evaluation center is strongly advised.",
        "fuel":0,
        "crew":-300,
        "hull":0,
        "crystal":157
        },

        {"name":"Average Planet",
        "text":"The natives offer you tokens of goodwill in exchange for"
        +"\nallowing them to live. How generous.",
        "fuel":20,
        "crew":0,
        "hull":20,
        "crystal":10
        },

         {"name":"Spider Planet",
        "text":"The arachnoid species inhabiting the planet offer you their silk"
        +"\nto repair and strengthen your hull with. The silk is stronger than any metal"
        +"\nyou currently have on board.",
        "fuel":0,
        "crew":0,
        "hull":30,
        "crystal":0
        },

         {"name":"Cow-Town",
        "text":"An agricultural community offers you manure from their livestock"
        +"\nto use as fuel and requests you immediately leave.",
        "fuel":30,
        "crew":0,
        "hull":0,
        "crystal":0
        },

         {"name":"Clones",
        "text":"The cloning technology on this planet allows you to supplement your crew"
        +"\nwith genetically superior specimens.",
        "fuel":0,
        "crew":50,
        "hull":0,
        "crystal":-10
        },

         {"name":"Junkyard Planet I",
        "text":"Plenty of scrap metal can be found on this junkyard planet to"
        +"\nrepair and strengthen your hull.",
        "fuel":0,
        "crew":0,
        "hull":30,
        "crystal":-5
        },

         {"name":"Junkyard Planet II",
        "text":"Both fuel and scrap metal can be found on this junkyard planet"
        +"\nand they can be yours...for a price...",
        "fuel":20,
        "crew":0,
        "hull":30,
        "crystal":-15
        },

         {"name":"Pompeii",
        "text":"You inadvertently save a village from imminent death and"
        +"\nthey decide to join your crew out of gratitude.",
        "fuel":0,
        "crew":35,
        "hull":0,
        "crystal":5
        },

         {"name":"Fuel Crystal Planet",
        "text":"You find an uncommon form of crystal that can double as fuel!"
        +"\nUnfortunately, some of your crew members were careless and died collecting them.",
        "fuel":25,
        "crew":-10,
        "hull":0,
        "crystal":25
        },

         {"name":"Repairs Planet",
        "text":"An amiable race repairs and strengthens your hull in exchange for crystals."
        +"\nThey advise you to stay away from green planets, but do not give you a reason.",
        "fuel":0,
        "crew":0,
        "hull":30,
        "crystal":-15
        },

         {"name":"Mining Planet",
        "text":"You strip-mine a seemingly empty planet."
        +"\nYou find fuel, crystals, and ancient ruins.",
        "fuel":35,
        "crew":0,
        "hull":0,
        "crystal":20
        },

        {"name":"Slightly Unethical Practices",
        "text":"Natives have graciously offered to help make you fuel..."
        +"\n...but refuse to reveal how, exactly, they'll do so. "
        +"\nAlso, it seems some crew members have gone missing..."
        +"\nbut I'm sure that's unrelated.",
        "fuel":30,
        "crew":-10,
        "hull":0,
        "crystal":0
        },

         {"name":"Corrosive Planet",
        "text":"You've found a crystal planet with a highly corrosive atmosphere."
        +"\nYou attempt to mine the crystals, but a major accident occurs"
        +"\nand as a result you've sustained significant casualties.",
        "fuel":0,
        "crew":-40,
        "hull":0,
        "crystal":50
        },

         {"name":"Ship Cemetery",
        "text":"The surface of this planet is littered with the wreckage of millions of"
        +"\nodd-looking spaceships. They appear to possess technology far beyond any you've"
        +"\never seen. You take what scraps you can to strengthen your hull.",
        "fuel":0,
        "crew":0,
        "hull":30,
        "crystal":0
        },

         {"name":"Fuel Station",
        "text":"You find an abandoned fuel station still containing some usable fuel."
        +"\nYou notice, however, that the owners of the station are still present."
        +"\nWell. Their remains are, anyway.",
        "fuel":40,
        "crew":0,
        "hull":0,
        "crystal":0
        },

         {"name":"Radioactive Planet",
        "text":"You find a planet with a radioactive surface and you decide to collect samples"
        +"\nTo use as fuel. However, you lose some crew members and damage your ship"
        +"\nin the process.",
        "fuel":30,
        "crew":-10,
        "hull":-5,
        "crystal":0
        },

         {"name":"Monster Planet I",
        "text":"You encounter a hostile race and take some damage from the attack."
        +"\nHowever, you're able to retreat, taking with you some of their wealth.",
        "fuel":10,
        "crew":-10,
        "hull":-10,
        "crystal":10
        },

         {"name":"Monster Planet II",
        "text":"You encounter a hostile race, but you are able to successfully subdue them,"
        +"\ntaking their resources and their people as your own.",
        "fuel":30,
        "crew":15,
        "hull":-10,
        "crystal":15
        },

         {"name":"Monster Planet III",
        "text":"You encounter a hostile race and upon engaging them, take heavy losses."
        +"\nYou barely escape with your own life, defeated and disgraced.",
        "fuel":0,
        "crew":-25,
        "hull":-20,
        "crystal":0
        },

         {"name":"Octopi Planet",
        "text":"You encounter a highly intelligent cephalopoid race."
        +"\nThey are happy to help you refuel and request you bring them"
        +"\nmalachite samples.",
        "fuel":35,
        "crew":0,
        "hull":0,
        "crystal":0
        },

         {"name":"Healer Planet",
        "text":"This planet is inhabited by shaman-like healers, some of which join"
        +"\nyour crew. They give you crystals as a token of goodwill.",
        "fuel":0,
        "crew":5,
        "hull":0,
        "crystal":40
        },

         {"name":"Unfriendly Planet",
        "text":"You are not authorized to land on this planet."
        +"\nYou have been given fuel, but you must leave immediately.",
        "fuel":30,
        "crew":0,
        "hull":0,
        "crystal":0
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