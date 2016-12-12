Crafty.c("AI", {
  required: "2D, DOM, Collision, Tween, Color, Motion,Mouse, AngularMotion, Image",
  fireDelay: 1,
  los: 600,
  start: 0,
  type: 0,
  diffMod: 1,
  shielded: false,
  init: function(team,type){
    this.init = true;
    this.w = 30;
    this.h = 30;
    this.origin("center")
    this.healthBar = Crafty.e('Status').attr({x:this.x,y:this.y+30})
    this.onHit("Arrow",function(hitData){
      Engine.collide(this,hitData)
    })
    this.onHit("Attack",function(hitData){
      Engine.collide(this,hitData)
    })
    this.bind('MouseDown',function(e){
      if(e.mouseButton === Crafty.mouseButtons.LEFT){
        if(heroes.length>0){
          if(abilities[placeIndex].value<gold){
            var cost =abilities[placeIndex].value;
            Engine.abilities[abilities[placeIndex].name](this,cost);
          }

        }
      }
      if(e.mouseButton === Crafty.mouseButtons.RIGHT){
        if(this.team == 'monster'){
          Engine.death(this)
          gold+=this.value*1.5
        }
      }
    })
    this.hitDelay = 10;
  },

  generic: function(){
    if(this.init){
      this.id = 1;

      this.spawn={x:this.x,y:this.y}
    }

      this.currPos = {
        x:this.x,
        y:this.y
      }
      var enemies;
      if(this.team == 'hero'){
        if(monsters.length)
          enemies = monsters;
        else {
          enemies = [door]
        }
      }
      else{
          enemies = heroes



      }
      this.dist = 0
      this.targeting = false;
      for(var i=0;i<enemies.length;i++){
        var enemy = enemies[i];
        if(enemy){
          var dist = Crafty.math.distance(this.currPos.x, this.currPos.y,enemy.x,enemy.y)

          if(dist<this.dist||!this.dist){
            this.dist = dist
            this.targetPos = {
              x:enemy.x,
              y:enemy.y
            }
            if(this.dist<this.los)
            this.rotation = Engine.getRotation(this.currPos,this.targetPos);
            this.targeting = true;
          }
        }

    }
  },
  "ranger": function(){
    if(this.init){
      this.range = 400
      this.maxHealth = Math.round(100*this.diffMod);
      this.health = this.maxHealth;
      this.image('ranger2.png')
      this.init = false;
      this.damage = 20*this.diffMod
      this.speed =1;
      this.value=10*this.diffMod
    }
    if(this.dist){

      if(this.dist<this.range+1 && this.targeting && this.fireDelay <0){
        this.cancelTween;
        var arrowX = this.x+this.w/2;
        var arrowY = this.y+this.h/2;
        var arrow = Crafty.e("2D,Color,Collision,Arrow,DOM,Image")
        .attr({
            x:arrowX,
            y:arrowY,
            w:5,
            h:30,
            rotation: this._rotation,
            xspeed: 7 * Math.sin(this._rotation/57.3),
            yspeed: 7 * Math.cos(this._rotation/57.3)

          })
        .color("#533108")
        arrow.team = this.team;
        arrow.damage = this.damage
        arrow.image('arrow.png')
        var spread= Crafty.math.randomNumber(-0.5,0.5)
        arrow.bind("EnterFrame",function(){
          this.x-= this.xspeed+spread
          this.y+=this.yspeed+spread
        })
        Crafty.e("Delay").delay(function() {
          arrow.destroy();

        }, 2000);
        this.fireDelay = 35

      }
      else if(this.dist>this.range&&this.dist<this.los){
        Engine.moveTo(this,this.speed);

      }

      this.fireDelay--;

    }
    if(this.targetPos && this.team == 'hero'){
      this.dist = Crafty.math.distance(this.currPos.x, this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range){
        Engine.moveTo(this,this.speed/2)
      }
    }
    if(this.team == 'monster'&&heroes.length==0&&this.currPos!==this.spawn){
      this.targetPos = this.spawn;
      this.dist = Crafty.math.distance(this.currPos.x,this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>30)
        Engine.moveTo(this,this.speed);
        this.rotation = 0;
    }

  },
  "fighter": function(){
    if(this.init){
      this.i=2;
      this.maxHealth = 100*this.diffMod
      this.health = this.maxHealth;
      this.image('fighter2.png')
      this.range = 50;
      this.damage = 20*this.diffMod
      this.init = false
      this.speed =1.5;
      this.value=10*this.diffMod;
      this.onHit("Arrow",function(hitData){
        Engine.collideShield(hitData,this,1);
      })
      this.onHit("Attack",function(hitData){
        Engine.collideShield(hitData,this,2.5);
      })
    }
    if(this.dist){
      if(this.dist<=this.range && this.targeting && this.fireDelay < 0){
        this.fireDelay += 100;
        var x=this.targetPos.x;
        var y=this.targetPos.y;
        var scale = 50;
        var offset = 20;
        var tmpDir = Engine.degree({x:x,y:y}, {x:this.x+this.w/2,y:this.y+this.w/2},true);
        var tmpX = (this.x+this.w/2) + ((this.w/2+scale/2-offset) *  Math.cos(tmpDir-Math.PI/2));
        var tmpY = this.y+this.w/2 + ((this.w/2+scale/2-offset) * Math.sin(tmpDir+Math.PI/2));
        var atkHitBox = Crafty.e("2D,Collision,Attack,Delay")
          .attr({x:tmpX-scale/2,y:tmpY-scale/2,w:scale,h:scale})
          .origin("center")
          atkHitBox.team = this.team
          atkHitBox.damage = this.damage
          atkHitBox.rotation = this.rotation
          this.attach(atkHitBox)
          Crafty.e("Delay").delay(function() {
            atkHitBox.destroy();
          }, 200);
      }
      else if(this.dist>this.range&&this.dist<this.los){
        Engine.moveTo(this,this.speed)

      }

        this.fireDelay--;

    }
    if(this.targetPos&&this.team=='hero'){
      this.dist = Crafty.math.distance(this.currPos.x, this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed)
    }
    if(this.team == 'monster'&&heroes.length==0&&this.currPos!==this.spawn){
      this.targetPos = this.spawn;
      this.dist = Crafty.math.distance(this.currPos.x,this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed);
        this.rotation = 0;
    }




  },
  "barbarian": function(){
    if(this.init){
      this.i=2;
      this.maxHealth = 250*this.diffMod;
      this.health = this.maxHealth;
      this.image('barbarian2.png')
      this.range = 50;
      this.damage = 40*this.diffMod
      this.init = false
      this.speed =2.5;
      this.value=20*this.diffMod;
    }
    if(heroes.length>0){
      this.health-=0.1
      this.healthBar.subtract(0.1,this.maxHealth)
      if(this.health<=0)
        Engine.death(this)
    }
    if(this.dist){
      if(this.dist<this.range && this.targeting && this.fireDelay < 0){
        this.fireDelay += 75;
        var x=this.targetPos.x;
        var y=this.targetPos.y;
        var scale = 50;
        var offset = 20;
        var tmpDir = Engine.degree({x:x,y:y}, {x:this.x+this.w/2,y:this.y+this.w/2},true);
        var tmpX = (this.x+this.w/2) + ((this.w/2+scale/2-offset) *  Math.cos(tmpDir-Math.PI/2));
        var tmpY = this.y+this.w/2 + ((this.w/2+scale/2-offset) * Math.sin(tmpDir+Math.PI/2));
        var atkHitBox = Crafty.e("2D,Collision,Attack,Delay")
          .attr({x:tmpX-scale/2,y:tmpY-scale/2,w:scale,h:scale})
          .origin("center")
          atkHitBox.team = this.team
          atkHitBox.damage = this.damage
          atkHitBox.rotation = this.rotation
          this.attach(atkHitBox)
          Crafty.e("Delay").delay(function() {
            atkHitBox.destroy();
          }, 200);
      }
      else if(this.dist>this.range&&this.dist<this.los){
        Engine.moveTo(this,this.speed)

      }

        this.fireDelay--;

    }
    if(this.targetPos && this.team == 'hero'){
      this.dist = Crafty.math.distance(this.currPos.x, this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed)
    }
    if(this.team == 'monster'&&heroes.length==0&&this.currPos!==this.spawn){
      this.targetPos = this.spawn;
      this.dist = Crafty.math.distance(this.currPos.x,this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed);
        this.rotation = 0;
    }
  },
  'cleric': function(){
    if(this.init){
      this.range = 400
      this.maxHealth = parseInt(100*this.diffMod);
      this.health = this.maxHealth;

      this.init = false;
      this.damage = 20*this.diffMod
      this.speed =1;
      this.value=10*this.diffMod
      this.healDelay = 50;
      this.image('cleric2.png')

    }
    if(this.team == 'hero'){
      this.allies = heroes;
    }
    else{
      this.allies = monsters;
    }
    if(this.healDelay<=0&&this.allies.length){
      this.allies.sort(Engine.sortArray);
      var lowestAlly = this.allies[0];
      if(lowestAlly.health/lowestAlly.maxHealth<0.75){
        Engine.abilities['heal'](lowestAlly,0)
        this.healDelay = 100;
      }
      // else if(this.enemies.length===0){
      //   Engine.abilities['heal'](lowestAlly,0)
      //   this.healDelay = 100;
      // }

    }
    this.healDelay--;

    if(this.team == 'monster'&&heroes.length==0&&this.currPos!==this.spawn){
      this.targetPos = this.spawn;
      this.dist = Crafty.math.distance(this.currPos.x,this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>30)
        Engine.moveTo(this,this.speed);
        this.rotation = 0;
      }
  },
  'peasant': function(){
    if(this.init){
      this.i=2;
      this.maxHealth = 21*this.diffMod
      this.health = this.maxHealth;
      this.image('peasant2.png')
      this.range = 50;
      this.damage = 5*this.diffMod
      this.init = false
      this.speed =0.7;
      this.value=1*this.diffMod;
      this.onHit("Arrow",function(hitData){
        Engine.collideShield(hitData,this,1);
      })
      this.onHit("Attack",function(hitData){
        Engine.collideShield(hitData,this,2.5);
      })
    }
    if(this.dist){
      if(this.dist<this.range+10 && this.targeting && this.fireDelay < 0){
        this.fireDelay += 100;
        var x=this.targetPos.x;
        var y=this.targetPos.y;
        var scale = 50;
        var offset = 20;
        var tmpDir = Engine.degree({x:x,y:y}, {x:this.x+this.w/2,y:this.y+this.w/2},true);
        var tmpX = (this.x+this.w/2) + ((this.w/2+scale/2-offset) *  Math.cos(tmpDir-Math.PI/2));
        var tmpY = this.y+this.w/2 + ((this.w/2+scale/2-offset) * Math.sin(tmpDir+Math.PI/2));
        var atkHitBox = Crafty.e("2D,Collision,Attack,Delay")
          .attr({x:tmpX-scale/2,y:tmpY-scale/2,w:scale,h:scale})
          .origin("center")
          atkHitBox.team = this.team
          atkHitBox.damage = this.damage
          atkHitBox.rotation = this.rotation
          this.attach(atkHitBox)
          Crafty.e("Delay").delay(function() {
            atkHitBox.destroy();
          }, 200);
      }
      else if(this.dist>this.range&&this.dist<this.los){
        Engine.moveTo(this,this.speed)

      }

        this.fireDelay--;

    }
    if(this.targetPos&&this.team=='hero'){
      this.dist = Crafty.math.distance(this.currPos.x, this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed)
    }
    if(this.team == 'monster'&&heroes.length==0&&this.currPos!==this.spawn){
      this.targetPos = this.spawn;
      this.dist = Crafty.math.distance(this.currPos.x,this.currPos.y,this.targetPos.x,this.targetPos.y)
      if(this.dist>this.range)
        Engine.moveTo(this,this.speed);
        this.rotation = 0;
    }
  },
  events: {
    "EnterFrame": function(){
      this.generic();
      this[this.type]();
      this.healthBar.x = this.x;
      this.healthBar.y = this.y+40
    }
  }
})

