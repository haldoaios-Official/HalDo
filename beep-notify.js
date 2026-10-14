/* HalDo OS — Beep + Notifications */
var Beep={
  ctx:null,
  init:function(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}},
  play:function(freq,dur,vol){this.init();if(!this.ctx)return;try{var o=this.ctx.createOscillator();var g=this.ctx.createGain();o.frequency.value=freq;o.type="sine";g.gain.value=vol||0.15;o.connect(g);g.connect(this.ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+(dur||0.2));o.stop(this.ctx.currentTime+(dur||0.2)+0.05);}catch(e){}},
  blitzer:function(){this.play(1400,0.12,0.25);var s=this;setTimeout(function(){s.play(1400,0.12,0.25);},180);},
  stau:function(){this.play(500,0.4,0.2);},
  unfall:function(){this.play(800,0.2,0.25);var s=this;setTimeout(function(){s.play(600,0.25,0.25);},250);},
  baustelle:function(){this.play(1000,0.1,0.15);var s=this;setTimeout(function(){s.play(1000,0.1,0.15);},150);setTimeout(function(){s.play(1000,0.1,0.15);},300);},
  sperrung:function(){this.play(400,0.5,0.25);},
  warnung:function(){this.play(1200,0.3,0.2);}
};
var Notify={
  request:function(){if(!("Notification" in window))return Promise.reject(new Error("Nicht unterstützt"));if(Notification.permission==="granted")return Promise.resolve("granted");return Notification.requestPermission();},
  show:function(title,body,opts){if(!("Notification" in window)||Notification.permission!=="granted")return;try{var n=new Notification(title,{body:body||"",icon:"logo.png",tag:(opts&&opts.tag)||"haldo-alert",silent:true});setTimeout(function(){try{n.close();}catch(e){}},8000);}catch(e){}}
};
