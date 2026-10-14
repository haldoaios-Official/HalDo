/* HalDo OS — Beep-System + Notifications */
var Beep={
  ctx:null,
  init:function(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}},
  play:function(freq,dur,vol){
    this.init();if(!this.ctx)return;
    try{var o=this.ctx.createOscillator();var g=this.ctx.createGain();
      o.frequency.value=freq;o.type="sine";g.gain.value=vol||0.15;
      o.connect(g);g.connect(this.ctx.destination);o.start();
      g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+(dur||0.2));
      o.stop(this.ctx.currentTime+(dur||0.2)+0.05);
    }catch(e){}
  },
  blitzer:function(){this.play(1400,0.12,0.25);setTimeout(function(){Beep.play(1400,0.12,0.25);},180);},
  stau:function(){this.play(500,0.4,0.2);},
  unfall:function(){this.play(800,0.2,0.25);setTimeout(function(){Beep.play(600,0.25,0.25);},250);},
  baustelle:function(){this.play(1000,0.1,0.15);setTimeout(function(){Beep.play(1000,0.1,0.15);},150);setTimeout(function(){Beep.play(1000,0.1,0.15);},300);},
  sperrung:function(){this.play(400,0.5,0.25);},
  warnung:function(){this.play(1200,0.3,0.2);}
};

var Notify={
  request:function(){
    if(!("Notification" in window))return Promise.reject(new Error("Nicht unterstützt"));
    if(Notification.permission==="granted")return Promise.resolve();
    return Notification.requestPermission();
  },
  show:function(title,body,opts){
    if(Notification.permission!=="granted")return;
    try{
      var n=new Notification(title,{
        body:body||"",
        icon:(opts&&opts.icon)||"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='78' font-size='82'%3E🦚%3C/text%3E%3C/svg%3E",
        tag:(opts&&opts.tag)||"haldo-alert",
        silent:true,
        vibrate:opts&&opts.vibrate||[200,100,200]
      });
      setTimeout(function(){try{n.close();}catch(e){}},8000);
    }catch(e){}
  }
};