Crafty.c('Status',{
  init: function(){
    this.requires('2D, DOM, Color, Text, Tween');
    this.w = 30;
    this.h = 3;
    this.maxWidth = 30;
    this.status=100;
    this.color("#ff0000");

  },
  subtract: function(num,obj){
    var fraction = (num/obj)*this.maxWidth;
    this.w -=fraction;
    if(this.w<0){
      this.w=0
    }
    if(this.w>this.maxWidth){
      this.w = this.maxWidth
    }

  },
  events: {
    "EnterFrame": function(){
    }
  }

})
Crafty.c('Gold',{

  init: function(){
    this.requires("2D, DOM, Text, Color")
    this.x = Crafty.viewport.width-75
    this.y = 30
    this.w = 200
    this.gold = 0
    this.goldText = "Gold - "+this.gold
    this.text(this.goldText)
    this.textColor('#bea107')
    this.textFont({
      size: '20px',
      type: 'bold',
      family: 'Arial'
    })
  },
  events: {
    'EnterFrame':function(){
      this.goldText = this.gold+'GP';
      this.text(this.goldText);
    }
  }
})
Crafty.c('Selected',{
  required: '2D, DOM, Text, Color',
  init:function(){
    this.x = Crafty.viewport.width-200
    this.y = Crafty.viewport.height-35
    this.w = 200;
    this.text('fighter')
    this.textColor('#fffc00');
    this.textFont({
      size: '20px',
      type: 'bold',
      family: 'Arial'
    })
  },
  events:{
    "EnterFrame":function(){
      if(heroes.length>0)
        this.text('['+abilities[placeIndex].name.toUpperCase()+"- "+abilities[placeIndex].value+']')
      if(heroes.length===0)
        this.text('['+store[placeIndex].name.toUpperCase()+"- "+store[placeIndex].value+']')
    }
  }
})
