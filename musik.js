/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v201) · FULL KI-STUDIO
   Lokale KI · 21 Instrumente · Ezidi · Kurdisch · Alle Sprachen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INSTRUMENT-ENGINE (Web Audio)
     ═══════════════════════════════════════════════════════════ */
  function makeDistCurve(amount){
    var k = amount * 100, n = 44100;
    var curve = new Float32Array(n);
    for(var i = 0; i < n; i++){
      var x = (i * 2) / n - 1;
      curve[i] = (3 + k) * x * 20 * (Math.PI / 180) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function makeIR(ctx, dur){
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for(var c = 0; c < 2; c++){
      var d = buf.getChannelData(c);
      for(var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    return buf;
  }

  function fmtTime(s){
    if(!s || isNaN(s) || !isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    var x = Math.floor(s % 60);
    return m + ":" + (x < 10 ? "0" : "") + x;
  }

  function bufToWav(buffer){
    var nCh = buffer.numberOfChannels, len = buffer.length, sr = buffer.sampleRate;
    var ba = nCh * 2, br = sr * ba, ds = len * ba;
    var ab = new ArrayBuffer(44 + ds), view = new DataView(ab);
    function wr(o, s){ for(var i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); }
    wr(0, "RIFF"); view.setUint32(4, 36 + ds, true); wr(8, "WAVE"); wr(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, nCh, true);
    view.setUint32(24, sr, true); view.setUint32(28, br, true); view.setUint16(32, ba, true);
    view.setUint16(34, 16, true); wr(36, "data"); view.setUint32(40, ds, true);
    var chs = [];
    for(var c = 0; c < nCh; c++) chs.push(buffer.getChannelData(c));
    var off = 44;
    for(var i = 0; i < len; i++){
      for(var c2 = 0; c2 < nCh; c2++){
        var s = Math.max(-1, Math.min(1, chs[c2][i]));
        view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        off += 2;
      }
    }
    return new Blob([ab], { type: "audio/wav" });
  }

  /* ═══════════════════════════════════════════════════════════
     INSTRUMENTAL-GENERATOR (21 Instrumente)
     ═══════════════════════════════════════════════════════════ */
  async function renderInstrumental(style, key, mode, durationSec, instruments){
    durationSec = Math.max(10, Math.min(durationSec || 120, 600));
    instruments = instruments || ["baglama", "duduk", "darbuka", "bass"];

    var NOTE_FREQ = {};
    (function(){
      var n = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
      for(var o = 0; o <= 8; o++) for(var i = 0; i < 12; i++){
        NOTE_FREQ[n[i] + o] = 440 * Math.pow(2, (o * 12 + i - 57) / 12);
      }
    })();
    function nf(n){ return NOTE_FREQ[n] || 440; }
    function mn(m){ var n = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; return n[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1); }

    var SC = {
      major: [0,2,4,5,7,9,11], minor: [0,2,3,5,7,8,10],
      pentatonic: [0,2,4,7,9], hijaz: [0,1,4,5,7,8,11],
      bayati: [0,1,3,5,7,8,10], kurd: [0,1,3,5,7,8,10],
      saba: [0,1,3,4,6,8,10], rast: [0,2,4,5,7,9,10]
    };
    var KR = { C:0, D:2, E:4, F:5, G:7, A:9, Bb:10 };

    var STYLE_MAP = {
      stran:    { chord: "strings", mel: "baglama", dr: 0.7, rv: 0.4, pr: "i-VI-III-VII", mo: "bayati" },
      helbest:  { chord: "strings", mel: "ney",     dr: 0.4, rv: 0.45, pr: "i-VI-III-VII", mo: "bayati" },
      ezidi:    { chord: "strings", mel: "duduk",   dr: 0.4, rv: 0.45, pr: "i-VI-III-VII", mo: "bayati" },
      dengbej:  { chord: "strings", mel: "keman",   dr: 0.5, rv: 0.4, pr: "i-VI-III-VII", mo: "kurd" },
      arabesk:  { chord: "strings", mel: "keman",   dr: 0.9, rv: 0.4, pr: "i-VI-III-VII", mo: "hijaz" },
      turku:    { chord: "strings", mel: "kanun",   dr: 1.0, rv: 0.35, pr: "i-VI-III-VII", mo: "hijaz" },
      pop:      { chord: "piano",   mel: "piano",   dr: 1.0, rv: 0.3, pr: "I-V-vi-IV",   mo: "major" },
      rock:     { chord: "guitar",  mel: "guitar",  dr: 1.3, rv: 0.2, pr: "I-IV-V-I",    mo: "minor" },
      rap:      { chord: "piano",   mel: "piano",   dr: 1.4, rv: 0.15, pr: "i-VI-III-VII", mo: "minor" },
      edm:      { chord: "synth",   mel: "synth",   dr: 1.4, rv: 0.2, pr: "vi-IV-I-V",   mo: "minor" },
      ballade:  { chord: "piano",   mel: "keman",   dr: 0.5, rv: 0.4, pr: "vi-IV-I-V",   mo: "minor" },
      lofi:     { chord: "piano",   mel: "flute",   dr: 0.6, rv: 0.5, pr: "vi-IV-I-V",   mo: "minor" },
      klassik:  { chord: "strings", mel: "flute",   dr: 0, rv: 0.5, pr: "I-IV-V-I",    mo: "major" },
      epic:     { chord: "strings", mel: "brass",   dr: 1.2, rv: 0.45, pr: "i-VI-III-VII", mo: "minor" }
    };

    var PR = { "I-V-vi-IV": [0,4,5,3], "vi-IV-I-V": [5,3,0,4], "I-IV-V-I": [0,3,4,0], "i-VI-III-VII": [0,5,2,6] };

    var sp = STYLE_MAP[(style || "pop").toLowerCase()] || STYLE_MAP.pop;
    var root = 60 + (KR[key] || 0);
    var md = mode || sp.mo || "major";
    var iv = SC[md] || SC.major;
    var scale = iv.map(function(i){ return root + i; });
    var prog = PR[sp.pr] || PR["I-V-vi-IV"];
    var tempo = 110, bd = 60 / tempo, bar = bd * 4;

    var targetBars = Math.max(4, Math.floor(durationSec / bar));
    var structure = [], remaining = targetBars, introDone = false;
    while(remaining > 0){
      if(!introDone && remaining >= 4){ structure.push("intro"); remaining -= 4; introDone = true; }
      else if(remaining >= 8){ structure.push(structure.length % 2 === 0 ? "verse" : "chorus"); remaining -= 8; }
      else if(remaining >= 4){ structure.push("outro"); remaining -= 4; break; }
      else break;
    }
    if(!structure.length) structure = ["intro", "verse", "chorus", "outro"];

    var totDur = structure.reduce(function(a, s){
      var b = (s === "intro" || s === "outro") ? 4 : 8;
      return a + b;
    }, 0) * bar + 2;

    var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    var ctx = new OAC(2, Math.ceil(totDur * 44100), 44100);

    var mg = ctx.createGain(); mg.gain.value = 1.8;
    var cp = ctx.createDynamicsCompressor();
    mg.connect(cp); cp.connect(ctx.destination);

    var rb = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.2), ctx.sampleRate);
    for(var cc = 0; cc < 2; cc++){
      var dd = rb.getChannelData(cc);
      for(var ii = 0; ii < dd.length; ii++) dd[ii] = (Math.random() * 2 - 1) * Math.pow(1 - ii / dd.length, 2.5);
    }
    var rv = ctx.createConvolver(); rv.buffer = rb;
    var rg = ctx.createGain(); rg.gain.value = sp.rv;
    rv.connect(rg); rg.connect(mg);

    var dg = ctx.createGain(); dg.gain.value = 1 - sp.rv * 0.4;
    dg.connect(mg);

    function hasI(i){ return instruments.indexOf(i) !== -1; }

    function inst(dest, freq, st, dur, amp, type){
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var g = ctx.createGain();
      var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 1;

      switch(type){
        case "piano": o1.type = "triangle"; o2.type = "sine"; o2.detune.value = 2; f.frequency.value = 4200; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.015); g.gain.exponentialRampToValueAtTime(amp * 0.3, st + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "guitar": o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = -5; f.frequency.value = 2800; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.008); g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "strings": o1.type = "sawtooth"; o2.type = "sawtooth"; o2.detune.value = 8; f.frequency.value = 3200; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.35); g.gain.setValueAtTime(amp, st + Math.max(0.4, dur - 0.25)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "bass": o1.type = "triangle"; o2.type = "sine"; f.frequency.value = 900; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.02); g.gain.setValueAtTime(amp * 0.9, st + Math.max(0.1, dur - 0.1)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "synth": o1.type = "square"; o2.type = "sawtooth"; o2.detune.value = 12; f.frequency.value = 3800; f.Q.value = 4; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.05); g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "bells": o1.type = "sine"; o2.type = "sine"; o2.detune.value = 1200; f.frequency.value = 9000; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, st + dur * 1.5); break;
        case "flute": o1.type = "sine"; o2.type = "triangle"; o2.detune.value = 5; f.frequency.value = 6500; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.08); g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.1)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "brass": o1.type = "sawtooth"; o2.type = "square"; o2.detune.value = 3; f.frequency.value = 4800; f.Q.value = 2; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.06); g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.1)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "baglama": o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = -6; f.frequency.value = 2400; f.Q.value = 2; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.01); g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "saz": o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 6; f.frequency.value = 2600; f.Q.value = 2.5; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.01); g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.45); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "kemence": o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 10; f.frequency.value = 3000; f.Q.value = 3; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.05); g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "keman": o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 4; f.frequency.value = 3400; f.Q.value = 2; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.08); g.gain.setValueAtTime(amp, st + Math.max(0.3, dur - 0.2)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "kanun": o1.type = "triangle"; o2.type = "sine"; o2.detune.value = 3; f.frequency.value = 5000; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.005); g.gain.exponentialRampToValueAtTime(amp * 0.35, st + dur * 0.6); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "zurna": o1.type = "sawtooth"; o2.type = "square"; o2.detune.value = 5; f.frequency.value = 4000; f.Q.value = 3; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.04); g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.12)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "ney": o1.type = "sine"; o2.type = "triangle"; o2.detune.value = 8; f.frequency.value = 5500; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.15); g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        case "duduk": o1.type = "sine"; o2.type = "sawtooth"; o2.detune.value = 4; f.frequency.value = 3500; f.Q.value = 1.5; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.12); g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15)); g.gain.linearRampToValueAtTime(0.0001, st + dur); break;
        default: o1.type = "triangle"; f.frequency.value = 4000; g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.02); g.gain.linearRampToValueAtTime(0.0001, st + dur);
      }

      o1.frequency.value = freq; o2.frequency.value = freq;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(dest);
      o1.start(st); o1.stop(st + dur + 0.05);
      o2.start(st); o2.stop(st + dur + 0.05);
    }

    function kick(dest, t, amp){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.13);
      g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35);
    }
    function snare(dest, t, amp){
      var bs = Math.floor(ctx.sampleRate * 0.2);
      var buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 3);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
      s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.22);
    }
    function hat(dest, t, amp){
      var bs = Math.floor(ctx.sampleRate * 0.06);
      var buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 2);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var g = ctx.createGain(); g.gain.setValueAtTime(amp, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
      s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + 0.1);
    }

    var t = 0;
    structure.forEach(function(sec){
      var bars = (sec === "intro" || sec === "outro") ? 4 : 8;
      var sA = sec === "intro" ? 0.7 : sec === "outro" ? 0.6 : 1.0;

      for(var b2 = 0; b2 < bars; b2++){
        var ci = prog[b2 % prog.length];
        var cn = [];
        for(var i2 = 0; i2 < 3; i2++) cn.push(scale[(ci + i2 * 2) % scale.length] + Math.floor((ci + i2 * 2) / scale.length) * 12);
        var bs2 = t;

        cn.forEach(function(n){
          if(hasI("piano")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.3 * sA, "piano");
          if(hasI("strings")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.25 * sA, "strings");
          if(hasI("guitar")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.3 * sA, "guitar");
          if(hasI("synth")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.22 * sA, "synth");
          if(hasI("baglama")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "baglama");
          if(hasI("saz")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "saz");
          if(hasI("kanun")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "kanun");
          inst(rv, nf(mn(n)), bs2, bar * 0.95, 0.15 * sA, "piano");
        });

        if(hasI("bass")){
          var bn = cn[0] - 24;
          inst(dg, nf(mn(bn)), bs2, bar * 0.45, 0.55 * sA, "bass");
          inst(dg, nf(mn(bn)), bs2 + bar * 0.5, bar * 0.4, 0.5 * sA, "bass");
        }

        for(var m = 0; m < 8; m++){
          var mt = bs2 + m * (bar / 8);
          var idx = (b2 + m) % scale.length;
          var mnn = scale[idx] + ((b2 + m) % 3 === 0 ? 12 : 0);
          var melType = sp.mel;
          if(hasI("keman")) melType = "keman";
          else if(hasI("kemence")) melType = "kemence";
          else if(hasI("duduk")) melType = "duduk";
          else if(hasI("ney")) melType = "ney";
          else if(hasI("zurna")) melType = "zurna";
          if(hasI("flute") || hasI("ney") || hasI("duduk") || hasI("zurna") || hasI("keman") || hasI("kemence") || hasI("baglama") || hasI("saz") || hasI("kanun")) inst(dg, nf(mn(mnn)), mt, (bar / 8) * 0.65, 0.28 * sA, melType);
        }

        if(hasI("drums") && sp.dr > 0){
          var dA = sp.dr * sA * 0.7;
          kick(dg, bs2, 0.8 * dA); kick(dg, bs2 + bar * 0.5, 0.7 * dA);
          if(sec === "chorus"){ snare(dg, bs2 + bar * 0.25, 0.5 * dA); snare(dg, bs2 + bar * 0.75, 0.5 * dA); }
          for(var h = 0; h < 8; h++) hat(dg, bs2 + h * (bar / 8), 0.22 * dA);
        }
        if(hasI("darbuka")){
          var dA2 = 0.6 * sA;
          kick(dg, bs2, 0.7 * dA2); kick(dg, bs2 + bar * 0.5, 0.6 * dA2);
          snare(dg, bs2 + bar * 0.25, 0.4 * dA2); snare(dg, bs2 + bar * 0.75, 0.4 * dA2);
        }
        if(hasI("davul")){ kick(dg, bs2, 0.9 * sA); kick(dg, bs2 + bar * 0.5, 0.8 * sA); }
        if(hasI("tabla")){ for(var tb = 0; tb < 4; tb++) kick(dg, bs2 + tb * (bar / 4), 0.3 * sA); snare(dg, bs2 + bar * 0.5, 0.5 * sA); }
        if(hasI("def")){ for(var df = 0; df < 8; df++) hat(dg, bs2 + df * (bar / 8), 0.35 * sA); }
      }
      t += bars * bar;
    });

    return ctx.startRendering().then(function(rendered){ return bufToWav(rendered); });
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER UI
     ═══════════════════════════════════════════════════════════ */
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "ki");

    var ST = {
      playlist: store.get("playlist", []),
      current: store.get("current", -1),
      playing: false,
      volume: store.get("volume", 0.9),
      ki: store.get("ki", {
        songDesc: "", lyrics: "", lang: "Kurdisch (Kurmanji)", style: "Stran",
        mood: "nachdenklich", duration: 180, instruments: ["baglama", "duduk", "darbuka", "bass"],
        tempo: 110
      })
    };

    function save(){ store.set("playlist", ST.playlist); store.set("ki", ST.ki); store.set("volume", ST.volume); }

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "ki" ? " active" : "") + '" data-mtab="ki">🤖 KI-Studio</button>'
        + '<button class="tab' + (tab === "player" ? " active" : "") + '" data-mtab="player">▶️ Player</button>'
        + '<button class="tab' + (tab === "karaoke" ? " active" : "") + '" data-mtab="karaoke">🎤 Karaoke</button>'
        + '<button class="tab" data-mtab="settings">⚙️</button>'
        + '</div>';

      /* ═══ KI-STUDIO ═══ */
      if(tab === "ki"){
        var k = ST.ki;

        body += '<div class="card"><h3>📝 Song-Beschreibung</h3>'
          + '<textarea id="ki_desc" rows="2" placeholder="Beschreibe deinen Song..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.songDesc) + '</textarea>'
          + '</div>';

        body += '<div class="card"><h3>📄 Songtext</h3>'
          + '<textarea id="ki_lyrics" rows="8" placeholder="Songtext hier oder via KI generieren..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn" data-ki-act="generate" style="font-size:10.5px;padding:8px 10px;flex:1">✨ KI-Generieren</button>'
          + '<button class="btn sec" data-ki-act="rewrite" style="font-size:10.5px;padding:8px 10px">🔄 Umform.</button>'
          + '<button class="btn sec" data-ki-act="correct" style="font-size:10.5px;padding:8px 10px">✅ Korrig.</button>'
          + '<button class="btn sec" data-ki-act="translate" style="font-size:10.5px;padding:8px 10px">🌍 Übers.</button>'
          + '</div>'
          + '<div id="ki_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.08);border-radius:8px;font-size:11px;color:var(--text-dim)"></div>'
          + '</div>';

        body += '<div class="card"><h3>🌍 Sprache</h3>'
          + selectField("ki_lang", k.lang, [
            ["Kurdisch (Kurmanji)", "🦚 Kurmanji"],
            ["Kurdisch (Sorani)", "🦚 Sorani"],
            ["Ezidi (Êzidî)", "🦚 Ezidi"],
            ["Türkisch", "🇹🇷 Türkisch"],
            ["Arabisch", "🇸🇦 Arabisch"],
            ["Persisch", "🇮🇷 Persisch"],
            ["Deutsch", "🇩🇪 Deutsch"],
            ["Englisch", "🇬🇧 Englisch"],
            ["Französisch", "🇫🇷 Französisch"],
            ["Spanisch", "🇪🇸 Spanisch"],
            ["Italienisch", "🇮🇹 Italienisch"],
            ["Russisch", "🇷🇺 Russisch"],
            ["Griechisch", "🇬🇷 Griechisch"],
            ["Hindi", "🇮🇳 Hindi"]
          ])
          + '</div>';

        body += '<div class="card"><h3>🎯 Musik-Stil</h3>'
          + selectField("ki_style", k.style, [
            ["Stran", "🦚 Stran"],
            ["Helbest", "🦚 Helbest"],
            ["Ezidi", "🦚 Ezidi"],
            ["Dengbêj", "🦚 Dengbêj"],
            ["Arabesk", "🇹🇷 Arabesk"],
            ["Türkü", "🇹🇷 Türkü"],
            ["Pop", "Pop"],
            ["Rock", "Rock"],
            ["Rap", "Rap"],
            ["EDM", "EDM"],
            ["Ballade", "Ballade"],
            ["Lo-Fi", "Lo-Fi"],
            ["Klassik", "Klassik"],
            ["Epic", "Epic"]
          ])
          + '</div>';

        body += '<div class="card"><h3>💫 Stimmung</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
        [["nachdenklich","🤔","Nachdenklich"],["romantisch","💖","Romantisch"],["traurig","😢","Traurig"],["fröhlich","🎉","Fröhlich"],["episch","⚔️","Episch"],["ruhig","😌","Ruhig"],["energiegeladen","⚡","Energie"],["spirituell","✨","Spirituell"]].forEach(function(m){
          var sel = k.mood === m[0];
          body += '<button type="button" data-mood="' + m[0] + '" style="padding:10px 4px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;font-size:10px;font-weight:800">'
            + '<div style="font-size:16px">' + m[1] + '</div>' + m[2]
            + '</button>';
        });
        body += '</div></div>';

        /* 21 Instrumente */
        var instrs = [
          ["baglama","🪕","Bağlama"], ["saz","🪕","Saz"], ["kemence","🎻","Kemence"],
          ["keman","🎻","Keman"], ["kanun","🎼","Kanun"], ["zurna","🎺","Zurna"],
          ["ney","🎶","Ney"], ["duduk","🎺","Duduk"], ["flute","🪈","Flöte"],
          ["davul","🥁","Davul"], ["darbuka","🥁","Darbuka"], ["tabla","🥁","Tabla"],
          ["def","🔔","Def"], ["piano","🎹","Klavier"], ["guitar","🎸","Gitarre"],
          ["strings","🎻","Streicher"], ["bass","🎵","Bass"], ["drums","🥁","Drums"],
          ["synth","🎛️","Synth"], ["bells","🔔","Bells"], ["brass","🎺","Bläser"]
        ];
        body += '<div class="card"><h3>🎼 Instrumente (' + k.instruments.length + '/' + instrs.length + ')</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">';
        instrs.forEach(function(it){
          var sel = k.instruments.indexOf(it[0]) !== -1;
          body += '<button type="button" data-instr="' + it[0] + '" style="padding:8px 3px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:9px;font-weight:700">'
            + '<div style="font-size:14px;margin-bottom:2px">' + it[1] + '</div>' + it[2] + '</button>';
        });
        body += '</div></div>';

        /* Dauer */
        body += '<div class="card"><h3>⏱️ Dauer</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px">';
        [30,60,90,120,180,240,300,360,420,480].forEach(function(d){
          var sel = k.duration === d;
          body += '<button type="button" data-dur="' + d + '" style="padding:10px 2px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;font-size:10px;font-weight:900">'
            + (d < 60 ? d + "s" : (d/60) + "min") + '</button>';
        });
        body += '</div></div>';

        body += '<button class="btn full" id="ki_create" style="background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:14px;padding:14px">🎵 Song generieren</button>'
          + '<div id="ki_createStatus" style="display:none;margin-top:10px;padding:12px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11.5px;line-height:1.5"></div>';
      }

      /* ═══ PLAYER ═══ */
      if(tab === "player"){
        var cur = ST.playlist[ST.current];
        body += '<div class="card">'
          + '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:12px;text-align:center;border:1.5px solid var(--p1);margin-bottom:12px">'
          + '<div style="font-size:56px">🎵</div>'
          + '<div style="font-size:14px;font-weight:900;color:var(--p1);margin-top:8px">' + (cur ? _esc(cur.name) : "Kein Track") + '</div>'
          + '</div>';
        if(cur && cur.url){
          body += '<audio id="m_audio" controls src="' + _esc(cur.url) + '" style="width:100%;border-radius:10px"></audio>';
        }
        body += '</div>';

        body += '<div class="card"><h3>📋 Playlist (' + ST.playlist.length + ')</h3>';
        if(!ST.playlist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:11.5px">Noch keine Tracks</div>';
        } else {
          ST.playlist.forEach(function(t, i){
            var isA = i === ST.current;
            body += '<div style="padding:10px;background:' + (isA ? "rgba(0,229,255,.1)" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (isA ? "var(--p1)" : "transparent") + ';border-radius:8px;margin-bottom:4px;display:flex;gap:8px;align-items:center">'
              + '<div data-play="' + i + '" style="flex:1;cursor:pointer;font-size:12px;font-weight:800">' + _esc(t.name) + '</div>'
              + '<button data-del="' + i + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      /* ═══ KARAOKE ═══ */
      if(tab === "karaoke"){
        body += '<div class="card"><h3>🎤 Karaoke</h3>'
          + '<div style="padding:14px;background:rgba(0,0,0,.4);border-radius:10px;font-size:14px;line-height:2;white-space:pre-wrap;max-height:400px;overflow-y:auto;font-family:monospace">'
          + (ST.ki.lyrics ? _esc(ST.ki.lyrics) : "Kein Songtext. Generiere erst einen im KI-Studio!")
          + '</div></div>';
      }

      /* ═══ SETTINGS ═══ */
      if(tab === "settings"){
        body += '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🎵 TRACKS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + ST.playlist.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-top:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.6">'
          + '🎼 <b>21 Instrumente</b> · <b>14 Sprachen</b> · <b>14 Stile</b> · KI via HalDo AI'
          + '</div></div>'
          + '<button class="btn danger full" id="m_clear" style="margin-top:10px">🗑️ Alle Tracks löschen</button>'
          + '</div>';
      }

      container.innerHTML = body;

      /* ═══ EVENTS ═══ */
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.mtab; store.set("tab", tab); build();
        });
      });

      /* KI-Studio */
      if(tab === "ki"){
        var ki = ST.ki;

        container.querySelector("#ki_desc").addEventListener("input", function(){ ki.songDesc = this.value; save(); });
        container.querySelector("#ki_lyrics").addEventListener("input", function(){ ki.lyrics = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ ki.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ ki.style = this.value; save(); });

        /* Mood */
        container.querySelectorAll("[data-mood]").forEach(function(b){
          b.addEventListener("click", function(){ ki.mood = b.dataset.mood; save(); build(); });
        });

        /* Instrumente */
        container.querySelectorAll("[data-instr]").forEach(function(b){
          b.addEventListener("click", function(){
            var id = b.dataset.instr;
            var idx = ki.instruments.indexOf(id);
            if(idx === -1) ki.instruments.push(id);
            else ki.instruments.splice(idx, 1);
            save(); build();
          });
        });

        /* Dauer */
        container.querySelectorAll("[data-dur]").forEach(function(b){
          b.addEventListener("click", function(){ ki.duration = parseInt(b.dataset.dur); save(); build(); });
        });

        /* KI-Aktionen */
        container.querySelectorAll("[data-ki-act]").forEach(function(b){
          b.addEventListener("click", async function(){
            var act = b.dataset.kiAct;
            var stat = container.querySelector("#ki_status");
            stat.style.display = "block";
            stat.textContent = "⏳ KI arbeitet (dauert ~20-60s)...";
            b.disabled = true;

            try {
              if(!HalDo.AI) throw new Error("KI-Service nicht geladen");

              var result = "";
              if(act === "generate"){
                result = await HalDo.AI.writeLyrics(ki.songDesc || "Liebe und Hoffnung", ki.lang, ki.style, ki.mood);
              } else if(act === "rewrite"){
                if(!ki.lyrics) throw new Error("Kein Text zum Umformulieren");
                result = await HalDo.AI.rewrite(ki.lyrics, ki.style);
              } else if(act === "correct"){
                if(!ki.lyrics) throw new Error("Kein Text zum Korrigieren");
                result = await HalDo.AI.correct(ki.lyrics);
              } else if(act === "translate"){
                if(!ki.lyrics) throw new Error("Kein Text zum Übersetzen");
                result = await HalDo.AI.translate(ki.lyrics, ki.lang);
              }

              container.querySelector("#ki_lyrics").value = result;
              ki.lyrics = result;
              save();
              stat.innerHTML = "✅ Fertig! (" + result.length + " Zeichen)";
              if(HalDo.Notify) HalDo.Notify.success("✨ Songtext fertig!", { app: "musik" });
            } catch(e){
              stat.innerHTML = "❌ " + e.message;
            }
            b.disabled = false;
          });
        });

        /* Song generieren */
        container.querySelector("#ki_create").addEventListener("click", async function(){
          var btn = this;
          var stat = container.querySelector("#ki_createStatus");
          stat.style.display = "block";
          stat.innerHTML = "⏳ Generiere Instrumental...";
          btn.disabled = true;

          try {
            var styleKey = ki.style.toLowerCase().replace(/[^a-z]/g, "");
            var blob = await renderInstrumental(styleKey, "G", "minor", ki.duration, ki.instruments);
            var url = URL.createObjectURL(blob);

            ST.playlist.push({
              name: "🎼 " + ki.style + " · " + ki.lang + " · " + (ki.duration/60).toFixed(1) + "min",
              url: url,
              dur: ki.duration,
              date: new Date().toLocaleString("de-DE")
            });
            save();
            stat.innerHTML = "✅ Song fertig! Wechsle zu Player.";
            if(HalDo.Notify) HalDo.Notify.success("Song generiert!", { app: "musik" });
            build();
          } catch(e){
            stat.innerHTML = "❌ " + e.message;
          }
          btn.disabled = false;
        });
      }

      /* Player */
      if(tab === "player"){
        container.querySelectorAll("[data-play]").forEach(function(el){
          el.addEventListener("click", function(){
            ST.current = parseInt(el.dataset.play);
            store.set("current", ST.current);
            build();
          });
        });
        container.querySelectorAll("[data-del]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Track löschen?")) return;
            ST.playlist.splice(parseInt(el.dataset.del), 1);
            save(); build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#m_clear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Tracks löschen?")) return;
          ST.playlist = []; ST.current = -1;
          save(); build();
        });
      }
    }

    function selectField(id, val, opts){
      var h = '<select id="' + id + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">';
      opts.forEach(function(o){
        h += '<option value="' + _esc(o[0]) + '"' + (o[0] === val ? " selected" : "") + '>' + _esc(o[1]) + '</option>';
      });
      return h + '</select>';
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v201 geladen — FULL KI-STUDIO · 21 Instrumente · 14 Sprachen");
})();
