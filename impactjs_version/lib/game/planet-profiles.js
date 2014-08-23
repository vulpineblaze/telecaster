ig.module( 
  'game.planet-profiles' 
)
.requires(
  // 'impact.game',
  // 'impact.font',
  // 'impact.timer',
  // 'game.levels.hom1',
  // 'game.planet-profiles',
  // //'game.levels.dorm1'
  
  // 'impact.debug.debug' // <- Add this
)
.defines(function(){
  // ig.game.allPlanetProfiles = {"profiles":
  var planetProfilesJSON = {"profiles":
  	[
      {"name":"mean",
        "fuel":-30,
        "crew":-30,
        "hull":-30,
        "crystal":0
        },
      {"name":"good",
        "fuel":10,
        "crew":10,
        "hull":10,
        "crystal":10
        },
      {"name":"great",
        "fuel":30,
        "crew":30,
        "hull":30,
        "crystal":20
        }


    ]


  };

});