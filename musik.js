/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v21.0) · ULTIMATE EDITION
   Multi-Track · Mixer · Master-FX · KI · Vocal Synth · Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  // --- AUDIO ENGINE SETUP ---
  var audioCtx = null;
  var masterGain = null;
  var masterReverb = null;
  var masterDelay = null;
  var analyser = null;
  var isPlaying = false;
  var currentStep = 0;
  var loopInterval = null;
  var vizAnimId = null;
  
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      masterGain = audioCtx.createGain(); masterGain.gain.value = 0.8;
      analyser = audioCtx.createAnalyser(); analyser.fftSize = 64;
      
      // Reverb Setup
      masterReverb = audioCtx.createConvolver();
      var revBuf = audioCtx.createBuffer(2, Math.floor(audioCtx.sampleRate * 1.5), audioCtx.sampleRate);
      for (var c = 0; c < 2; c++) { var d = revBuf.getChannelData(c); for (var i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 2.0); }
      masterReverb.buffer = revBuf;
      
      // Delay Setup
      masterDelay = audioCtx.createDelay(1.0);
      masterDelay.delayTime.value = 0.25;
      var delayFb = audioCtx.createGain(); delayFb.gain.value = 0.3;
      masterDelay.connect(delayFb); delayFb.connect(masterDelay);
      
      masterGain.connect(analyser); analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function playKick(vol) { if(!audioCtx || vol<=0.001) return; var t=audioCtx.currentTime, o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type="sine"; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(40,t+0.1); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2); o.connect(g); g.connect(masterGain); o.start(t); o.stop(t+0.25); }
  function playSnare(vol) { if(!audioCtx || vol<=0.001) return; var t=audioCtx.currentTime, bs=Math.floor(audioCtx.sampleRate*0.2), buf=audioCtx.createBuffer(1,bs,audioCtx.sampleRate), d=buf.getChannelData(0); for(var i=0;i<bs;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/bs,3); var s=audioCtx.createBufferSource(); s.buffer=buf; var g=audioCtx.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.15); var f=audioCtx.createBiquadFilter(); f.type="highpass"; f.frequency.value=1400; s.connect(f); f.connect(g); g.connect(masterGain); s.start(t); s.stop(t+0.2); }
  function playHat(vol) { if(!audioCtx || vol<=0.001) return; var t=audioCtx.currentTime, bs=Math.floor(audioCtx.sampleRate*0.05), buf=audioCtx.createBuffer(1,bs,audioCtx.sampleRate), d=buf.getChannelData(0); for(var i=0;i<bs;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/bs,2); var s=audioCtx.createBufferSource(); s.buffer=buf; var g=audioCtx.createGain(); g.gain.setValueAtTime(vol*0.6,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.05); var f=audioCtx.createBiquadFilter(); f.type="highpass"; f.frequency.value=7000; s.connect(f); f.connect(g); g.connect(masterGain); s.start(t); s.stop(t+0.06); }

  function playNote(freq, dur, vol, type, pan) {
    if(!audioCtx || vol<=0.001) return;
    var t=audioCtx.currentTime, endT=t+Math.max(0.1,dur);
    var panner = audioCtx.createStereoPanner(); panner.pan.value = pan || 0;
    
    if(type === "vocal_a" || type === "vocal_o" || type === "vocal_e") {
        var osc=audioCtx.createOscillator(), gain=audioCtx.createGain(); osc.type="sawtooth"; osc.frequency.value=freq;
        var fArr = type==="vocal_a"?[800,1150,2900]:type==="vocal_o"?[450,800,2830]:[400,1700,2600];
        var fFilters = fArr.map(f => { var b=audioCtx.createBiquadFilter(); b.type="bandpass"; b.frequency.value=f; b.Q.value=8; return b; });
        osc.connect(fFilters[0]); osc.connect(fFilters[1]); osc.connect(fFilters[2]);
        fFilters.forEach(f=>f.connect(gain));
        gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(vol*1.5,t+0.1); gain.gain.setValueAtTime(vol*1.5,endT-0.1); gain.gain.linearRampToValueAtTime(0,endT);
        osc.connect(fFilters[0]); // dummy
        gain.connect(panner); osc.start(t); osc.stop(endT+0.1);
    } else {
        var o=audioCtx.createOscillator(), g=audioCtx.createGain(), f=audioCtx.createBiquadFilter(); f.type="lowpass";
        if(type==="piano") { o.type="triangle"; f.frequency.value=4000; }
        else if(type==="saz") { o.type="sawtooth"; f.frequency.value=2000; }
        else if(type==="duduk") { o.type="sine"; f.frequency.value=3000; }
        else { o.type="sawtooth"; f.frequency.value=3500; }
        o.frequency.value=freq;
        g.gain.setValueAtTime(0.001,t); g.gain.linearRampToValueAtTime(vol,t+0.05); g.gain.exponentialRampToValueAtTime(vol*0.4,t+dur*0.5); g.gain.linearRampToValueAtTime(0.001,endT);
        o.connect(f); f.connect(g); g.connect(panner); o.start(t); o.stop(endT+0.1);
    }
    panner.connect(masterGain);
    if(type==="piano" || type==="saz") panner.connect(masterReverb);
  }

  // --- UI RENDER ---
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "studio");

    var ST = {
      bpm: 110,
      masterRev: 0.2, masterDel: 0.1,
      tracks: {
        kick: { grid: Array(16).fill(false), vol: 0.9, pan: 0 },
        snare: { grid: Array(16).fill(false), vol: 0.7, pan: 0 },
        hat: { grid: Array(16).fill(false), vol: 0.5, pan: 0 },
        bass: { grid: Array(16).fill(false), vol: 0.7, pan: 0, inst: "bass" },
        chords: { grid: Array(16).fill(false), vol: 0.4, pan: -0.2, inst: "strings" },
        lead: { grid: Array(16).fill(false), vol: 0.6, pan: 0.2, inst: "saz" },
        lead2: { grid: Array(16).fill(false), vol: 0.4, pan: -0.3, inst: "vocal_a" }
      },
      lyrics: ""
    };

    // Save/Load
    var saved = store.get("proj_pro_max", null);
    if(saved) ST = Object.assign(ST, saved);
    function save() { store.set("proj_pro_max", ST); }

    var SCALE = [57, 60, 62, 64, 67, 69, 72, 74];

    function build(){
      var body = '';

      body += '<div style="display:flex; justify-content:space-between; margin-bottom:10px">'
        + '<div style="font-size:16px; font-weight:900; color:var(--p1)">🎛️ HalDo Studio</div>'
        + '<button class="btn sec" id="btnSave" style="padding:6px 10px; font-size:10px">💾 Save</button>'
        + '</div>';

      body += '<div class="tabs" style="overflow-x:auto; flex-wrap:nowrap">'
        + '<button class="tab' + (tab === "studio" ? " active" : "") + '" data-mtab="studio">🎵 Sequencer</button>'
        + '<button class="tab' + (tab === "mixer" ? " active" : "") + '" data-mtab="mixer">🎚️ Mixer</button>'
        + '<button class="tab' + (tab === "ai" ? " active" : "") + '" data-mtab="ai">🤖 KI & Text</button>'
        + '</div>';

      /* ═══════════ TAB 1: SEQUENCER ═══════════ */
      if(tab === "studio"){
        body += '<div class="card" style="padding:10px; overflow-x:auto">'
          + '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">'
          + '<div style="font-size:14px; font-weight:900; color:var(--p1)">🎹 Grid</div>'
          + '<input type="number" id="bpmInp" value="' + ST.bpm + '" style="width:50px; padding:5px; text-align:center; background:rgba(0,0,0,.3); border:1px solid var(--p1); border-radius:6px; color:#fff">'
          + '</div>';

        body += '<canvas id="vizCanvas" width="400" height="40" style="width:100%; height:40px; background:rgba(0,0,0,.3); border-radius:8px; margin-bottom:10px"></canvas>';

        body += '<div style="display:grid; grid-template-columns:repeat(16, 1fr); gap:4px; min-width:450px">';
        
        var renderRow = (id, label, color) => {
            let html = '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">' + label + '</div>';
            for(let i=0; i<16; i++) {
                let active = ST.tracks[id].grid[i];
                html += '<button data-trk="'+id+'" data-idx="'+i+'" style="height:24px; background:' + (active ? color : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
            }
            return html;
        };

        body += '<div style="grid-column:1/-1; font-size:10px; color:var(--text-mute); margin-top:8px; font-weight:900">DRUMS</div>';
        ['kick','snare','hat'].forEach(d => {
          let col = d==='kick'?'#ff4d4d':(d==='snare'?'#fbbf24':'#00e5ff');
          for(let i=0; i<16; i++) {
            body += '<button data-trk="'+d+'" data-idx="'+i+'" style="height:24px; background:' + (ST.tracks[d].grid[i] ? col : "rgba(0,0,0,.3)") + '; border:none; border-radius:4px; cursor:pointer"></button>';
          }
        });

        body += renderRow("bass", "BASS", "var(--p2)");
        body += renderRow("chords", "CHORDS", "var(--p3)");
        body += renderRow("lead", "LEAD (Saz/Duduk)", "#4ade80");
        body += renderRow("lead2", "LEAD 2 (Vocals)", "#f472b6");

        body += '</div></div>';

        body += '<div class="card" style="display:flex; gap:10px">'
          + '<button class="btn sec" id="btnClear" style="flex:1">🗑️ Leeren</button>'
          + '<button class="btn" id="btnPlay" style="flex:2; background:linear-gradient(135deg,#4ade80,#00e5ff); color:#000">' + (isPlaying ? "⏹ Stop" : "▶️ Play") + '</button>'
          + '</div>';
      }

      /* ═══════════ TAB 2: MIXER ═══════════ */
      if(tab === "mixer"){
        body += '<div class="card"><h3>🎚️ Track-Mixer</h3>';
        Object.keys(ST.tracks).forEach(t => {
          body += '<div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.1)">'
            + '<div style="font-size:11px; font-weight:900; color:var(--p1); margin-bottom:6px">' + t.toUpperCase() + '</div>'
            + '<div style="display:flex; gap:10px; align-items:center">'
            + '<span style="font-size:10px; width:20px">Vol</span><input type="range" data-vol="'+t+'" min="0" max="100" value="' + (ST.tracks[t].vol*100) + '" style="flex:1">'
            + '<span style="font-size:10px; width:20px">Pan</span><input type="range" data-pan="'+t+'" min="-100" max="100" value="' + (ST.tracks[t].pan*100) + '" style="flex:1">'
            + '</div></div>';
        });
        body += '</div>';

        body += '<div class="card"><h3>✨ Master FX & Export</h3>'
          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>REVERB</span><span id="lbl_rev">' + Math.round(ST.masterRev*100) + '%</span></div>'
          + '<input type="range" id="revInp" min="0" max="100" value="' + (ST.masterRev*100) + '" style="width:100%">'
          + '</div>'
          + '<div style="margin-bottom:12px">'
          + '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px"><span>DELAY</span><span id="lbl_del">' + Math.round(ST.masterDel*100) + '%</span></div>'
          + '<input type="range" id="delInp" min="0" max="100" value="' + (ST.masterDel*100) + '" style="width:100%">'
          + '</div>'
          + '<button class="btn full" id="btnExport" style="background:var(--p3); color:#000">⬇️ Export als WAV</button>'
          + '<div id="exportStat" style="display:none; margin-top:8px; font-size:11px; text-align:center"></div>'
          + '</div>';
      }

      /* ═══════════ TAB 3: KI & TEXT ═══════════ */
      if(tab === "ai"){
        body += '<div class="card"><h3>📝 Songtext & KI</h3>'
          + '<textarea id="lyrInp" rows="4" style="width:100%; padding:10px; background:rgba(0,0,0,.3); border:1px solid var(--border-soft); border-radius:10px; color:#fff">' + _esc(ST.lyrics) + '</textarea>'
          + '<button class="btn full" id="btnGenAI" style="margin-top:8px; background:var(--p1); color:#000">✨ KI Beat & Text</button>'
          + '</div>';

        body += '<div class="card"><h3>🎤 Instrument für Lead</h3>'
          + '<select id="leadInst" style="width:100%; padding:10px; background:rgba(0,0,0,.3); border-radius:10px; color:#fff">'
          + '<option value="saz"' + (ST.tracks.lead.inst==="saz"?" selected":"") + '>Saz (Orientalisch)</option>'
          + '<option value="duduk"' + (ST.tracks.lead.inst==="duduk"?" selected":"") + '>Duduk (Weich)</option>'
          + '<option value="piano"' + (ST.tracks.lead.inst==="piano"?" selected":"") + '>Klavier</option>'
          + '</select>'
          + '<div style="font-size:10px; color:var(--text-mute); margin-top:8px">Lead 2 ist immer Vocal Synth (A).</div>'
          + '</div>';
      }

      container.innerHTML = body;

      // Events
      container.querySelectorAll("[data-mtab]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.mtab; store.set("tab", tab); build(); });
      });
      container.querySelector("#btnSave").addEventListener("click", function(){ save(); if(window.HalDo.Notify) HalDo.Notify.success("Gespeichert!"); });

      if(tab === "studio"){
        // Visualizer
        var cvs = container.querySelector("#vizCanvas"), cCtx = cvs.getContext("2d");
        var vizData = new Uint8Array(32);
        function draw(){ if(!cvs) return; vizAnimId = requestAnimationFrame(draw); cCtx.clearRect(0,0,cvs.width,cvs.height); if(analyser && isPlaying){ analyser.getByteFrequencyData(vizData); let bw = (cvs.width/vizData.length)*2, x=0; for(let i=0;i<vizData.length;i++){ let h=(vizData[i]/255)*cvs.height; cCtx.fillStyle="var(--p1)"; cCtx.fillRect(x,cvs.height-h,bw/1.5,h); x+=bw; } } } draw();

        container.querySelector("#bpmInp").addEventListener("change", function(){ ST.bpm = parseFloat(this.value) || 110; save(); });

        container.querySelectorAll("[data-trk]").forEach(btn => {
          btn.addEventListener("click", function() {
            let trk = this.dataset.trk, idx = this.dataset.idx;
            ST.tracks[trk].grid[idx] = !ST.tracks[trk].grid[idx];
            save(); build();
          });
        });

        container.querySelector("#btnClear").addEventListener("click", function(){
          Object.keys(ST.tracks).forEach(k => ST.tracks[k].grid.fill(false));
          save(); build();
        });
        container.querySelector("#btnPlay").addEventListener("click", togglePlay);
      }

      if(tab === "mixer"){
        container.querySelectorAll("[data-vol]").forEach(s => s.addEventListener("input", function(){ ST.tracks[this.dataset.vol].vol = this.value/100; save(); }));
        container.querySelectorAll("[data-pan]").forEach(s => s.addEventListener("input", function(){ ST.tracks[this.dataset.pan].pan = this.value/100; save(); }));
        
        container.querySelector("#revInp").addEventListener("input", function(){ ST.masterRev = this.value/100; container.querySelector("#lbl_rev").textContent = this.value+"%"; save(); });
        container.querySelector("#delInp").addEventListener("input", function(){ ST.masterDel = this.value/100; container.querySelector("#lbl_del").textContent = this.value+"%"; save(); });
        
        container.querySelector("#btnExport").addEventListener("click", exportWav);
      }

      if(tab === "ai"){
        container.querySelector("#lyrInp").addEventListener("input", function(){ ST.lyrics = this.value; save(); });
        container.querySelector("#leadInst").addEventListener("change", function(){ ST.tracks.lead.inst = this.value; save(); });
        
        container.querySelector("#btnGenAI").addEventListener("click", async function() {
          this.disabled = true; this.textContent = "⏳ KI arbeitet...";
          try {
            if(!ST.lyrics) {
              ST.lyrics = await HalDo.AI.writeLyrics("Ein episches Lied über Hoffnung", "Deutsch", "Pop", "emotional");
            }
            ST.tracks.kick.grid.fill(false).forEach((_, i) => ST.tracks.kick.grid[i] = (i % 4 === 0));
            ST.tracks.snare.grid.fill(false).forEach((_, i) => ST.tracks.snare.grid[i] = (i % 8 === 4));
            ST.tracks.hat.grid.fill(false).forEach((_, i) => ST.tracks.hat.grid[i] = (i % 2 === 0));
            ST.tracks.bass.grid.fill(false).forEach((_, i) => ST.tracks.bass.grid[i] = (i % 4 === 0));
            ST.tracks.chords.grid.fill(false).forEach((_, i) => ST.tracks.chords.grid[i] = (i === 0 || i === 6 || i === 10));
            ST.tracks.lead.grid.fill(false).forEach((_, i) => ST.tracks.lead.grid[i] = [0, 3, 7, 11, 14].includes(i));
            ST.tracks.lead2.grid.fill(false).forEach((_, i) => ST.tracks.lead2.grid[i] = [5, 9, 13].includes(i));
            
            save(); build();
            if(window.HalDo.Notify) HalDo.Notify.success("KI Beat & Text generiert!");
          } catch(e) { alert(e.message); }
          this.disabled = false; this.textContent = "✨ KI Beat & Text";
        });
      }
    }

    function togglePlay() {
      if (isPlaying) {
        clearInterval(loopInterval); isPlaying = false; build();
      } else {
        initAudio(); isPlaying = true; currentStep = 0; build();
        var stepDur = (60 / ST.bpm) / 4;
        loopInterval = setInterval(() => {
          if(ST.tracks.kick.grid[currentStep]) playKick(ST.tracks.kick.vol);
          if(ST.tracks.snare.grid[currentStep]) playSnare(ST.tracks.snare.vol);
          if(ST.tracks.hat.grid[currentStep]) playHat(ST.tracks.hat.vol);

          if(ST.tracks.bass.grid[currentStep]) playNote(440 * Math.pow(2, (45 - 69)/12), stepDur * 2, ST.tracks.bass.vol, "bass", ST.tracks.bass.pan);
          if(ST.tracks.chords.grid[currentStep]) {
            [57, 60, 64].forEach(n => playNote(440 * Math.pow(2, (n - 69)/12), stepDur * 4, ST.tracks.chords.vol, "strings", ST.tracks.chords.pan));
          }
          if(ST.tracks.lead.grid[currentStep]) {
            let note = SCALE[currentStep % SCALE.length];
            playNote(440 * Math.pow(2, (note - 69)/12), stepDur * 2, ST.tracks.lead.vol, ST.tracks.lead.inst, ST.tracks.lead.pan);
          }
          if(ST.tracks.lead2.grid[currentStep]) {
            let note2 = SCALE[(currentStep + 2) % SCALE.length] + 12;
            playNote(440 * Math.pow(2, (note2 - 69)/12), stepDur * 1.5, ST.tracks.lead2.vol, "vocal_a", ST.tracks.lead2.pan);
          }
          currentStep = (currentStep + 1) % 16;
        }, stepDur * 1000);
      }
    }

    // --- EXPORT ---
    function audioBufferToWav(buffer) {
      var nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate, ba = nCh*2, br = sr*ba, ds = len*ba;
      var ab = new ArrayBuffer(44+ds), view = new DataView(ab);
      function wr(o, s) { for (var i = 0; i < s.length; i++) view.setUint8(o+i, s.charCodeAt(i)); }
      wr(0,"RIFF"); view.setUint32(4,36+ds,true); wr(8,"WAVE"); wr(12,"fmt "); view.setUint32(16,16,true); view.setUint16(20,1,true); view.setUint16(22,nCh,true); view.setUint32(24,sr,true); view.setUint32(28,br,true); view.setUint16(32,ba,true); view.setUint16(34,16,true); wr(36,"data"); view.setUint32(40,ds,true);
      var chs=[]; for(var c=0;c<nCh;c++) chs.push(buffer.getChannelData(c));
      var off=44; for(var i=0;i<len;i++) for(var c=0;c<nCh;c++){ var s=Math.max(-1,Math.min(1,chs[c][i])); view.setInt16(off,s<0?s*0x8000:s*0x7FFF,true); off+=2; }
      return new Blob([ab],{type:"audio/wav"});
    }

    async function exportWav() {
      var btn = document.querySelector("#btnExport"), stat = document.querySelector("#exportStat");
      btn.disabled = true; stat.style.display = "block"; stat.textContent = "⏳ Rendere...";

      try {
        var stepDur = (60 / ST.bpm) / 4, totalDur = 16 * stepDur;
        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, Math.ceil(totalDur * 44100), 44100);
        var master = offCtx.createGain(); master.gain.value = 0.8; master.connect(offCtx.destination);

        for(var i = 0; i < 16; i++) {
          var time = i * stepDur;
          
          // Einfacher Offline-Kick/Snare/Hat
          if(ST.tracks.kick.grid[i]) { var o=offCtx.createOscillator(), g=offCtx.createGain(); o.type="sine"; o.frequency.setValueAtTime(150,time); o.frequency.exponentialRampToValueAtTime(40,time+0.1); g.gain.setValueAtTime(ST.tracks.kick.vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.2); o.connect(g); g.connect(master); o.start(time); o.stop(time+0.25); }
          if(ST.tracks.snare.grid[i]) { var bs=Math.floor(offCtx.sampleRate*0.2), buf=offCtx.createBuffer(1,bs,offCtx.sampleRate), d=buf.getChannelData(0); for(var j=0;j<bs;j++) d[j]=(Math.random()*2-1)*Math.pow(1-j/bs,3); var s=offCtx.createBufferSource(); s.buffer=buf; var g=offCtx.createGain(); g.gain.setValueAtTime(ST.tracks.snare.vol,time); g.gain.exponentialRampToValueAtTime(0.001,time+0.15); s.connect(g); g.connect(master); s.start(time); s.stop(time+0.2); }
          
          // Offline-Synth Noten
          var playOffNote = (freq, dur, vol) => { if(vol<=0.001)return; var o=offCtx.createOscillator(), g=offCtx.createGain(), f=offCtx.createBiquadFilter(); o.type="sawtooth"; f.type="lowpass"; f.frequency.value=3000; o.frequency.value=freq; g.gain.setValueAtTime(0.001,time); g.gain.linearRampToValueAtTime(vol,time+0.05); g.gain.linearRampToValueAtTime(0.001,time+dur); o.connect(f); f.connect(g); g.connect(master); o.start(time); o.stop(time+dur+0.1); };

          if(ST.tracks.bass.grid[i]) playOffNote(440 * Math.pow(2, (45 - 69)/12), stepDur * 2, ST.tracks.bass.vol);
          if(ST.tracks.chords.grid[i]) [57,60,64].forEach(n => playOffNote(440 * Math.pow(2, (n - 69)/12), stepDur * 4, ST.tracks.chords.vol));
          if(ST.tracks.lead.grid[i]) { let n = SCALE[i%SCALE.length]; playOffNote(440 * Math.pow(2, (n - 69)/12), stepDur * 2, ST.tracks.lead.vol); }
        }

        var rendered = await offCtx.startRendering();
        var wav = audioBufferToWav(rendered);
        var url = URL.createObjectURL(wav);
        var a = document.createElement("a"); a.href = url; a.download = "haldo-song.wav"; a.click();
        stat.textContent = "✅ WAV heruntergeladen!"; btn.disabled = false;
      } catch(e) { stat.textContent = "❌ " + e.message; btn.disabled = false; }
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v21.0 geladen — ULTIMATE STUDIO");
})();
