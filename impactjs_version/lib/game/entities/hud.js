ig.module(
    'game.entities.hud'
)
.requires(
    'impact.entity'
)
.defines(function(){
EntityHud = ig.Entity.extend({
    size: {x: 320, y: 20},
    zIndex:800, //
    //animSheet: new ig.AnimationSheet( 'media/hud.png', 320, 20 ),
    collides: ig.Entity.COLLIDES.NEVER,
    gravityFactor: 0,
    init: function( x, y, settings ) {
        //this.addAnim( 'idle', 1, [0] );
        this.parent( x, y, settings );
        this.pos.x=ig.game.screen.x;
        this.pos.y=ig.game.screen.y;
    },
    update: function(){
        this.pos.x=ig.game.screen.x;
        this.pos.y=ig.game.screen.y;
        if (ig.input.pressed('lbtn') ){

            ig.game.sortEntitiesDeferred();
        }
        if(ig.input.mouse.y<=20)
        {
            //console.log('mouse zone');
        }
        else
        {
        
        }
        this.parent();
    },
    draw: function(){
        var offset = 1;
        var ctx = ig.system.context;

        ctx.fillStyle = "rgba(120,120,150,0.3)"; //
        ctx.fillRect(0, 0, ig.system.width*3, 120);

        ig.game.font.draw( 
            'Crystals: '+ ig.game.stats.crystal  
            +'  |  Fuel: '+ ig.game.stats.fuel  
            +'  |  Crew: '+ ig.game.stats.crew  
            +'  |  Hull: '+ ig.game.stats.hull  
            +'', //useless piece of line segment to hold that comma
            offset, offset);

        ig.game.font.draw(ig.game.outputMsg,
            ig.system.width/2,
            16,
            ig.Font.ALIGN.CENTER );

        

        this.parent();

        // switch(ig.game.playmode)
        // {
        //     case "timeattack":
        //         ig.game.font.draw( 'Score: '+ig.game.stats.time, 7, 5);
        //         ig.game.font.draw('Collected: '+ig.game.stats.time+"/"+ig.game.stats.time, 167, 5);
        //         var CurrentTimeValue = new Date(Math.round(ig.game.getEntitiesByType(EntityLevelstats)[0].currentTime*1000));
        //         ig.game.font.draw('Time: '+CurrentTimeValue.getMinutes()+'\''+CurrentTimeValue.getSeconds()+'\''+Math.round((CurrentTimeValue.getMilliseconds()/10)),7,220);
        //         break;
        //     case "story":
        //         ig.game.font.draw( 'Score: '+ig.game.score, 7, 5);
        //         ig.game.font.draw('Collected: '+ig.game.drops+"/"+ig.game.tdrops, 167, 5);
        //         var CurrentTimeValue = new Date(Math.round(ig.game.getEntitiesByType(EntityLevelstats)[0].currentTime*1000));
        //         break;
        // }
    }
});
});