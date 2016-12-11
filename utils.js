var Engine = {
   degree: function(pos2, pos1, inRad) {
    var dy = pos2.x - pos1.x;
    var dx = pos2.y - pos1.y;
    var theta = Math.atan2(dy,dx);
    return theta *= inRad ? 1 : (180/Math.PI);
  },
  getRotation: function(playerPos,mousePos){
    var pos1 = {
      x: mousePos.x,
      y: mousePos.y
    }


      return -Engine.degree(pos1, playerPos,false);
    },
    sortArray: function(a,b){
      if(a.health/a.maxHealth>b.health/b.maxHealth){
        return 1
      if(a.health/a.maxHealth<b.health/b.maxHealth)
        return -1
      return 0;
      }
    },
    getSpawn: function(viewport){
      return({x:15,y:viewport.height/2})

    },
    moveTo: function(obj,speed){
      var tmpDir = Engine.degree({x:obj.targetPos.x,y:obj.targetPos.y}, {x:obj.x+obj.w/2,y:obj.y+obj.w/2},true);
      var tmpX = Math.cos(tmpDir-Math.PI/2)
      var tmpY = Math.sin(tmpDir+Math.PI/2)
      obj.x += tmpX*speed;
      obj.y += tmpY*speed;

    },
    collide: function(obj, hitData){

      if(hitData[0].obj.team !== obj.team&&obj.type !== 'fighter'){
        if(!obj.shielded){
          obj.health-=hitData[0].obj.damage;
          obj.healthBar.subtract(hitData[0].obj.damage,obj.maxHealth);
        }
        hitData[0].obj.destroy();

        if(obj.health<0||obj.health==0){
          this.death(obj);
        }
      }

    },
    death: function(obj){
      if(obj.team=='hero'){
        gold+=obj.value;
      }
      if(obj.team === "hero"){
        var tmpIndx = heroes.indexOf(obj);
        if(tmpIndx>-1)
          heroes.splice(tmpIndx,1)

      }
      else{
        var tmpIndx = monsters.indexOf(obj)
        if(tmpIndx>-1)
          monsters.splice(monsters.indexOf(obj),1)

      }
      obj.healthBar.destroy();
      if(obj.shield)
        obj.shield.destroy();
      obj.destroy();
      enemyCount--;
    },
    collideShield: function(hitData,obj,mod){
      if(obj.team !== hitData[0].obj.team){
        var rot = obj.rotation;
        var eRot = hitData[0].obj.rotation;
        var diff = Math.abs(eRot-rot)
        if(Crafty.math.withinRange(diff,130,230)){
          var damage = hitData[0].obj.damage*0.25*mod;
          console.log(mod)
        }
        else{
          console.log(diff)
          var damage = hitData[0].obj.damage;
        }
        if(!obj.shielded){
          obj.health -=damage;
          obj.healthBar.subtract(damage,obj.maxHealth);
        }
        hitData[0].obj.destroy();
        if(obj.health<=0) this.death(obj)
      }
    },
    abilities:{
      "shield": function(obj,cost){
        if(obj.team!=='hero'){
        if(!obj.shielded){
          gold-=cost;
          console.log('shielded')
          obj.shielded = true;
          var shield = Crafty.e('Circle').attr({x:obj.x,y:obj.y,w:obj.w+1,h:obj.w+1})
          shield.obj = obj;
          obj.shield = shield;
          Crafty.e('Delay').delay(function(){
            obj.shielded = false;
            shield.destroy();

          },1000)
        }
      }
      },
      'heal': function(obj,cost){
        if(obj.team!=='hero'){
        obj.health+=60;
        gold-=cost;
        if(obj.health>obj.maxHealth){
          obj.health = obj.maxHealth
        }
        obj.healthBar.subtract(-60,obj.maxHealth);
      }
      },
      'smite': function(obj,cost){
        if(obj.team == 'hero'){
        obj.health-=50;
        gold-=cost;
        obj.healthBar.subtract(50,obj.maxHealth)
        if(obj.health<=0){
          Engine.death(obj);
        }
      }

      }
    }



  }

  Crafty.c("Circle", {
    init: function(){
      this.requires("2D,Canvas,Motion");
      this.bind("Draw", this.drawMe);
      this.ready = true;
    },
    drawMe: function(e){
      var ctx = e.ctx;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0038ff";
      ctx.beginPath();
      ctx.arc(this.w/2+this.x,this.h/2+this.y,this.w,0, Math.PI*2)
      ctx.stroke();
    },
    events:{
      'EnterFrame':function(){
        if(!this.obj)
          this.destroy();
        this.x = this.obj.x;
        this.y =this.obj.y;
      }
    }

  })

  Crafty.c("Countdown",{
    required: '2D,DOM,Text,Color',
    init:function(){
      this.x = Crafty.viewport.width/2-100
      this.y = Crafty.viewport.height-35;
      this.w = 200;
      this.value = countTime;
      this.text(this.value);
      this.textColor('rgb(0, 0, 0)');
      this.textFont({
        size: '30px',
        type: 'bold',
        family: 'Arial'
      })
    },
    tick: function(){
      if(this.value>0){
        var obj=this;
        Crafty.e('Delay').delay(function(){
          obj.value--;
          obj.tick();
        },1000)
      }
      else{
        this.value = "Wave: "+wave;

      }
    },
    reset: function(){
      this.value = countTime;
      this.tick();
    },
    events:{
      "EnterFrame":function(){
        this.text(this.value)
      }
    }
  })
