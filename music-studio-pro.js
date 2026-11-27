/* HalDo Music Studio Pro — native v166 integration */
(function () {
  'use strict';
  var H = window.HalDo;
  if (!H || !H.Win || !H.Store || H.MusicStudio && H.MusicStudio.__nativePro) return;

  var KEY = 'music_studio_pro_v1';
  var TRACKS = [
    {id:'kick',name:'Kick',kind:'drum',color:'#fb7185',vol:.85,pan:0},
    {id:'snare',name:'Snare',kind:'drum',color:'#fbbf24',vol:.72,pan:0},
    {id:'hat',name:'Hi-Hat',kind:'drum',color:'#38bdf8',vol:.42,pan:.08},
    {id:'bass',name:'Bass',kind:'synth',color:'#a78bfa',vol:.68,pan:0},
    {id:'chords',name:'Chords',kind:'synth',color:'#34d399',vol:.42,pan:-.18},
    {id:'lead',name:'Lead',kind:'synth',color:'#f472b6',vol:.55,pan:.18},
    {id:'vocal',name:'Vocal Synth',kind:'synth',color:'#f97316',vol:.32,pan:0},
    {id:'piano',name:'Piano Roll',kind:'synth',color:'#60a5fa',vol:.48,pan:0}
  ];
  var DEFAULT = {
    projectName:'Mein HalDo Projekt', bpm:110, bars:4, master:.82, reverb:.18, delay:.12, selected:'sequencer', pianoNotes:[],
    tracks: TRACKS.reduce(function (a,t) {
      a[t.id] = {steps:Array.from({length:16},function(){return false;}),vol:t.vol,pan:t.pan,mute:false,solo:false,send:.35};
      return a;
    }, {})
  };
  var patternCounter=0;
  function makePatternId(){patternCounter++;return 'pattern-'+Date.now().toString(36)+'-'+patternCounter.toString(36);}
  function cleanPatternData(raw){
    var clean={tracks:clone(DEFAULT.tracks),pianoNotes:[]};
    if(raw&&raw.tracks)TRACKS.forEach(function(t){
      var old=raw.tracks[t.id];if(!old)return;
      if(Array.isArray(old.steps))clean.tracks[t.id].steps=Array.from({length:16},function(_,i){return !!old.steps[i];});
      ['vol','pan','send'].forEach(function(k){if(Number.isFinite(Number(old[k])))clean.tracks[t.id][k]=Math.max(k==='pan'?-1:0,Math.min(1,Number(old[k])));});
      clean.tracks[t.id].mute=!!old.mute;clean.tracks[t.id].solo=!!old.solo;
    });
    if(raw&&Array.isArray(raw.pianoNotes))clean.pianoNotes=raw.pianoNotes.filter(function(n){return n&&Number.isInteger(n.step)&&n.step>=0&&n.step<16&&Number.isInteger(n.note)&&n.note>=48&&n.note<=83;}).slice(0,512).map(function(n){return {step:n.step,note:n.note,velocity:Math.max(.05,Math.min(1,Number(n.velocity)||.75)),duration:Math.max(.05,Math.min(1,Number(n.duration)||.22))};});
    return clean;
  }
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function load(source){
    var saved=source===undefined?H.Store.get(KEY,null):source, state=clone(DEFAULT);
    if(saved && typeof saved==='object'){
      state.projectName=String(saved.projectName||DEFAULT.projectName).slice(0,80)||DEFAULT.projectName;
      state.bpm=Math.max(40,Math.min(240,Number(saved.bpm)||110));
      state.bars=[1,2,4,8].indexOf(Number(saved.bars))>=0?Number(saved.bars):4;
      ['master','reverb','delay'].forEach(function(k){if(Number.isFinite(Number(saved[k])))state[k]=Math.max(0,Math.min(1,Number(saved[k])));});
      if(Array.isArray(saved.pianoNotes))state.pianoNotes=saved.pianoNotes.filter(function(n){return n&&Number.isInteger(n.step)&&n.step>=0&&n.step<16&&Number.isInteger(n.note)&&n.note>=48&&n.note<=83;}).map(function(n){return {step:n.step,note:n.note,velocity:Math.max(.05,Math.min(1,Number(n.velocity)||.75)),duration:Math.max(.05,Math.min(1,Number(n.duration)||.22))};});
      if(saved.tracks) TRACKS.forEach(function(t){
        var old=saved.tracks[t.id]; if(!old)return;
        if(Array.isArray(old.steps))state.tracks[t.id].steps=Array.from({length:16},function(_,i){return !!old.steps[i];});
        ['vol','pan','send'].forEach(function(k){if(Number.isFinite(Number(old[k])))state.tracks[t.id][k]=Math.max(k==='pan'?-1:0,Math.min(1,Number(old[k])));});
        state.tracks[t.id].mute=!!old.mute;state.tracks[t.id].solo=!!old.solo;
      });
      var used={},rawPatterns=Array.isArray(saved.patterns)?saved.patterns.slice(0,32):[];
      state.patterns=rawPatterns.map(function(p,index){
        var id=String(p&&p.id||makePatternId()).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,64)||makePatternId();
        if(used[id])id=makePatternId();used[id]=true;
        var data=cleanPatternData(p);
        return {id:id,name:String(p&&p.name||('Pattern '+(index+1))).slice(0,48)||('Pattern '+(index+1)),tracks:data.tracks,pianoNotes:data.pianoNotes};
      });
      if(!state.patterns.length)state.patterns=[{id:makePatternId(),name:'Pattern 1',tracks:clone(state.tracks),pianoNotes:clone(state.pianoNotes)}];
      state.activePatternId=state.patterns.some(function(p){return p.id===saved.activePatternId;})?saved.activePatternId:state.patterns[0].id;
      var active=state.patterns.find(function(p){return p.id===state.activePatternId;});
      if(active){var activeData=cleanPatternData(active);state.tracks=activeData.tracks;state.pianoNotes=activeData.pianoNotes;}
      var validIds=state.patterns.map(function(p){return p.id;});
      state.arrangement=Array.from({length:8},function(_,i){var id=Array.isArray(saved.arrangement)?saved.arrangement[i]:null;return validIds.indexOf(id)>=0?id:(i===0?state.activePatternId:null);});
    }else{
      state.patterns=[{id:makePatternId(),name:'Pattern 1',tracks:clone(state.tracks),pianoNotes:clone(state.pianoNotes)}];
      state.activePatternId=state.patterns[0].id;
      state.arrangement=[state.activePatternId,null,null,null,null,null,null,null];
    }
    return state;
  }
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function download(name,blob){var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(url);},1500);}
  function open(){
    var state=load(), rootId='haldo-music-'+Date.now()+'-root';
    var html='<div id="'+rootId+'" class="hdms-root"><style>'+
      '.hdms-root{font:13px/1.45 system-ui,sans-serif;color:var(--text,#eaf4ff);height:100%;overflow:auto;padding:12px;box-sizing:border-box}.hdms-root *{box-sizing:border-box}.hdms-hero{padding:14px;border:1px solid rgba(0,229,255,.25);border-radius:15px;background:linear-gradient(120deg,rgba(0,180,220,.16),rgba(130,80,220,.18));margin-bottom:10px}.hdms-title{font-size:18px;font-weight:850}.hdms-muted{opacity:.68;font-size:11px}.hdms-tabs,.hdms-actions,.hdms-row{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.hdms-tabs{margin:10px 0}.hdms-btn{border:1px solid var(--border,rgba(120,180,220,.25));background:rgba(30,60,90,.5);color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}.hdms-btn.active{background:var(--accent,rgba(0,200,230,.22));border-color:var(--accent,#00d5ed);color:var(--text,#fff)}.hdms-card{padding:12px;border:1px solid var(--border,rgba(120,180,220,.22));background:rgba(10,30,55,.35);border-radius:13px;margin:9px 0}.hdms-grid{display:grid;grid-template-columns:78px repeat(16,minmax(18px,1fr));gap:4px;min-width:450px}.hdms-step{height:27px;border:1px solid rgba(130,180,220,.16);border-radius:5px;background:rgba(0,0,0,.24);cursor:pointer}.hdms-step.on{background:var(--step);border-color:var(--step)}.hdms-step.play{outline:2px solid #fff;outline-offset:1px}.hdms-label{display:flex;align-items:center;font-size:11px;font-weight:700}.hdms-input{accent-color:var(--accent,#00d5ed);max-width:100%;width:100%}.hdms-number{width:72px;padding:7px;border-radius:8px;border:1px solid var(--border,rgba(120,180,220,.3));background:rgba(0,0,0,.25);color:inherit}.hdms-mixrow{display:grid;grid-template-columns:75px 1fr 1fr 42px;gap:8px;align-items:center;margin:10px 0}.hdms-status{font-size:11px;opacity:.72;min-height:18px}@media(max-width:520px){.hdms-mixrow{grid-template-columns:65px 1fr 1fr 35px}.hdms-root{padding:8px}}'+
      '</style><div class="hdms-hero"><div class="hdms-title">🎼 HalDo Music Studio Pro</div><div class="hdms-muted">Native Audio Engine · Step Sequencer · Mixer · Master FX · WAV Export · Auto-Save</div><div class="hdms-row" style="margin-top:10px"><label>Tempo <input class="hdms-number" id="hdms-bpm" type="number" min="40" max="240" value="'+state.bpm+'"> BPM</label><label>Takte <select class="hdms-number" id="hdms-bars"><option value="1">1</option><option value="2">2</option><option value="4">4</option><option value="8">8</option></select></label><label>Projekt <input class="hdms-number" id="hdms-project-name" type="text" maxlength="80" value="'+esc(state.projectName)+'" style="width:180px"></label><span class="hdms-muted" id="hdms-save">● Automatisch gespeichert</span><div class="hdms-row" style="margin-top:8px"><button class="hdms-btn" id="hdms-project-export">⬇ Projekt sichern</button><button class="hdms-btn" id="hdms-project-import-trigger">⬆ Projekt laden</button><input id="hdms-project-file" type="file" accept=".json,application/json" style="display:none"></div></div></div>'+
      '<canvas id="hdms-viz" width="900" height="52" style="width:100%;height:52px;background:rgba(0,0,0,.2);border-radius:10px;margin:2px 0 8px"></canvas><div class="hdms-tabs"><button class="hdms-btn active" data-tab="sequencer">🎹 Sequencer</button><button class="hdms-btn" data-tab="arrangement">🧩 Arrangement</button><button class="hdms-btn" data-tab="piano">🎼 Piano Roll</button><button class="hdms-btn" data-tab="mixer">🎚 Mixer</button><button class="hdms-btn" data-tab="master">✨ Master & Export</button></div>'+
      '<div id="hdms-panel"></div><div class="hdms-actions"><button class="hdms-btn active" id="hdms-play">▶ Wiedergabe</button><button class="hdms-btn" id="hdms-stop">■ Stop</button><button class="hdms-btn" id="hdms-clear">Leeren</button><button class="hdms-btn" id="hdms-demo">Groove erstellen</button></div><div class="hdms-status" id="hdms-status" aria-live="polite">Bereit. Audio startet erst nach deiner Wiedergabe-Aktion.</div></div>';
    H.Win.open('🎼 HalDo Music Studio Pro',html,{w:900,h:760});
    window.setTimeout(function(){
      var win;
      /* Locate this studio window by its unique root element. */
      var root=document.getElementById(rootId);
      if(!root)return;
      win=root.closest('.window');
      var panel=root.querySelector('#hdms-panel'),status=root.querySelector('#hdms-status'),playBtn=root.querySelector('#hdms-play');
      root.querySelector('#hdms-bars').value=String(state.bars);
      var tab='sequencer',audio=null,graph=null,playing=false,step=0,timer=null,raf=0,observer=null,closed=false;
      function syncActivePattern(){
        if(!Array.isArray(state.patterns))state.patterns=[];
        var active=state.patterns.find(function(p){return p.id===state.activePatternId;});
        if(!active){active={id:makePatternId(),name:'Pattern '+(state.patterns.length+1)};state.patterns.push(active);state.activePatternId=active.id;}
        active.tracks=clone(state.tracks);active.pianoNotes=clone(state.pianoNotes);
      }
      function save(){syncActivePattern();H.Store.set(KEY,state);var el=root.querySelector('#hdms-save');if(el)el.textContent='● Gespeichert';}
      function switchPattern(id){
        syncActivePattern();
        var target=state.patterns.find(function(p){return p.id===id;});if(!target)return;
        var data=cleanPatternData(target);state.tracks=data.tracks;state.pianoNotes=data.pianoNotes;state.activePatternId=target.id;
        save();render();bind();say('Aktiv: '+target.name);
      }
      function createPattern(duplicate){
        if(state.patterns.length>=32){say('Maximal 32 Patterns pro Projekt.');return;}
        syncActivePattern();
        var source=state.patterns.find(function(p){return p.id===state.activePatternId;});
        var data=duplicate&&source?cleanPatternData(source):cleanPatternData(null);
        var item={id:makePatternId(),name:'Pattern '+(state.patterns.length+1),tracks:data.tracks,pianoNotes:data.pianoNotes};
        state.patterns.push(item);state.activePatternId=item.id;state.tracks=clone(item.tracks);state.pianoNotes=clone(item.pianoNotes);
        save();render();bind();say(duplicate?'Pattern dupliziert.':'Neues leeres Pattern erstellt.');
      }
      function deletePattern(){
        if(state.patterns.length<=1){say('Mindestens ein Pattern muss im Projekt bleiben.');return;}
        var index=state.patterns.findIndex(function(p){return p.id===state.activePatternId;});
        if(index<0)return;
        var removed=state.patterns.splice(index,1)[0],next=state.patterns[Math.max(0,index-1)];
        state.arrangement=state.arrangement.map(function(id){return id===removed.id?null:id;});
        if(!state.arrangement.some(Boolean))state.arrangement[0]=next.id;
        state.activePatternId=next.id;var data=cleanPatternData(next);state.tracks=data.tracks;state.pianoNotes=data.pianoNotes;
        save();render();bind();say(removed.name+' wurde gelöscht.');
      }
      function renamePattern(){
        var field=root.querySelector('#hdms-pattern-name'),active=state.patterns.find(function(p){return p.id===state.activePatternId;});
        if(!field||!active)return;
        active.name=String(field.value||'').trim().slice(0,48)||active.name;field.value=active.name;
        save();render();bind();say('Pattern umbenannt.');
      }
      function say(msg){if(status)status.textContent=msg;}
      function safeFileName(name){return String(name||'HalDo-Projekt').replace(/[^\w\-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'HalDo-Projekt';}
      function exportProject(){
        try{
          var payload={app:'HalDoMusicStudioPro',formatVersion:1,exportedAt:new Date().toISOString(),project:clone(state)};
          download(safeFileName(state.projectName)+'.haldo-music.json',new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
          say('Projektdatei wurde exportiert.');
        }catch(e){say('Projekt-Export fehlgeschlagen: '+e.message);}
      }
      function importProjectFile(file){
        if(!file)return;
        if(file.size>2*1024*1024){say('Die Projektdatei ist zu groß (maximal 2 MB).');return;}
        var reader=new FileReader();
        reader.onerror=function(){say('Die Projektdatei konnte nicht gelesen werden.');};
        reader.onload=function(){
          try{
            var payload=JSON.parse(String(reader.result||''));
            if(!payload||payload.app!=='HalDoMusicStudioPro'||payload.formatVersion!==1||!payload.project||typeof payload.project!=='object')throw new Error('Unbekanntes oder nicht unterstütztes HalDo-Projektformat.');
            var incoming=load(payload.project);
            Object.keys(state).forEach(function(k){delete state[k];});
            Object.keys(incoming).forEach(function(k){state[k]=incoming[k];});
            root.querySelector('#hdms-bpm').value=String(state.bpm);
            root.querySelector('#hdms-bars').value=String(state.bars);
            root.querySelector('#hdms-project-name').value=state.projectName;
            tab='sequencer';state.selected=tab;save();render();bind();
            say('Projekt „'+state.projectName+'“ wurde geladen.');
          }catch(e){say('Import abgebrochen: '+e.message);}
        };
        reader.readAsText(file);
      }

      function activeTracks(trackState){var tracks=trackState||state.tracks;var anySolo=TRACKS.some(function(t){return tracks[t.id].solo;});return TRACKS.filter(function(t){var x=tracks[t.id];return !x.mute&&(!anySolo||x.solo);});}
      function render(){
        root.querySelectorAll('[data-tab]').forEach(function(b){b.classList.toggle('active',b.dataset.tab===tab);});
        var out='';
        if(tab==='sequencer'){
          out+='<div class="hdms-card"><b>Pattern-Verwaltung</b><div class="hdms-row" style="margin-top:8px"><select class="hdms-number" id="hdms-pattern-select" style="min-width:145px;flex:1">';
          state.patterns.forEach(function(p){out+='<option value="'+esc(p.id)+'" '+(p.id===state.activePatternId?'selected':'')+'>'+esc(p.name)+'</option>';});
          out+='</select><input class="hdms-number" id="hdms-pattern-name" maxlength="48" value="'+esc((state.patterns.find(function(p){return p.id===state.activePatternId;})||{}).name||'Pattern')+'" aria-label="Pattern-Name" style="width:145px"><button class="hdms-btn" id="hdms-pattern-rename">Umbenennen</button></div><div class="hdms-actions" style="margin-top:8px"><button class="hdms-btn" id="hdms-pattern-new">＋ Neu</button><button class="hdms-btn" id="hdms-pattern-duplicate">⧉ Duplizieren</button><button class="hdms-btn" id="hdms-pattern-delete">✕ Löschen</button><span class="hdms-muted">'+state.patterns.length+'/32 Patterns</span></div></div>';
          out+='<div class="hdms-card"><div class="hdms-muted" style="margin-bottom:8px">16 Schritte · Jedes Pattern besitzt eigene Spuren und Piano-Noten</div><div style="overflow-x:auto"><div class="hdms-grid">';
          out+='<div class="hdms-label">SPUR</div>';for(var i=0;i<16;i++)out+='<div class="hdms-label" style="justify-content:center">'+(i+1)+'</div>';
          TRACKS.forEach(function(t){out+='<div class="hdms-label" style="color:'+t.color+'">'+t.name+'</div>';for(var j=0;j<16;j++){var on=state.tracks[t.id].steps[j];out+='<button class="hdms-step '+(on?'on':'')+'" style="--step:'+t.color+'" data-track="'+t.id+'" data-step="'+j+'" aria-label="'+esc(t.name)+' Schritt '+(j+1)+'" aria-pressed="'+on+'"></button>'; }});
          out+='</div></div></div>';
        }else if(tab==='arrangement'){
          out+='<div class="hdms-card"><b>Arrangement-Timeline · 8 Takte</b><div class="hdms-muted">Wähle für jeden Takt ein Pattern. Leere Takte bleiben still. Die Reihenfolge gilt für Wiedergabe sowie WAV- und MIDI-Export.</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:12px">';
          for(var bar=0;bar<8;bar++){var selectedId=state.arrangement[bar]||'';out+='<label class="hdms-card" style="margin:0;padding:9px"><b>Takt '+(bar+1)+'</b><select class="hdms-number" data-arrangement-bar="'+bar+'" style="width:100%;margin-top:7px"><option value="">— Stille —</option>';state.patterns.forEach(function(p){out+='<option value="'+esc(p.id)+'" '+(p.id===selectedId?'selected':'')+'>'+esc(p.name)+'</option>';});out+='</select></label>';}
          out+='</div><div class="hdms-actions" style="margin-top:10px"><button class="hdms-btn" id="hdms-arrangement-fill">Aktives Pattern auf alle Takte</button><button class="hdms-btn" id="hdms-arrangement-clear">Timeline leeren</button></div></div>';
        }else if(tab==='piano'){
          out+='<div class="hdms-card"><b>Piano Roll · C3–B5</b><div class="hdms-muted">Klicke ein Feld, um eine MIDI-Note zu setzen oder zu entfernen. Die Noten werden mit der Piano-Spur abgespielt und exportiert.</div><div style="overflow-x:auto;margin-top:10px"><div style="display:grid;grid-template-columns:52px repeat(16,minmax(18px,1fr));gap:3px;min-width:420px">';
          for(var pitch=83;pitch>=48;pitch--){var names=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];out+='<div class="hdms-label">'+names[pitch%12]+(Math.floor(pitch/12)-1)+'</div>';for(var col=0;col<16;col++){var found=state.pianoNotes.some(function(n){return n.step===col&&n.note===pitch;});out+='<button class="hdms-step '+(found?'on':'')+'" style="--step:#60a5fa;height:19px" data-piano-step="'+col+'" data-piano-note="'+pitch+'" aria-label="'+names[pitch%12]+' Schritt '+(col+1)+'" aria-pressed="'+found+'"></button>';}}
          out+='</div></div><button class="hdms-btn active" id="hdms-midi-export" style="margin-top:10px;width:100%">⬇ MIDI-Datei exportieren</button></div>';
        }else if(tab==='mixer'){
          out+='<div class="hdms-card"><b>Spur-Mixer</b><div class="hdms-muted">Lautstärke, Panorama, Stummschaltung und Solo pro Spur</div>';
          TRACKS.forEach(function(t){var x=state.tracks[t.id];out+='<div class="hdms-mixrow"><b style="color:'+t.color+'">'+t.name+'</b><label class="hdms-muted">VOL<input class="hdms-input" type="range" min="0" max="100" value="'+Math.round(x.vol*100)+'" data-vol="'+t.id+'"></label><label class="hdms-muted">PAN<input class="hdms-input" type="range" min="-100" max="100" value="'+Math.round(x.pan*100)+'" data-pan="'+t.id+'"></label><div><button class="hdms-btn '+(x.mute?'active':'')+'" data-mute="'+t.id+'">M</button><button class="hdms-btn '+(x.solo?'active':'')+'" data-solo="'+t.id+'">S</button></div></div>';});
          out+='</div>';
        }else{
          out+='<div class="hdms-card"><b>Master-Kanal</b><div class="hdms-mixrow"><b>Master</b><label class="hdms-muted">LEVEL<input class="hdms-input" type="range" min="0" max="100" value="'+Math.round(state.master*100)+'" data-master></label><span></span><span></span></div><div class="hdms-mixrow"><b>Reverb</b><label class="hdms-muted">SEND<input class="hdms-input" type="range" min="0" max="100" value="'+Math.round(state.reverb*100)+'" data-reverb></label><span></span><span></span></div><div class="hdms-mixrow"><b>Delay</b><label class="hdms-muted">SEND<input class="hdms-input" type="range" min="0" max="100" value="'+Math.round(state.delay*100)+'" data-delay></label><span></span><span></span></div><div class="hdms-muted">WAV Export rendert das Pattern einschließlich aller Takte, aktiven Spuren, Panorama, Master-Level und Effektsends.</div><button class="hdms-btn active" id="hdms-export" style="margin-top:12px;width:100%">⬇ WAV exportieren</button></div>';
        }
        panel.innerHTML=out;
      }
      function makeGraph(ctx){
        var master=ctx.createGain(),analyser=ctx.createAnalyser(),reverb=ctx.createConvolver(),delay=ctx.createDelay(1),delayFb=ctx.createGain(),delayWet=ctx.createGain(),revWet=ctx.createGain(),tracks={};
        master.gain.value=state.master;analyser.fftSize=128;
        var ir=ctx.createBuffer(2,Math.floor(ctx.sampleRate*1.35),ctx.sampleRate);
        for(var c=0;c<2;c++){var data=ir.getChannelData(c);for(var n=0;n<data.length;n++)data[n]=(Math.random()*2-1)*Math.pow(1-n/data.length,2.4);}
        reverb.buffer=ir;delay.delayTime.value=.27;delayFb.gain.value=.24;delayWet.gain.value=state.delay;revWet.gain.value=state.reverb;
        delay.connect(delayFb);delayFb.connect(delay);delay.connect(delayWet);delayWet.connect(master);reverb.connect(revWet);revWet.connect(master);
        master.connect(analyser);analyser.connect(ctx.destination);
        TRACKS.forEach(function(t){var input=ctx.createGain(),pan=ctx.createStereoPanner(),gain=ctx.createGain(),sendR=ctx.createGain(),sendD=ctx.createGain();input.connect(pan);pan.connect(gain);gain.connect(master);pan.connect(sendR);sendR.connect(reverb);pan.connect(sendD);sendD.connect(delay);tracks[t.id]={input:input,pan:pan,gain:gain,sendR:sendR,sendD:sendD};});
        return {master:master,analyser:analyser,tracks:tracks,ctx:ctx,revWet:revWet,delayWet:delayWet};
      }
      function syncGraph(g,source,at){var tracks=(source&&source.tracks)||state.tracks,when=at==null?g.ctx.currentTime:at;g.master.gain.setTargetAtTime(state.master,when,.015);g.revWet.gain.setTargetAtTime(state.reverb,when,.015);g.delayWet.gain.setTargetAtTime(state.delay,when,.015);var live=activeTracks(tracks);TRACKS.forEach(function(t){var x=tracks[t.id],n=g.tracks[t.id];n.gain.gain.setTargetAtTime(live.indexOf(t)>=0?1:0,when,.005);n.pan.pan.setTargetAtTime(x.pan,when,.005);n.sendR.gain.setTargetAtTime(x.sendR == null ? 0.35 : x.sendR,when,.005);n.sendD.gain.setTargetAtTime(x.sendD == null ? 0.35 : x.sendD,when,.005);});}
      function midi(n){return 440*Math.pow(2,(n-69)/12);}
      function note(ctx,g,id,freq,dur,vol,type,when){
        var t=when==null?ctx.currentTime:when;if(vol<=.0001)return;
        var o=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();o.type=type||'triangle';o.frequency.setValueAtTime(freq,t);filter.type='lowpass';filter.frequency.value=id==='bass'?950:3400;gain.gain.setValueAtTime(.0001,t);gain.gain.linearRampToValueAtTime(vol,t+.012);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,vol*.36),t+dur*.55);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(filter);filter.connect(gain);gain.connect(g.tracks[id].input);o.start(t);o.stop(t+dur+.025);
      }
      function drum(ctx,g,id,vol,when){
        var t=when==null?ctx.currentTime:when,o,amp,src,filter;
        if(vol<=.0001)return;
        if(id==='kick'){o=ctx.createOscillator();amp=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(145,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);amp.gain.setValueAtTime(vol,t);amp.gain.exponentialRampToValueAtTime(.0001,t+.24);o.connect(amp);amp.connect(g.tracks[id].input);o.start(t);o.stop(t+.25);}
        else{var len=Math.floor(ctx.sampleRate*(id==='hat' ? 0.045 : 0.19)),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);for(var i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,id==='hat'?3:2.6);src=ctx.createBufferSource();src.buffer=buf;filter=ctx.createBiquadFilter();filter.type='highpass';filter.frequency.value=id==='hat'?6500:1200;amp=ctx.createGain();amp.gain.setValueAtTime(vol*(id==='hat' ? 0.42 : 1),t);amp.gain.exponentialRampToValueAtTime(.0001,t+(id==='hat' ? 0.045 : 0.17));src.connect(filter);filter.connect(amp);amp.connect(g.tracks[id].input);src.start(t);src.stop(t+len/ctx.sampleRate);}
      }
      function schedule(ctx,g,index,when,patternData){
        var source=patternData||state,tracks=source.tracks||state.tracks,notes=source.pianoNotes||[],live=activeTracks(tracks),x,vol;
        syncGraph(g,source,when);
        TRACKS.forEach(function(t){if(live.indexOf(t)<0)return;x=tracks[t.id];if(!x.steps[index])return;vol=x.vol;
          if(t.kind==='drum')drum(ctx,g,t.id,vol,when);
          else if(t.id==='piano')notes.filter(function(n){return n.step===index;}).forEach(function(n){note(ctx,g,'piano',midi(n.note),n.duration,vol*n.velocity,'triangle',when);});
          else if(t.id==='bass')note(ctx,g,t.id,midi(45),.23,vol,'sawtooth',when);
          else if(t.id==='chords')[57,60,64].forEach(function(n){note(ctx,g,t.id,midi(n),.42,vol*.31,'triangle',when);});
          else if(t.id==='lead')note(ctx,g,t.id,midi([69,72,74,76,79,81,84,86][index%8]),.22,vol,'triangle',when);
          else note(ctx,g,t.id,midi([57,60,62,64,67,69,72,74][(index+2)%8]),.28,vol,'sine',when);
        });
      }
      function patternById(id){return state.patterns.find(function(p){return p.id===id;})||null;}
      function stop(){
        playing=false;if(timer){clearInterval(timer);timer=null;}if(raf){cancelAnimationFrame(raf);raf=0;}if(playBtn)playBtn.textContent='▶ Wiedergabe';
        if(audio){var old=audio;audio=null;graph=null;try{old.close();}catch(e){}}
        say('Wiedergabe gestoppt.');
      }
      function start(){
        if(playing)return;
        var AC=window.AudioContext||window.webkitAudioContext;if(!AC){say('Dieser Browser unterstützt Web Audio nicht.');return;}
        try{audio=new AC();graph=makeGraph(audio);syncGraph(graph);if(audio.state==='suspended')audio.resume();}catch(e){say('Audio konnte nicht gestartet werden: '+e.message);return;}
        playing=true;step=0;var interval=(60/state.bpm)/4,started=audio.currentTime+.04;
        if(playBtn)playBtn.textContent='⏸ Pause';
        timer=setInterval(function(){if(!playing||!audio||!graph)return;var at=started+step*interval,barIndex=Math.floor(step/16),pattern=patternById(state.arrangement[barIndex]);if(pattern)schedule(audio,graph,step%16,Math.max(audio.currentTime+.008,at),pattern);step++;if(step>=128){step=0;started=audio.currentTime+.04;}},Math.max(20,interval*1000));
        function draw(){if(!playing||!graph)return;raf=requestAnimationFrame(draw);var canvas=root.querySelector('#hdms-viz');if(!canvas)return;var c=canvas.getContext('2d'),arr=new Uint8Array(graph.analyser.frequencyBinCount);graph.analyser.getByteFrequencyData(arr);c.clearRect(0,0,canvas.width,canvas.height);var w=canvas.width/arr.length;for(var i=0;i<arr.length;i++){var h=arr[i]/255*canvas.height;c.fillStyle='#22d3ee';c.fillRect(i*w,canvas.height-h,Math.max(1,w-2),h);}}
        draw();say('Arrangement läuft · '+state.bpm+' BPM · 8 Takte');
      }
      function renderExportGraph(ctx){
        var g=makeGraph(ctx);syncGraph(g);return g;
      }
      async function exportWav(){
        var btn=root.querySelector('#hdms-export');if(!btn)return;btn.disabled=true;btn.textContent='Rendere WAV…';
        try{
          var Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)throw new Error('OfflineAudioContext wird nicht unterstützt.');
          var stepDur=60/state.bpm/4,total=stepDur*16*8,rate=44100,ctx=new Offline(2,Math.ceil((total+.8)*rate),rate),g=renderExportGraph(ctx);
          for(var bar=0;bar<8;bar++){var pattern=patternById(state.arrangement[bar]);if(!pattern)continue;for(var i=0;i<16;i++)schedule(ctx,g,i,bar*16*stepDur,pattern);}
          var buffer=await ctx.startRendering(),channels=buffer.numberOfChannels,length=buffer.length,dataSize=length*channels*2,ab=new ArrayBuffer(44+dataSize),v=new DataView(ab);
          function str(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));}
          str(0,'RIFF');v.setUint32(4,36+dataSize,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,rate,true);v.setUint32(28,rate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,dataSize,true);
          var ch=[];for(var c=0;c<channels;c++)ch.push(buffer.getChannelData(c));var off=44;for(var n=0;n<length;n++)for(var cc=0;cc<channels;cc++){var sample=Math.max(-1,Math.min(1,ch[cc][n]));v.setInt16(off,sample<0?sample*32768:sample*32767,true);off+=2;}
          download('HalDo-Music-Studio-'+state.bpm+'BPM.wav',new Blob([ab],{type:'audio/wav'}));say('WAV erfolgreich gerendert und exportiert.');
        }catch(e){say('Exportfehler: '+e.message);}finally{btn.disabled=false;btn.textContent='⬇ WAV exportieren';}
      }
      function exportMidi(){
        try{
          var ppq=480,stepTicks=ppq/4,stepSeconds=60/state.bpm/4,events=[];
          events.push({tick:0,order:0,bytes:[0xFF,0x51,0x03,(Math.round(60000000/state.bpm)>>16)&255,(Math.round(60000000/state.bpm)>>8)&255,Math.round(60000000/state.bpm)&255]});
          for(var bar=0;bar<8;bar++){var pattern=patternById(state.arrangement[bar]);if(!pattern)continue;pattern.pianoNotes.forEach(function(n){
            var start=bar*16*stepTicks+n.step*stepTicks;
            var duration=Math.max(24,Math.round((n.duration/stepSeconds)*stepTicks));
            var velocity=Math.max(1,Math.min(127,Math.round(n.velocity*127)));
            events.push({tick:start,order:1,bytes:[0x90,n.note,velocity]});
            events.push({tick:start+duration,order:0,bytes:[0x80,n.note,0]});
          });}
          events.sort(function(a,b){return a.tick-b.tick||a.order-b.order;});
          function vlq(value){var buffer=value&0x7F,out=[];while((value>>=7)){buffer<<=8;buffer|=((value&0x7F)|0x80);}while(true){out.push(buffer&255);if(buffer&0x80)buffer>>=8;else break;}return out;}
          var track=[],last=0;
          events.forEach(function(e){track=track.concat(vlq(e.tick-last),e.bytes);last=e.tick;});
          track=track.concat([0x00,0xFF,0x2F,0x00]);
          function u32(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];}
          function ascii(s){return s.split('').map(function(ch){return ch.charCodeAt(0);});}
          var bytes=ascii('MThd').concat(u32(6),[0,0,0,1,(ppq>>8)&255,ppq&255],ascii('MTrk'),u32(track.length),track);
          download('HalDo-Music-Studio-'+state.bpm+'BPM.mid',new Blob([new Uint8Array(bytes)],{type:'audio/midi'}));
          say('MIDI-Datei exportiert · Arrangement mit 8 Takten.');
        }catch(e){say('MIDI-Exportfehler: '+e.message);}
      }
      function bind(){
        panel.querySelectorAll('[data-arrangement-bar]').forEach(function(el){el.addEventListener('change',function(){var i=Number(el.dataset.arrangementBar),id=el.value;state.arrangement[i]=patternById(id)?id:null;save();say('Arrangement-Takt '+(i+1)+' aktualisiert.');});});
        var fillArrangement=root.querySelector('#hdms-arrangement-fill');if(fillArrangement)fillArrangement.addEventListener('click',function(){state.arrangement=Array(8).fill(state.activePatternId);save();render();bind();say('Aktives Pattern auf alle 8 Takte verteilt.');});
        var clearArrangement=root.querySelector('#hdms-arrangement-clear');if(clearArrangement)clearArrangement.addEventListener('click',function(){state.arrangement=Array(8).fill(null);save();render();bind();say('Arrangement-Timeline geleert.');});
        var patternSelect=root.querySelector('#hdms-pattern-select');
        if(patternSelect)patternSelect.addEventListener('change',function(){switchPattern(this.value);});
        var newPattern=root.querySelector('#hdms-pattern-new');if(newPattern)newPattern.addEventListener('click',function(){createPattern(false);});
        var duplicatePattern=root.querySelector('#hdms-pattern-duplicate');if(duplicatePattern)duplicatePattern.addEventListener('click',function(){createPattern(true);});
        var deletePatternBtn=root.querySelector('#hdms-pattern-delete');if(deletePatternBtn)deletePatternBtn.addEventListener('click',deletePattern);
        var renamePatternBtn=root.querySelector('#hdms-pattern-rename');if(renamePatternBtn)renamePatternBtn.addEventListener('click',renamePattern);
        panel.querySelectorAll('[data-track]').forEach(function(b){b.addEventListener('click',function(){var x=state.tracks[b.dataset.track],i=Number(b.dataset.step);x.steps[i]=!x.steps[i];save();render();bind();});});
        panel.querySelectorAll('[data-piano-step]').forEach(function(el){el.addEventListener('click',function(){var stepNo=Number(el.dataset.pianoStep),pitch=Number(el.dataset.pianoNote),at=state.pianoNotes.findIndex(function(n){return n.step===stepNo&&n.note===pitch;});if(at>=0)state.pianoNotes.splice(at,1);else state.pianoNotes.push({step:stepNo,note:pitch,velocity:.78,duration:.22});state.tracks.piano.steps[stepNo]=state.pianoNotes.some(function(n){return n.step===stepNo;});save();render();bind();});});
        panel.querySelectorAll('[data-vol]').forEach(function(el){el.addEventListener('input',function(){state.tracks[el.dataset.vol].vol=Number(el.value)/100;if(graph)syncGraph(graph);save();});});
        panel.querySelectorAll('[data-pan]').forEach(function(el){el.addEventListener('input',function(){state.tracks[el.dataset.pan].pan=Number(el.value)/100;if(graph)syncGraph(graph);save();});});
        panel.querySelectorAll('[data-mute]').forEach(function(el){el.addEventListener('click',function(){var x=state.tracks[el.dataset.mute];x.mute=!x.mute;save();render();bind();if(graph)syncGraph(graph);});});
        panel.querySelectorAll('[data-solo]').forEach(function(el){el.addEventListener('click',function(){var x=state.tracks[el.dataset.solo];x.solo=!x.solo;save();render();bind();if(graph)syncGraph(graph);});});
        ['master','reverb','delay'].forEach(function(k){var el=panel.querySelector('[data-'+k+']');if(el)el.addEventListener('input',function(){state[k]=Number(el.value)/100;if(graph)syncGraph(graph);save();});});
        var ex=panel.querySelector('#hdms-export');if(ex)ex.addEventListener('click',exportWav);
        var midi=panel.querySelector('#hdms-midi-export');if(midi)midi.addEventListener('click',exportMidi);
      }
      root.querySelectorAll('[data-tab]').forEach(function(b){b.addEventListener('click',function(){tab=b.dataset.tab;state.selected=tab;save();render();bind();});});
      root.querySelector('#hdms-project-name').addEventListener('change',function(){state.projectName=String(this.value||'Mein HalDo Projekt').trim().slice(0,80)||'Mein HalDo Projekt';this.value=state.projectName;save();});
      root.querySelector('#hdms-project-export').addEventListener('click',exportProject);
      var projectFile=root.querySelector('#hdms-project-file');
      root.querySelector('#hdms-project-import-trigger').addEventListener('click',function(){projectFile.click();});
      projectFile.addEventListener('change',function(){if(this.files&&this.files[0])importProjectFile(this.files[0]);this.value='';});
      root.querySelector('#hdms-bpm').addEventListener('change',function(){state.bpm=Math.max(40,Math.min(240,Number(this.value)||110));this.value=state.bpm;save();});
      root.querySelector('#hdms-bars').addEventListener('change',function(){state.bars=Number(this.value);save();});
      playBtn.addEventListener('click',function(){if(playing)stop();else start();});
      root.querySelector('#hdms-stop').addEventListener('click',stop);
      root.querySelector('#hdms-clear').addEventListener('click',function(){TRACKS.forEach(function(t){state.tracks[t.id].steps.fill(false);});state.pianoNotes=[];save();render();bind();say('Aktives Pattern geleert.');});
      root.querySelector('#hdms-demo').addEventListener('click',function(){
        var patterns={kick:[0,4,8,12],snare:[4,12],hat:[0,2,4,6,8,10,12,14],bass:[0,8],chords:[0,6,10],lead:[2,5,9,13],vocal:[7,15],piano:[0,4,8,12]};
        state.pianoNotes=[{step:0,note:60,velocity:.72,duration:.3},{step:4,note:64,velocity:.72,duration:.3},{step:8,note:67,velocity:.72,duration:.3},{step:12,note:72,velocity:.72,duration:.3}];
        TRACKS.forEach(function(t){state.tracks[t.id].steps.fill(false);(patterns[t.id]||[]).forEach(function(i){state.tracks[t.id].steps[i]=true;});});save();render();bind();say('Groove-Vorlage erstellt. Passe sie im Sequencer an.');
      });
      render();bind();
      /* Clean up audio/timers when the owning desktop window is actually removed. */
      if(typeof MutationObserver==='function'&&win){observer=new MutationObserver(function(){if(!win.isConnected&&!closed){closed=true;stop();if(observer)observer.disconnect();}});observer.observe(document.body,{childList:true,subtree:true});}
    },80);
  }
  H.MusicStudio={__nativePro:true,open:open};
  H['music-studio']=H.MusicStudio;
  console.info('HalDo Music Studio Pro: native module registered.');
})();