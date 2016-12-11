var monsters = [];
var heroes = [];
var gold = 140;
var door;
var wave = 0;
var waiting = true;
var goldCount;
var clock;
var enemyCount=0;
var store = [
  {
    value: 20,
    name: 'fighter'
  },
  {
    value:20,
    name: 'ranger'
  },
  {
    value: 40,
    name: 'barbarian'
  },
  {
    value: 30,
    name: 'cleric'
  },
  {
    value: 1,
    name: 'peasant'
  }
]
var abilities = [
  {
    value: 5,
    name: 'shield'
  },
  {
    value: 10,
    name: 'heal'
  },
  {
    value:20,
    name: 'smite'
  }
]
var placeIndex = 0;
var countTime = 25
var assetsObj = {
  "images":['cleric.png','fighter.png','ranger.png','barbarian.png']

  }

$(document).ready(function(){
  Crafty.init(window.innerWidth-25,window.innerHeight-25);
  var types = ['peasant','cleric','fighter','ranger','barbarian']


  var initParty = function(){
    var offset = -120
    var diffMod = Math.log10(wave);
    console.log(diffMod)
    for(var i=0;i<4;i++){
      enemyCount++
      var hero = Crafty.e('AI')
      .attr({x:15,y:Crafty.viewport.height/2+offset})
      hero.type = types[Crafty.math.randomInt(0,types.length-1)]
      if(hero.type == 'peasant'){
        offset+=45
        var peasant = Crafty.e('AI')
        .attr({x:50,y:Crafty.viewport.height/2+offset})
        peasant.type = 'peasant'
        peasant.team = 'hero'
        peasant.diffMod = diffMod
        heroes.push(peasant)

      }
      hero.team = 'hero';
      hero.diffMod = diffMod;
      offset+=45
      heroes.push(hero)
    }
    wave+=1;
    placeIndex = 0;
    waiting = true;
  }


  Crafty.scene("main",function(){
    clock = Crafty.e("Countdown");
    Crafty.background('#2e2e2e');
    Crafty.bind('KeyDown',function(e){
      if(e.key == Crafty.keys.R){
        monsters.length = 0;
        heroes.length = 0;
        gold = 140;
        wave = 0;
        waiting = true;
        enemyCount=0;
        placeIndex = 0;
        countTime=25;
        Crafty.scene('main')
        if(Crafty.isPaused())
          Crafty.pause();

      }
    })
    var screen = Crafty.e("2D, Mouse, DOM")
    .attr({w:window.innerWidth-25,h:window.innerHeight-25,x:0,y:0})
    .bind('MouseDown',function(e){
      if(e.mouseButton === Crafty.mouseButtons.LEFT){
        if(!heroes.length){
          if(store[placeIndex].value<=gold){
            var monster =Crafty.e("AI")
            monster.x = Crafty.mousePos.x;
            monster.y = Crafty.mousePos.y;
            monster.spawn = {
              x:monster.x,
              y:monster.y
            }
            monster.type = store[placeIndex].name;
            monster.team = 'monster'

            gold-=store[placeIndex].value;
            monsters.push(monster)
          }
        }


      }
      // if(e.mouseButton == Crafty.mouseButtons.RIGHT){
      //
      //   var enemy =Crafty.e("AI")
      //   enemy.x = Crafty.mousePos.x;
      //   enemy.y = Crafty.mousePos.y
      //   enemy.type = store[placeIndex].name;
      //   enemy.team = 'hero'
      //     placeIndex = 0;
      //   heroes.push(enemy)
      // }

    })
    .bind('MouseWheelScroll',function(evt){
      placeIndex-= evt.direction;

      if(placeIndex<0)
        placeIndex = 0;
      if(placeIndex>store.length-1 && heroes.length===0)
        placeIndex = store.length-1
      else if(placeIndex>abilities.length-1&&heroes.length>0)
        placeIndex = abilities.length-1

    })
    .bind("EnterFrame",function(){
      gold = parseInt(gold)
      goldCount.gold = gold;

      if(!heroes.length && waiting){
        waiting = false;
        clock.value=countTime;
        clock.tick();
        Crafty.e("Delay").delay(function(){
          initParty();

        },countTime*1000)}

  })
  goldCount = Crafty.e('Gold')
  var selected = Crafty.e('Selected')


  goldCount.gold = gold;
  door = Crafty.e("2D,DOM,Color,Collision").attr({x:Crafty.viewport.width-15,y:Crafty.viewport.height/2-50,w:30,h:100})
  .color('blue')
  door.health=500
  door.healthBar = Crafty.e('Status').attr({x:Crafty.viewport.width/2-150,y:15,w:300,h:20})
  door.healthBar.maxWidth = 300;
  door.checkHits('Arrow,Attack')
  door.bind('HitOn', function(hitData){
    for(var i=0;i<hitData.length;i++){
      this.health -= hitData[i].obj.damage;
      this.healthBar.subtract(hitData[i].obj.damage,500)
      hitData[i].obj.destroy();
      if(this.health<=0){
        door.destroy()
        var gameOver = Crafty.e('2D,DOM,Text')
        .attr({x:Crafty.viewport.width/2-200,y:Crafty.viewport.height/2-20,w:600})
        .text("Game Over. <br/>Press 'r' to restart")
        .textColor('red')
        .textFont({
          size: '36px',
          type: 'bold',
          family: 'Arial'
        })



        Crafty.pause();

      }
    }
  })
  })
  Crafty.load(assetsObj,function(){Crafty.scene('main')});
})
