/* HalDo Music Studio Pro Max — native module for the HalDo v166 shell.
   Uses the existing HalDo.Win and HalDo.Store contracts; no legacy Runtime dependency. */
(function(){
  'use strict';
  var H=window.HalDo;
  if(!H||!H.Win||!H.Store||H.MusicStudio)return;

  var STORE_KEY='music_studio_pro_v1';
  var TRACKS=[
    {id:'kick',name:'Kick',kind:'drum',color:'#ff647c',vol:.85,pan:0,inst:'kick'},
    {id:'snare',name:'Snare',kind:'drum',color:'#ffbd59',vol:.65,pan:0,inst:'snare'},
    {id:'hat',name:'Hi-Hat',kind:'drum',color:'#53d7ed',vol:.42,pan:0,inst:'hat'},
    {id:'bass',name:'Bass',kind:'synth',color:'#9c8cff',vol:.65,pan:0,inst:'bass'},
    {id:'chords',name:'Chords',kind:'synth',color:'#5bd6a4',vol:.4,pan:-.15,inst:'piano'},
    {id:'lead',name:'Lead',kind:'synth',color:'#ff8bd1',vol:.55,pan:.15,inst:'saz'},
    {id:'vocal',name:'Vocal Synth',kind:'synth',color:'#f5a66b',vol:.35,pan:0,inst:'vocal_a'}
  ];
  var SCALE=[57,60,62,64,67,69,72,74];
  var DEFAULTS={name:'Mein erstes Projekt',bpm:110,bars:4,master:0.8,reverb:0.18,delay:0.12,lyrics:'',tracks:{}};
  TRACKS.forEach(function(t){DEFAULTS.tracks[t.id]={grid:Array(16).fill(false),vol:t.vol,pan:t.pan,inst:t.inst,mute:false,solo:false};});
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function uid(){return 'hms-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
  function readProject(){
    var saved=H.Store.get(STORE_KEY,null), p=clone(DEFAULTS);
    if(saved&&typeof saved==='object'){
      Object.keys(saved).forEach(function(k){if(k!=='tracks')p[k]=saved[k];});
      TRACKS.forEach(function(t){
        var old=saved.tracks&&saved.tracks[t.id], base=p.tracks[t.id];
        if(old&&typeof old==='object'){
          base.vol=Number.isFinite(+old.vol)?Math.max(0,Math.min(1,+old.vol)):base.vol;
          base.pan=Number.isFinite(+old.pan)?Math.max(-1,Math.min(1,+old.pan)):base.pan;
          base.inst=typeof old.inst==='string'?old.inst:base.inst;
          base.mute=!!old.mute;base.solo=!!old.solo;
          if(Array.isArray(old.grid))base.grid=Array.from({length:16},function(_,i){return !!old.grid[i];});
        }
      });
    }
    p.bpm=Math.max(40,Math.min(240,Number(p.bpm)||110));
    p.bars=Math.max(1,Math.min(8,parseInt(p.bars,10)||4));
    p.master=Math.max(0,Math.min(1,Number(p.master)||0));
    p.reverb=Math.max(0,Math.min(1,Number(p.reverb)||0));
    p.delay=Math.max(0,Math.min(1,Number(p.delay)||0));
    return p;
  }
  function saveProject(p){H.Store.set(STORE_KEY,p);}
  function download(name,blob){var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
  function midi(n){return 440*Math.pow(2,(n-69)/12);}
  function noiseBuffer(ctx,duration){
    var len=Math.max(1,Math.floor(ctx.sampleRate*duration)),b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);
    for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    return b;
  }
  function makeEngine(ctx,state){
    var master=ctx.createGain(),analyser=ctx.createAnalyser(),revIn=ctx.createGain(),revWet=ctx.createGain(),delay=ctx.createDelay(1),feedback=ctx.createGain(),delayWet=ctx.createGain(),convolver=ctx.createConvolver(),buses={};
    analyser.fftSize=128;master.gain.value=state.master;
    var ir=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.25),ctx.sampleRate);
    for(var c=0;c<2;c++){var data=ir.getChannelData(c);for(var j=0;j<data.length;j++)data[j]=(Math.random()*2-1)*Math.pow(1-j/data.length,2.4);}
    convolver.buffer=ir;revIn.connect(convolver);convolver.connect(revWet);revWet.connect(master);
    delay.delayTime.value=.24;feedback.gain.value=.28;delay.connect(feedback);feedback.connect(delay);delay.connect(delayWet);delayWet.connect(master);
    master.connect(analyser);analyser.connect(ctx.destination);
    revWet.gain.value=state.reverb;delayWet.gain.value=state.delay;
    TRACKS.forEach(function(t){
      var gain=ctx.createGain(),pan=ctx.createStereoPanner(),sendR=ctx.createGain(),sendD=ctx.createGain(),s=state.tracks[t.id];
      gain.gain.value=s.mute?0:s.vol;pan.pan.value=s.pan;sendR.gain.value=state.reverb*.34;sendD.gain.value=state.delay*.34;
      gain.connect(pan);pan.connect(master);pan.connect(sendR);sendR.connect(revIn);pan.connect(sendD);sendD.connect(delay);
      buses[t.id]={gain:gain,pan:pan,sendR:sendR,sendD:sendD};
    });
    function update(){
      var solo=TRACKS.some(function(t){return state.tracks[t.id].solo;});
      TRACKS.forEach(function(t){var s=state.tracks[t.id],b=buses[t.id];b.gain.gain.setTargetAtTime((s.mute||(solo&&!s.solo))?0:s.vol,ctx.currentTime,.015);b.pan.pan.setTargetAtTime(s.pan,ctx.currentTime,.015);});
      master.gain.setTargetAtTime(state.master,ctx.currentTime,.02);revWet.gain.setTargetAtTime(state.reverb,ctx.currentTime,.02);delayWet.gain.setTargetAtTime(state.delay,ctx.currentTime,.02);
      TRACKS.forEach(function(t){buses[t.id].sendR.gain.setTargetAtTime(state.reverb*.34,ctx.currentTime,.02);buses[t.id].sendD.gain.setTargetAtTime(state.delay*.34,ctx.currentTime,.02);});
    }
    function note(trackId,freq,dur,when){
      var b=buses[trackId],inst=state.tracks[trackId].inst;
      if(!b)return;
      if(trackId==='kick'){
        var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,when);o.frequency.exponentialRampToValueAtTime(42,when+.12);g.gain.setValueAtTime(.95,when);g.gain.exponentialRampToValueAtTime(.001,when+.24);o.connect(g);g.connect(b.gain);o.start(when);o.stop(when+.25);return;
      }
      if(trackId==='snare'||trackId==='hat'){
        var duration=trackId==='snare'?.2:.055,src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),ng=ctx.createGain();
        src.buffer=noiseBuffer(ctx,duration);filter.type='highpass';filter.frequency.value=trackId==='snare'?1400:7200;
        ng.gain.setValueAtTime(trackId==='snare'?.62:.38,when);ng.gain.exponentialRampToValueAtTime(.001,when+duration);
        src.connect(filter);filter.connect(ng);ng.connect(b.gain);src.start(when);src.stop(when+duration);return;
      }
      var osc=ctx.createOscillator(),amp=ctx.createGain(),filter2=ctx.createBiquadFilter();
      var type=inst==='piano'?'triangle':inst==='duduk'?'sine':inst==='vocal_a'||inst==='vocal_o'?'sawtooth':inst==='keman'||inst==='saz'?'sawtooth':'triangle';
      osc.type=type;osc.frequency.setValueAtTime(freq,when);filter2.type='lowpass';filter2.frequency.value=inst==='piano'?5200:inst==='saz'?2400:inst==='vocal_a'?3000:inst==='vocal_o'?1800:3400;
      var peak=inst.indexOf('vocal_')===0?.34:.42,end=when+Math.max(.09,dur);
      amp.gain.setValueAtTime(.001,when);amp.gain.linearRampToValueAtTime(peak,when+.025);amp.gain.setTargetAtTime(.001,end-.035,.045);
      osc.connect(filter2);filter2.connect(amp);amp.connect(b.gain);osc.start(when);osc.stop(end+.12);
    }
    return {context:ctx,buses:buses,analyser:analyser,update:update,note:note,close:function(){try{master.disconnect();}catch(e){}try{if(ctx.state!=='closed')ctx.close();}catch(e){}}};
  }
  function makeOffline(state){
    var O=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    if(!O)throw new Error('OfflineAudioContext wird von diesem Browser nicht unterstützt.');
    var step=60/state.bpm/4,total=step*16*state.bars,sr=44100,ctx=new O(2,Math.ceil((total+.5)*sr),sr),engine=makeEngine(ctx,state);
    var solo=TRACKS.some(function(t){return state.tracks[t.id].solo;});
    for(var bar=0;bar<state.bars;bar++)for(var i=0;i<16;i++){
      var at=(bar*16+i)*step;
      TRACKS.forEach(function(t){
        var s=state.tracks[t.id];if(!s.grid[i]||s.mute||(solo&&!s.solo))return;
        if(t.id==='bass')engine.note(t.id,midi(45),step*1.8,at);
        else if(t.id==='chords')[57,60,64].forEach(function(n){engine.note(t.id,midi(n),step*3.5,at);});
        else if(t.id==='lead')engine.note(t.id,midi(SCALE[i%SCALE.length]),step*1.8,at);
        else if(t.id==='vocal')engine.note(t.id,midi(SCALE[(i+2)%SCALE.length]+12),step*1.35,at);
        else engine.note(t.id,0,step,at);
      });
    }
    return ctx.startRendering().then(function(buffer){return wavBlob(buffer);});
  }
  function wavBlob(buffer){
    var channels=buffer.numberOfChannels,len=buffer.length,sr=buffer.sampleRate,bytes=len*channels*2,ab=new ArrayBuffer(44+bytes),v=new DataView(ab);
    function str(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}
    str(0,'RIFF');v.setUint32(4,36+bytes,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sr,true);v.setUint32(28,sr*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,bytes,true);
    var data=[];for(var c=0;c<channels;c++)data.push(buffer.getChannelData(c));
    var offset=44;for(var i=0;i<len;i++)for(var ch=0;ch<channels;ch++){var x=Math.max(-1,Math.min(1,data[ch][i]));v.setInt16(offset,x<0?x*32768:x*32767,true);offset+=2;}
    return new Blob([ab],{type:'audio/wav'});
  }

  H.MusicStudio={open:function(){
    var state=readProject(),winId=uid(),rootId=uid(),audio=null,playing=false,timer=null,raf=null,observer=null,nextTime=0,stepIndex=0,closed=false;
    var shell='<div id="'+rootId+'" style="height:100%;overflow:auto;padding:14px;box-sizing:border-box;color:var(--text,#eef5ff)"></div>';
    winId=H.Win.open('🎼 HalDo Music Studio Pro Max',shell,{w:940,h:760});
    function stop(){
      playing=false;if(timer){clearInterval(timer);timer=null;}if(raf){cancelAnimationFrame(raf);raf=null;}
      if(audio){audio.close();audio=null;}
      var b=document.getElementById(rootId);if(b){var p=b.querySelector('#hms-play');if(p)p.textContent='▶ Wiedergabe';var st=b.querySelector('#hms-status');if(st)st.textContent='Gestoppt';}
    }
    function cleanup(){if(closed)return;closed=true;stop();if(observer)observer.disconnect();}
    function render(){
      var root=document.getElementById(rootId);if(!root||closed)return;
      var tracksHtml=TRACKS.map(function(t){
        var s=state.tracks[t.id],cells=s.grid.map(function(on,i){return '<button type="button" data-step="'+i+'" data-track="'+t.id+'" aria-label="'+esc(t.name)+' Schritt '+(i+1)+'" style="height:25px;min-width:0;padding:0;border:1px solid '+(on?t.color:'rgba(255,255,255,.12)')+';border-radius:5px;background:'+(on?t.color+'55':'rgba(0,0,0,.24)')+';cursor:pointer"></button>';}).join('');
        var inst=t.kind==='synth'?'<select data-inst="'+t.id+'" aria-label="Instrument '+esc(t.name)+'"><option value="bass" '+(s.inst==='bass'?'selected':'')+'>Bass</option><option value="piano" '+(s.inst==='piano'?'selected':'')+'>Klavier</option><option value="saz" '+(s.inst==='saz'?'selected':'')+'>Saz</option><option value="duduk" '+(s.inst==='duduk'?'selected':'')+'>Duduk</option><option value="keman" '+(s.inst==='keman'?'selected':'')+'>Keman</option><option value="vocal_a" '+(s.inst==='vocal_a'?'selected':'')+'>Vocal A</option><option value="vocal_o" '+(s.inst==='vocal_o'?'selected':'')+'>Vocal O</option></select>':'<span class="muted">Drum</span>';
        return '<div class="track"><div class="trackhead"><b style="color:'+t.color+'">'+esc(t.name)+'</b>'+inst+'<button type="button" data-mute="'+t.id+'" class="'+(s.mute?'active':'')+'">M</button><button type="button" data-solo="'+t.id+'" class="'+(s.solo?'active':'')+'">S</button></div><div class="steps">'+cells+'</div><div class="controls"><label>Level <input type="range" min="0" max="100" value="'+Math.round(s.vol*100)+'" data-vol="'+t.id+'"></label><label>Pan <input type="range" min="-100" max="100" value="'+Math.round(s.pan*100)+'" data-pan="'+t.id+'"></label></div></div>';
      }).join('');
      root.innerHTML='<style>.hms{font:13px/1.45 system-ui,sans-serif}.hms *{box-sizing:border-box}.hms .hero{padding:16px;border:1px solid rgba(0,229,255,.25);border-radius:16px;background:linear-gradient(120deg,rgba(0,150,210,.16),rgba(130,75,210,.18));margin-bottom:12px}.hms .muted{opacity:.68;font-size:11px}.hms .card{padding:12px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:13px;background:rgba(255,255,255,.035);margin:9px 0}.hms .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.hms .row>*{flex:1;min-width:90px}.hms button,.hms input,.hms select,.hms textarea{font:inherit}.hms button{padding:8px 11px;border:1px solid rgba(0,229,255,.3);border-radius:9px;background:rgba(0,130,180,.14);color:inherit;cursor:pointer}.hms button.primary{background:linear-gradient(120deg,#087fae,#6546b8);border:0}.hms button.active{background:rgba(0,229,255,.25);border-color:#00e5ff}.hms input[type=number],.hms select,.hms textarea{padding:8px;border:1px solid var(--border,rgba(255,255,255,.18));border-radius:8px;background:#102033;color:inherit}.hms input[type=range]{width:100%;accent-color:#00e5ff}.hms .track{padding:9px;margin:8px 0;border:1px solid rgba(255,255,255,.1);border-radius:11px;background:rgba(0,0,0,.12)}.hms .trackhead{display:flex;gap:6px;align-items:center;margin-bottom:8px}.hms .trackhead b{min-width:78px}.hms .trackhead select{flex:1;min-width:80px}.hms .steps{display:grid;grid-template-columns:repeat(16,minmax(14px,1fr));gap:4px;overflow-x:auto}.hms .controls{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}.hms .controls label{font-size:10px;opacity:.8}.hms .meter{height:44px;width:100%;display:block;background:rgba(0,0,0,.25);border-radius:8px}.hms .muted{opacity:.7}@media(max-width:600px){.hms .trackhead b{min-width:62px}.hms .steps{gap:2px}.hms .steps button{height:22px!important}.hms .controls{gap:5px}}</style><div class="hms"><div class="hero"><div style="font-size:19px;font-weight:900">🎼 HalDo Music Studio Pro Max</div><div class="muted">Mehrspur-Step-Sequencer · Web Audio · Mixer · Master FX · WAV Export</div><div class="row" style="margin-top:10px"><label>Projektname<input id="hms-name" maxlength="70" value="'+esc(state.name)+'"></label><label>BPM<input id="hms-bpm" type="number" min="40" max="240" value="'+state.bpm+'"></label><label>Takte<input id="hms-bars" type="number" min="1" max="8" value="'+state.bars+'"></label></div><div class="row" style="margin-top:8px"><button id="hms-play" class="primary">▶ Wiedergabe</button><button id="hms-stop">■ Stop</button><button id="hms-save">💾 Speichern</button><button id="hms-clear">Leeren</button></div><div id="hms-status" class="muted" style="margin-top:7px">Bereit · Browser-Audio startet nach Klick auf Wiedergabe</div></div><div class="card"><div class="row"><b>🎚️ Master & Visualizer</b><span class="muted">Live-Ausgang</span></div><canvas id="hms-viz" class="meter" width="800" height="88"></canvas><div class="row"><label>Master <input type="range" id="hms-master" min="0" max="100" value="'+Math.round(state.master*100)+'"></label><label>Reverb <input type="range" id="hms-reverb" min="0" max="100" value="'+Math.round(state.reverb*100)+'"></label><label>Delay <input type="range" id="hms-delay" min="0" max="100" value="'+Math.round(state.delay*100)+'"></label></div></div><div class="card"><div class="row"><b>🎹 7-Spur Sequencer</b><span class="muted">16 Schritte · Muster wiederholt sich pro Takt</span></div>'+tracksHtml+'<div class="muted">M = Stumm · S = Solo · Regler wirken in Echtzeit. Die Wiedergabe benötigt eine Nutzeraktion, damit der Browser Audio freigibt.</div></div><div class="card"><b>📦 Projekt & Export</b><div class="row" style="margin-top:8px"><button id="hms-export" class="primary">⬇ WAV rendern</button><button id="hms-json-out">Projekt JSON exportieren</button><label style="flex:1">Projekt importieren<input id="hms-json-in" type="file" accept=".json,application/json"></label></div><div id="hms-export-status" class="muted" style="margin-top:7px">WAV-Export rendert alle aktiven Spuren, Takte, Panorama und Master-Effekte.</div></div><div class="card"><b>📝 Songnotizen</b><textarea id="hms-lyrics" rows="3" style="width:100%;margin-top:8px" placeholder="Songtext, Arrangement-Notizen oder Ideen">'+esc(state.lyrics)+'</textarea><div class="muted">Notizen werden mit dem Projekt gespeichert. Keine externe KI-Verbindung wird hier vorgetäuscht.</div></div></div>';
      bind(root);
      drawVisualizer(root);
    }
    function bind(root){
      root.querySelector('#hms-name').onchange=function(){state.name=this.value.slice(0,70);saveProject(state);};
      root.querySelector('#hms-bpm').onchange=function(){state.bpm=Math.max(40,Math.min(240,Number(this.value)||110));this.value=state.bpm;saveProject(state);};
      root.querySelector('#hms-bars').onchange=function(){state.bars=Math.max(1,Math.min(8,parseInt(this.value,10)||4));this.value=state.bars;saveProject(state);};
      root.querySelector('#hms-play').onclick=start;
      root.querySelector('#hms-stop').onclick=stop;
      root.querySelector('#hms-save').onclick=function(){saveProject(state);status('Projekt lokal gespeichert.');};
      root.querySelector('#hms-clear').onclick=function(){if(!window.confirm('Alle Step-Muster wirklich leeren?'))return;TRACKS.forEach(function(t){state.tracks[t.id].grid.fill(false);});saveProject(state);render();};
      root.querySelectorAll('[data-step]').forEach(function(b){b.onclick=function(){var s=state.tracks[b.dataset.track];s.grid[Number(b.dataset.step)]=!s.grid[Number(b.dataset.step)];saveProject(state);b.style.background=s.grid[Number(b.dataset.step)]?TRACKS.find(function(t){return t.id===b.dataset.track;}).color+'55':'rgba(0,0,0,.24)';};});
      root.querySelectorAll('[data-vol]').forEach(function(el){el.oninput=function(){state.tracks[el.dataset.vol].vol=Number(el.value)/100;if(audio)audio.update();saveProject(state);};});
      root.querySelectorAll('[data-pan]').forEach(function(el){el.oninput=function(){state.tracks[el.dataset.pan].pan=Number(el.value)/100;if(audio)audio.update();saveProject(state);};});
      root.querySelectorAll('[data-inst]').forEach(function(el){el.onchange=function(){state.tracks[el.dataset.inst].inst=el.value;saveProject(state);};});
      root.querySelectorAll('[data-mute]').forEach(function(el){el.onclick=function(){var s=state.tracks[el.dataset.mute];s.mute=!s.mute;if(audio)audio.update();saveProject(state);render();};});
      root.querySelectorAll('[data-solo]').forEach(function(el){el.onclick=function(){var s=state.tracks[el.dataset.solo];s.solo=!s.solo;if(audio)audio.update();saveProject(state);render();};});
      [['#hms-master','master'],['#hms-reverb','reverb'],['#hms-delay','delay']].forEach(function(pair){root.querySelector(pair[0]).oninput=function(){state[pair[1]]=Number(this.value)/100;if(audio)audio.update();saveProject(state);};});
      root.querySelector('#hms-lyrics').oninput=function(){state.lyrics=this.value;saveProject(state);};
      root.querySelector('#hms-export').onclick=exportAudio;
      root.querySelector('#hms-json-out').onclick=function(){download((state.name||'haldo-projekt').replace(/[^a-z0-9_-]+/gi,'-')+'.json',new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));};
      root.querySelector('#hms-json-in').onchange=function(){var f=this.files&&this.files[0];if(!f)return;var reader=new FileReader();reader.onload=function(){try{var data=JSON.parse(String(reader.result||''));if(!data||typeof data!=='object'||!data.tracks)throw new Error('Ungültige Projektdatei.');H.Store.set(STORE_KEY,data);state=readProject();render();status('Projekt importiert und geprüft.');}catch(e){status('Importfehler: '+e.message);}};reader.onerror=function(){status('Projektdatei konnte nicht gelesen werden.');};reader.readAsText(f);};
    }
    function status(message){var root=document.getElementById(rootId),el=root&&root.querySelector('#hms-status');if(el)el.textContent=message;}
    function schedule(){
      if(!playing||!audio)return;
      var step=60/state.bpm/4,now=audio.context.currentTime;
      while(nextTime<now+.12){
        var idx=stepIndex;
        TRACKS.forEach(function(t){
          var s=state.tracks[t.id];if(!s.grid[idx])return;
          if(t.id==='bass')audio.note(t.id,midi(45),step*1.8,nextTime);
          else if(t.id==='chords')[57,60,64].forEach(function(n){audio.note(t.id,midi(n),step*3.5,nextTime);});
          else if(t.id==='lead')audio.note(t.id,midi(SCALE[idx%SCALE.length]),step*1.8,nextTime);
          else if(t.id==='vocal')audio.note(t.id,midi(SCALE[(idx+2)%SCALE.length]+12),step*1.35,nextTime);
          else audio.note(t.id,0,step,nextTime);
        });
        stepIndex=(stepIndex+1)%16;nextTime+=step;
      }
    }
    async function start(){
      if(playing)return;
      var AC=window.AudioContext||window.webkitAudioContext;if(!AC){status('Web Audio wird von diesem Browser nicht unterstützt.');return;}
      var context;
      try{
        context=new AC();
        await context.resume();
        if(closed){if(context.state!=='closed')await context.close();return;}
        if(context.state!=='running')throw new Error('Audio-Kontext blieb pausiert.');
        audio=makeEngine(context,state);
      }catch(e){try{if(context&&context.state!=='closed')context.close();}catch(_){}audio=null;status('Audio konnte nicht gestartet werden: '+e.message);return;}
      playing=true;stepIndex=0;nextTime=audio.context.currentTime+.04;
      var root=document.getElementById(rootId);if(root){root.querySelector('#hms-play').textContent='▶ Läuft';drawVisualizer(root);}
      status('Wiedergabe läuft · '+state.bpm+' BPM');timer=setInterval(schedule,25);
    }
    function drawVisualizer(root){
      var canvas=root.querySelector('#hms-viz'),ctx=canvas.getContext('2d'),data=new Uint8Array(64);
      function frame(){if(closed||!canvas.isConnected)return;raf=requestAnimationFrame(frame);ctx.clearRect(0,0,canvas.width,canvas.height);if(audio&&playing){audio.analyser.getByteFrequencyData(data);var w=canvas.width/data.length;for(var i=0;i<data.length;i++){var h=data[i]/255*canvas.height;ctx.fillStyle='rgba(0,229,255,.8)';ctx.fillRect(i*w,canvas.height-h,Math.max(1,w-2),h);}}}
      if(raf)cancelAnimationFrame(raf);frame();
    }
    function exportAudio(){
      var root=document.getElementById(rootId),btn=root&&root.querySelector('#hms-export'),out=root&&root.querySelector('#hms-export-status');
      if(!btn||!out)return;btn.disabled=true;out.textContent='WAV wird offline gerendert …';
      makeOffline(state).then(function(blob){download((state.name||'haldo-song').replace(/[^a-z0-9_-]+/gi,'-')+'.wav',blob);out.textContent='WAV-Export erfolgreich · '+state.bars+' Takte · '+state.bpm+' BPM';}).catch(function(e){out.textContent='Exportfehler: '+e.message;}).finally(function(){btn.disabled=false;});
    }
    render();
    var layer=document.getElementById('winLayer')||document.body;
    if(window.MutationObserver){observer=new MutationObserver(function(){if(!document.getElementById(rootId))cleanup();});observer.observe(layer,{childList:true,subtree:true});}
  }};
  console.info('HalDo Music Studio Pro Max: native shell integration registered.');
})();