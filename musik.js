/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK STUDIO (v170)
   21 Instrumente · KI-Generator · Karaoke · Konzert · EQ · FX
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
     HILFSFUNKTIONEN
     ═══════════════════════════════════════════════════════════ */
  function makeDistCurve(amount){
    var k = amount * 100;
    var n = 44100;
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
      for(var i = 0; i < len; i++){
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
    }
    return buf;
  }

  function fmtTime(s){
    if(!s || isNaN(s) || !isFinite(s)) return "0:00";
    var m = Math.floor(s / 60);
    var x = Math.floor(s % 60);
    return m + ":" + (x < 10 ? "0" : "") + x;
  }

  /* ═══════════════════════════════════════════════════════════
     INSTRUMENT-ENGINE (21+ Instrumente)
     ═══════════════════════════════════════════════════════════ */
  function renderSimpleSong(style, key, mode, durationSec, instruments){
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
      major: [0,2,4,5,7,9,11],
      minor: [0,2,3,5,7,8,10],
      pentatonic: [0,2,4,7,9],
      hijaz: [0,1,4,5,7,8,11],
      bayati: [0,1,3,5,7,8,10],
      kurd: [0,1,3,5,7,8,10],
      saba: [0,1,3,4,6,8,10],
      rast: [0,2,4,5,7,9,10]
    };
    var KR = { C:0, D:2, E:4, F:5, G:7, A:9, Bb:10 };

    var STYLE_MAP = {
      stran:    { chord: "strings", mel: "baglama", dr: 0.7, rv: 0.4,  pr: "i-VI-III-VII", mo: "bayati" },
      helbest:  { chord: "strings", mel: "ney",     dr: 0.4, rv: 0.45, pr: "i-VI-III-VII", mo: "bayati" },
      ezidi:    { chord: "strings", mel: "duduk",   dr: 0.4, rv: 0.45, pr: "i-VI-III-VII", mo: "bayati" },
      dengbej:  { chord: "strings", mel: "keman",   dr: 0.5, rv: 0.4,  pr: "i-VI-III-VII", mo: "kurd" },
      arabesk:  { chord: "strings", mel: "keman",   dr: 0.9, rv: 0.4,  pr: "i-VI-III-VII", mo: "hijaz" },
      turku:    { chord: "strings", mel: "kanun",   dr: 1.0, rv: 0.35, pr: "i-VI-III-VII", mo: "hijaz" },
      pop:      { chord: "piano",   mel: "piano",   dr: 1.0, rv: 0.3,  pr: "I-V-vi-IV",   mo: "major" },
      rock:     { chord: "guitar",  mel: "guitar",  dr: 1.3, rv: 0.2,  pr: "I-IV-V-I",    mo: "minor" },
      rap:      { chord: "piano",   mel: "piano",   dr: 1.4, rv: 0.15, pr: "i-VI-III-VII", mo: "minor" },
      edm:      { chord: "synth",   mel: "synth",   dr: 1.4, rv: 0.2,  pr: "vi-IV-I-V",   mo: "minor" },
      ballade:  { chord: "piano",   mel: "keman",   dr: 0.5, rv: 0.4,  pr: "vi-IV-I-V",   mo: "minor" },
      lofi:     { chord: "piano",   mel: "flute",   dr: 0.6, rv: 0.5,  pr: "vi-IV-I-V",   mo: "minor" },
      klassik:  { chord: "strings", mel: "flute",   dr: 0,   rv: 0.5,  pr: "I-IV-V-I",    mo: "major" },
      epic:     { chord: "strings", mel: "brass",   dr: 1.2, rv: 0.45, pr: "i-VI-III-VII", mo: "minor" }
    };

    var PR = {
      "I-V-vi-IV": [0,4,5,3],
      "vi-IV-I-V": [5,3,0,4],
      "I-IV-V-I":  [0,3,4,0],
      "i-VI-III-VII": [0,5,2,6]
    };

    var sp = STYLE_MAP[(style || "pop").toLowerCase()] || STYLE_MAP.pop;
    var root = 60 + (KR[key] || 0);
    var md = mode || sp.mo || "major";
    var iv = SC[md] || SC.major;
    var scale = iv.map(function(i){ return root + i; });
    var prog = PR[sp.pr] || PR["I-V-vi-IV"];
    var tempo = 110;
    var bd = 60 / tempo;
    var bar = bd * 4;

    var targetBars = Math.max(4, Math.floor(durationSec / bar));
    var structure = [];
    var remaining = targetBars;
    var introDone = false;
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

    var mg = ctx.createGain();
    mg.gain.value = 1.8;
    var cp = ctx.createDynamicsCompressor();
    mg.connect(cp);
    cp.connect(ctx.destination);

    var rb = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 2.2), ctx.sampleRate);
    for(var cc = 0; cc < 2; cc++){
      var dd = rb.getChannelData(cc);
      for(var ii = 0; ii < dd.length; ii++){
        dd[ii] = (Math.random() * 2 - 1) * Math.pow(1 - ii / dd.length, 2.5);
      }
    }
    var rv = ctx.createConvolver();
    rv.buffer = rb;
    var rg = ctx.createGain();
    rg.gain.value = sp.rv;
    rv.connect(rg);
    rg.connect(mg);

    var dg = ctx.createGain();
    dg.gain.value = 1 - sp.rv * 0.4;
    dg.connect(mg);

    function hasI(i){ return instruments.indexOf(i) !== -1; }

    function inst(dest, freq, st, dur, amp, type){
      var o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      var g = ctx.createGain();
      var f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.Q.value = 1;

      switch(type){
        case "piano":
          o1.type = "triangle"; o2.type = "sine"; o2.detune.value = 2;
          f.frequency.value = 4200;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.015);
          g.gain.exponentialRampToValueAtTime(amp * 0.3, st + dur * 0.4);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "guitar":
          o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = -5;
          f.frequency.value = 2800;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.008);
          g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.5);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "strings":
          o1.type = "sawtooth"; o2.type = "sawtooth"; o2.detune.value = 8;
          f.frequency.value = 3200;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.35);
          g.gain.setValueAtTime(amp, st + Math.max(0.4, dur - 0.25));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "bass":
          o1.type = "triangle"; o2.type = "sine";
          f.frequency.value = 900;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.02);
          g.gain.setValueAtTime(amp * 0.9, st + Math.max(0.1, dur - 0.1));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "synth":
          o1.type = "square"; o2.type = "sawtooth"; o2.detune.value = 12;
          f.frequency.value = 3800; f.Q.value = 4;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.05);
          g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "bells":
          o1.type = "sine"; o2.type = "sine"; o2.detune.value = 1200;
          f.frequency.value = 9000;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, st + dur * 1.5);
          break;
        case "flute":
          o1.type = "sine"; o2.type = "triangle"; o2.detune.value = 5;
          f.frequency.value = 6500;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.08);
          g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.1));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "brass":
          o1.type = "sawtooth"; o2.type = "square"; o2.detune.value = 3;
          f.frequency.value = 4800; f.Q.value = 2;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.06);
          g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.1));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "baglama":
          o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = -6;
          f.frequency.value = 2400; f.Q.value = 2;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.01);
          g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.5);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "saz":
          o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 6;
          f.frequency.value = 2600; f.Q.value = 2.5;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.01);
          g.gain.exponentialRampToValueAtTime(amp * 0.4, st + dur * 0.45);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "kemence":
          o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 10;
          f.frequency.value = 3000; f.Q.value = 3;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.05);
          g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "keman":
          o1.type = "sawtooth"; o2.type = "triangle"; o2.detune.value = 4;
          f.frequency.value = 3400; f.Q.value = 2;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.08);
          g.gain.setValueAtTime(amp, st + Math.max(0.3, dur - 0.2));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "kanun":
          o1.type = "triangle"; o2.type = "sine"; o2.detune.value = 3;
          f.frequency.value = 5000;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.005);
          g.gain.exponentialRampToValueAtTime(amp * 0.35, st + dur * 0.6);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "zurna":
          o1.type = "sawtooth"; o2.type = "square"; o2.detune.value = 5;
          f.frequency.value = 4000; f.Q.value = 3;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.04);
          g.gain.setValueAtTime(amp, st + Math.max(0.15, dur - 0.12));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "ney":
          o1.type = "sine"; o2.type = "triangle"; o2.detune.value = 8;
          f.frequency.value = 5500;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.15);
          g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        case "duduk":
          o1.type = "sine"; o2.type = "sawtooth"; o2.detune.value = 4;
          f.frequency.value = 3500; f.Q.value = 1.5;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.12);
          g.gain.setValueAtTime(amp, st + Math.max(0.2, dur - 0.15));
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
          break;
        default:
          o1.type = "triangle";
          f.frequency.value = 4000;
          g.gain.setValueAtTime(0.0001, st); g.gain.linearRampToValueAtTime(amp, st + 0.02);
          g.gain.linearRampToValueAtTime(0.0001, st + dur);
      }

      o1.frequency.value = freq;
      o2.frequency.value = freq;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(dest);
      o1.start(st); o1.stop(st + dur + 0.05);
      o2.start(st); o2.stop(st + dur + 0.05);
    }

    function kick(dest, t, amp){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.13);
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + 0.35);
    }
    function snare(dest, t, amp){
      var bs = Math.floor(ctx.sampleRate * 0.2);
      var buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 3);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var g = ctx.createGain();
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1400;
      s.connect(f); f.connect(g); g.connect(dest);
      s.start(t); s.stop(t + 0.22);
    }
    function hat(dest, t, amp){
      var bs = Math.floor(ctx.sampleRate * 0.06);
      var buf = ctx.createBuffer(1, bs, ctx.sampleRate);
      var d = buf.getChannelData(0);
      for(var i = 0; i < bs; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bs, 2);
      var s = ctx.createBufferSource(); s.buffer = buf;
      var g = ctx.createGain();
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000;
      s.connect(f); f.connect(g); g.connect(dest);
      s.start(t); s.stop(t + 0.1);
    }

    var t = 0;
    structure.forEach(function(sec){
      var bars = (sec === "intro" || sec === "outro") ? 4 : 8;
      var sA = sec === "intro" ? 0.7 : sec === "outro" ? 0.6 : 1.0;

      for(var b2 = 0; b2 < bars; b2++){
        var ci = prog[b2 % prog.length];
        var cn = [];
        for(var i2 = 0; i2 < 3; i2++){
          cn.push(scale[(ci + i2 * 2) % scale.length] + Math.floor((ci + i2 * 2) / scale.length) * 12);
        }
        var bs2 = t;

        cn.forEach(function(n){
          if(hasI("piano"))   inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.3 * sA, "piano");
          if(hasI("strings")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.25 * sA, "strings");
          if(hasI("guitar"))  inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.3 * sA, "guitar");
          if(hasI("synth"))   inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.22 * sA, "synth");
          if(hasI("baglama")) inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "baglama");
          if(hasI("saz"))     inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "saz");
          if(hasI("kanun"))   inst(dg, nf(mn(n)), bs2, bar * 0.95, 0.28 * sA, "kanun");
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

          if(hasI("flute") || hasI("ney") || hasI("duduk") || hasI("zurna") || hasI("keman") || hasI("kemence") || hasI("baglama") || hasI("saz") || hasI("kanun")){
            inst(dg, nf(mn(mnn)), mt, (bar / 8) * 0.65, 0.28 * sA, melType);
          }
        }

        if(hasI("arp") && sec !== "intro" && sec !== "outro"){
          for(var a = 0; a < 8; a++){
            var at = bs2 + a * (bar / 8);
            var an = cn[a % cn.length] + 12;
            inst(dg, nf(mn(an)), at, bar / 8 * 0.8, 0.2 * sA, sp.chord);
          }
        }
        if(hasI("bells") && sec === "chorus"){
          for(var bi = 0; bi < 4; bi++){
            var bt = bs2 + bi * (bar / 4);
            var bn2 = scale[(b2 + bi) % scale.length] + 24;
            inst(dg, nf(mn(bn2)), bt, bar / 4 * 0.7, 0.18 * sA, "bells");
          }
        }
        if(hasI("brass") && sec === "chorus"){
          cn.forEach(function(n){ inst(dg, nf(mn(n)), bs2, bar * 0.5, 0.18 * sA, "brass"); });
        }

        if(hasI("drums") && sp.dr > 0){
          var dA = sp.dr * sA * 0.7;
          kick(dg, bs2, 0.8 * dA);
          kick(dg, bs2 + bar * 0.5, 0.7 * dA);
          if(sec === "chorus"){
            snare(dg, bs2 + bar * 0.25, 0.5 * dA);
            snare(dg, bs2 + bar * 0.75, 0.5 * dA);
          }
          for(var h = 0; h < 8; h++) hat(dg, bs2 + h * (bar / 8), 0.22 * dA);
        }
        if(hasI("darbuka")){
          var dA2 = 0.6 * sA;
          kick(dg, bs2, 0.7 * dA2);
          kick(dg, bs2 + bar * 0.5, 0.6 * dA2);
          snare(dg, bs2 + bar * 0.25, 0.4 * dA2);
          snare(dg, bs2 + bar * 0.75, 0.4 * dA2);
        }
        if(hasI("davul")){
          kick(dg, bs2, 0.9 * sA);
          kick(dg, bs2 + bar * 0.5, 0.8 * sA);
        }
        if(hasI("tabla")){
          for(var tb = 0; tb < 4; tb++) kick(dg, bs2 + tb * (bar / 4), 0.3 * sA);
          snare(dg, bs2 + bar * 0.5, 0.5 * sA);
        }
        if(hasI("def")){
          for(var df = 0; df < 8; df++) hat(dg, bs2 + df * (bar / 8), 0.35 * sA);
        }
      }
      t += bars * bar;
    });

    return ctx.startRendering().then(function(rendered){
      return bufToWav(rendered);
    });
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
     MUSIK STUDIO OBJECT
     ═══════════════════════════════════════════════════════════ */
  var Studio = {
    ctx: null, audio: null, sourceNode: null, analyser: null, gainNode: null, eqNodes: [],
    fxDist: null, fxDistWet: null, fxDistDry: null,
    fxReverb: null, fxReverbWet: null, fxReverbDry: null,
    fxEcho: null, fxEchoWet: null, fxEchoDry: null, fxPan: null,
    canvas: null, canvasCtx: null, animId: null, particles: [],
    karaokeTimer: null,
    concertAnimId: null, concertCanvas: null, concertCtx: null,

    /* Speaker-Test-Ton (einfacher Ton für Test) */
    playTestTone: function(freq, dur){
      if(!this.ctx) this.initAudio();
      var o = this.ctx.createOscillator();
      var g = this.ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq || 440;
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05);
      g.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
      o.connect(g); g.connect(this.ctx.destination);
      o.start(); o.stop(this.ctx.currentTime + dur + 0.05);
    },

    initAudio: function(){
      if(this.ctx) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.audio = new Audio();
        this.audio.crossOrigin = "anonymous";
        this.audio.preload = "metadata";
        this.sourceNode = this.ctx.createMediaElementSource(this.audio);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        var freqs = [60,150,400,1000,2400,6000,12000,16000];
        var self = this;
        this.eqNodes = freqs.map(function(f){
          var n = self.ctx.createBiquadFilter();
          n.type = "peaking";
          n.frequency.value = f;
          n.Q.value = 1;
          n.gain.value = 0;
          return n;
        });

        this.fxDist = this.ctx.createWaveShaper();
        this.fxDist.curve = makeDistCurve(0);
        this.fxDist.oversample = "4x";
        this.fxDistDry = this.ctx.createGain();
        this.fxDistWet = this.ctx.createGain();
        this.fxDistWet.gain.value = 0;

        this.fxReverb = this.ctx.createConvolver();
        this.fxReverb.buffer = makeIR(this.ctx, 1.8);
        this.fxReverbDry = this.ctx.createGain();
        this.fxReverbWet = this.ctx.createGain();
        this.fxReverbWet.gain.value = 0;

        this.fxEcho = this.ctx.createDelay(2.0);
        this.fxEcho.delayTime.value = 0.25;
        var eFb = this.ctx.createGain();
        eFb.gain.value = 0.35;
        this.fxEcho.connect(eFb);
        eFb.connect(this.fxEcho);
        this.fxEchoDry = this.ctx.createGain();
        this.fxEchoWet = this.ctx.createGain();
        this.fxEchoWet.gain.value = 0;

        this.fxPan = this.ctx.createStereoPanner();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0.9;

        var prev = this.sourceNode;
        for(var i = 0; i < this.eqNodes.length; i++){
          prev.connect(this.eqNodes[i]);
          prev = this.eqNodes[i];
        }

        var distOut = this.ctx.createGain();
        prev.connect(this.fxDistDry); this.fxDistDry.connect(distOut);
        prev.connect(this.fxDist); this.fxDist.connect(this.fxDistWet); this.fxDistWet.connect(distOut);

        var revOut = this.ctx.createGain();
        distOut.connect(this.fxReverbDry); this.fxReverbDry.connect(revOut);
        distOut.connect(this.fxReverb); this.fxReverb.connect(this.fxReverbWet); this.fxReverbWet.connect(revOut);

        var echoOut = this.ctx.createGain();
        revOut.connect(this.fxEchoDry); this.fxEchoDry.connect(echoOut);
        revOut.connect(this.fxEcho); this.fxEcho.connect(this.fxEchoWet); this.fxEchoWet.connect(echoOut);

        echoOut.connect(this.fxPan);
        this.fxPan.connect(this.gainNode);
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      } catch(e){ console.error("Audio-Init Fehler:", e); }
    },

    askGroq: async function(prompt, maxTok){
      var ai = HalDo.Store.get("aiKeys", {});
      if(!ai.groqKey) throw new Error("Groq-Key fehlt in Einstellungen → KI");
      var r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + ai.groqKey
        },
        body: JSON.stringify({
          model: ai.model || "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
          max_tokens: maxTok || 1500
        })
      });
      if(!r.ok) throw new Error("Groq " + r.status);
      var d = await r.json();
      return d.choices[0].message.content.trim();
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER — UI
     ═══════════════════════════════════════════════════════════ */
  function render(container, ctx){
    var store = ctx.store;
    var state = store.get("state", {
      playlist: [], current: -1, playing: false, volume: 0.9, speed: 1.0, loop: false,
      sortBy: "date", favOnly: false, vizMode: "bars",
      eq: [0,0,0,0,0,0,0,0], eqPreset: "flat",
      fxDist: 0, fxReverb: 0, fxEcho: 0, fxPan: 0,
      trimStart: 0, trimEnd: 100, fadeIn: 0, fadeOut: 0,
      ki: {
        lyrics: "", songDesc: "", lang: "Kurdisch (Kurmanji)",
        style: "Stran", mood: "nachdenklich", region: "kurdisch",
        engine: "local", duration: 180, voiceType: "auto",
        instruments: ["baglama", "duduk", "darbuka", "bass"], tempo: 110, rhythm: "maqsum"
      }
    });
    var tab = store.get("tab", "ki");

    function save(){ store.set("state", state); }

    function build(){
      var body = '';

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "ki" ? " active" : "") + '" data-mtab="ki">🤖 KI-Studio</button>'
        + '<button class="tab' + (tab === "player" ? " active" : "") + '" data-mtab="player">▶️ Player</button>'
        + '<button class="tab' + (tab === "karaoke" ? " active" : "") + '" data-mtab="karaoke">🎤 Karaoke</button>'
        + '<button class="tab' + (tab === "konzert" ? " active" : "") + '" data-mtab="konzert">🎬 Konzert</button>'
        + '<button class="tab' + (tab === "upload" ? " active" : "") + '" data-mtab="upload">📤 Upload</button>'
        + '<button class="tab' + (tab === "eq" ? " active" : "") + '" data-mtab="eq">🎚️ EQ/FX</button>'
        + '<button class="tab' + (tab === "trim" ? " active" : "") + '" data-mtab="trim">✂️ Trim</button>'
        + '</div>';

      /* ═══ KI-STUDIO ═══ */
      if(tab === "ki"){
        var k = state.ki;
        body += '<div class="card"><h3>📝 Song-Beschreibung</h3>'
          + '<textarea id="ki_desc" rows="3" placeholder="Beschreibe deinen Song..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.songDesc || "") + '</textarea>'
          + '<button class="btn sec full" id="ki_random" style="margin-top:8px;font-size:11px">🎲 Zufalls-Idee</button>'
          + '</div>';

        body += '<div class="card"><h3>📄 Songtext</h3>'
          + '<textarea id="ki_lyrics" rows="6" placeholder="Songtext hier eingeben..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical">' + _esc(k.lyrics) + '</textarea>'
          + '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'
          + '<button class="btn sec" data-ki-action="generate" style="font-size:10.5px;padding:8px 10px">✨ Generieren</button>'
          + '<button class="btn sec" data-ki-action="reformulate" style="font-size:10.5px;padding:8px 10px">🔄 Umformulieren</button>'
          + '<button class="btn sec" data-ki-action="rhyme" style="font-size:10.5px;padding:8px 10px">🎵 Reime</button>'
          + '<button class="btn sec" data-ki-action="correct" style="font-size:10.5px;padding:8px 10px">✅ Korrigieren</button>'
          + '<button class="btn sec" data-ki-action="translate" style="font-size:10.5px;padding:8px 10px">🌍 Übersetzen</button>'
          + '</div>'
          + '<div id="ki_status" style="display:none;margin-top:10px;padding:10px;background:rgba(0,229,255,.08);border-radius:8px;font-size:11px;color:var(--text-dim)"></div>'
          + '</div>';

        body += '<div class="card"><h3>🌍 Region & Sprache</h3>'
          + selectField("ki_region", k.region, [
            ["ezidi","🟨 Ezidi"], ["kurdisch","🟨 Kurdisch"], ["turkish","🇹🇷 Türkisch"],
            ["arabic","🇸🇦 Arabisch"], ["persian","🇮🇷 Persisch"], ["european","🌍 Europäisch"],
            ["universal","🌐 Universal"]
          ])
          + selectField("ki_lang", k.lang, [
            ["Kurdisch (Kurmanji)","🟨 Kurmanji"], ["Kurdisch (Sorani)","🟨 Sorani"], ["Ezidi (Êzidî)","🟨 Ezidi"],
            ["Türkisch","🇹🇷 Türkisch"], ["Arabisch","🇸🇦 Arabisch"], ["Persisch","🇮🇷 Persisch"],
            ["Deutsch","🇩🇪 Deutsch"], ["Englisch","🇬🇧 Englisch"], ["Französisch","🇫🇷 Französisch"],
            ["Spanisch","🇪🇸 Spanisch"], ["Hindi","🇮🇳 Hindi"]
          ])
          + '</div>';

        body += '<div class="card"><h3>🎯 Stil & Tempo</h3>'
          + selectField("ki_style", k.style, [
            ["Stran","🟨 Stran"], ["Helbest","🟨 Helbest"], ["Dengbêj","🟨 Dengbêj"],
            ["Arabesk","🇹🇷 Arabesk"], ["Türkü","🇹🇷 Türkü"], ["Pop","Pop"],
            ["Rock","Rock"], ["Rap","Rap"], ["EDM","EDM"], ["Ballade","Ballade"],
            ["Lo-Fi","Lo-Fi"], ["Klassik","Klassik"], ["Epic","Epic"]
          ])
          + selectField("ki_tempo", String(k.tempo), [
            ["60","60 BPM"], ["70","70 BPM"], ["90","90 BPM"],
            ["110","110 BPM"], ["128","128 BPM"], ["140","140 BPM"]
          ])
          + '</div>';

        body += '<div class="card"><h3>🎤 Stimme</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">'
          + voiceChip("auto", "🎯", "Auto", k.voiceType)
          + voiceChip("male", "👨", "Mann", k.voiceType)
          + voiceChip("female", "👩", "Frau", k.voiceType)
          + voiceChip("child", "🧒", "Kind", k.voiceType)
          + voiceChip("group", "👥", "Gruppe", k.voiceType)
          + voiceChip("duet", "👫", "Duett", k.voiceType)
          + voiceChip("choir", "🎼", "Chor", k.voiceType)
          + voiceChip("robot", "🤖", "Roboter", k.voiceType)
          + '</div></div>';

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
        body += '<div class="card"><h3>🎼 Instrumente (' + instrs.length + ')</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">';
        instrs.forEach(function(it){
          var sel = k.instruments.indexOf(it[0]) !== -1;
          body += '<button type="button" data-instr="' + it[0] + '" style="padding:8px 3px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:9px;font-weight:700">'
            + '<div style="font-size:14px;margin-bottom:2px">' + it[1] + '</div>'
            + it[2]
            + '</button>';
        });
        body += '</div></div>';

        /* Dauer */
        body += '<div class="card"><h3>⏱️ Dauer</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px">';
        [30,60,90,120,180,240,300,360,420,480].forEach(function(d){
          var sel = k.duration === d;
          body += '<button type="button" data-dur="' + d + '" style="padding:10px 2px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;font-size:10px;font-weight:900">'
            + (d < 60 ? d + "s" : (d/60) + "min")
            + '</button>';
        });
        body += '</div></div>';

        /* Engine */
        body += '<div class="card"><h3>🎙️ Engine</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
        [
          ["local","🎼","Instrumental","Offline, immer verfügbar"],
          ["myvoice","👤","Meine Stimme","ElevenLabs + Instrumental"],
          ["eleven","🎤","ElevenLabs","Kompletter Song"],
          ["suno","🎵","Suno","Benötigt Proxy"]
        ].forEach(function(e){
          var sel = k.engine === e[0];
          body += '<button type="button" data-engine="' + e[0] + '" style="padding:10px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1.5px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;font-size:11px">'
            + '<div style="font-size:16px">' + e[1] + '</div>'
            + '<div style="font-weight:900;color:' + (sel ? "var(--p1)" : "var(--text)") + ';margin-top:2px">' + e[2] + '</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + e[3] + '</div>'
            + '</button>';
        });
        body += '</div>';

        body += '<button class="btn full" id="ki_create" style="margin-top:14px;background:linear-gradient(135deg,#4ade80,#00e5ff);font-size:14px;padding:14px">🎵 Song generieren</button>'
          + '<div id="ki_createStatus" style="display:none;margin-top:10px;padding:12px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11.5px;line-height:1.5"></div>'
          + '</div>';
      }

      /* ═══ PLAYER ═══ */
      else if(tab === "player"){
        var cur = state.playlist[state.current];
        body += '<div class="card">'
          + '<canvas id="m_viz" style="width:100%;height:160px;border-radius:10px;background:rgba(0,0,0,.3);display:block"></canvas>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-top:8px">'
          + vizBtn("bars","📊", state.vizMode)
          + vizBtn("wave","🌊", state.vizMode)
          + vizBtn("circle","⭕", state.vizMode)
          + vizBtn("particles","✨", state.vizMode)
          + '</div>'
          + '<div style="margin-top:12px;padding:10px;background:rgba(0,0,0,.3);border-radius:8px">'
          + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + (cur ? _esc(cur.name) : "Kein Track") + '</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (cur ? (state.current + 1) + "/" + state.playlist.length : "KI-Studio öffnen") + '</div>'
          + '</div>'
          + '<div style="height:5px;background:rgba(0,0,0,.4);border-radius:3px;margin-top:10px;cursor:pointer" id="m_progress"><div style="height:100%;background:linear-gradient(90deg,var(--p1),var(--p3));border-radius:3px;width:0%" id="m_progressFill"></div></div>'
          + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-mute);margin-top:4px;font-family:monospace">'
          + '<span id="m_cur">0:00</span><span id="m_dur">0:00</span>'
          + '</div>'
          + '<div style="display:flex;justify-content:center;gap:10px;margin-top:12px">'
          + '<button class="btn sec" id="m_shuffle" style="padding:10px 14px">🔀</button>'
          + '<button class="btn sec" id="m_prev" style="padding:10px 14px">⏮</button>'
          + '<button class="btn" id="m_play" style="padding:14px 22px;font-size:18px">' + (state.playing ? "⏸" : "▶") + '</button>'
          + '<button class="btn sec" id="m_next" style="padding:10px 14px">⏭</button>'
          + '<button class="btn sec" id="m_loop" style="padding:10px 14px;' + (state.loop ? "border-color:var(--p1);color:var(--p1)" : "") + '">🔁</button>'
          + '</div>'
          + '<div style="margin-top:12px"><label style="font-size:10.5px;color:var(--text-mute);display:flex;justify-content:space-between"><span>🔊 Lautstärke</span><span id="m_volV">' + Math.round(state.volume * 100) + '%</span></label>'
          + '<input type="range" id="m_vol" min="0" max="100" value="' + (state.volume * 100) + '" style="width:100%"></div>'
          + '</div>';

        body += '<div class="card"><h3>📋 Playlist (' + state.playlist.length + ')</h3>';
        if(!state.playlist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:11.5px">Noch keine Tracks — generiere einen Song!</div>';
        } else {
          state.playlist.forEach(function(t, i){
            var isActive = i === state.current;
            body += '<div style="padding:10px;background:' + (isActive ? "rgba(0,229,255,.1)" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (isActive ? "var(--p1)" : "transparent") + ';border-radius:8px;margin-bottom:4px;display:flex;gap:8px;align-items:center">'
              + '<span data-mfav="' + i + '" style="cursor:pointer;font-size:14px">' + (t.fav ? "⭐" : "☆") + '</span>'
              + '<div data-mplay="' + i + '" style="flex:1;cursor:pointer;min-width:0">'
              + '<div style="font-size:12px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(t.name) + '</div>'
              + '<div style="font-size:9.5px;color:var(--text-mute)">' + (t.dur ? fmtTime(t.dur) : "—") + '</div>'
              + '</div>'
              + '<button data-mrename="' + i + '" style="background:transparent;border:none;color:var(--text-dim);cursor:pointer;font-size:12px">✏️</button>'
              + '<button data-mdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:12px">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      /* ═══ KARAOKE ═══ */
      else if(tab === "karaoke"){
        var k2 = state.ki;
        body += '<div class="card"><h3>🎤 Karaoke</h3>'
          + '<div style="display:flex;gap:6px">'
          + '<button class="btn" id="kar_start" style="flex:1">▶ Start</button>'
          + '<button class="btn sec" id="kar_stop" style="flex:1">⏹ Stop</button>'
          + '</div></div>';
        body += '<div class="card"><h3>📜 Songtext</h3>'
          + '<div class="lyrics-display" id="kar_lyrics" style="padding:11px;border-radius:9px;background:rgba(0,0,0,.4);border:1px solid var(--border-soft);font-size:12.5px;line-height:1.9;white-space:pre-wrap;max-height:300px;overflow-y:auto">'
          + (k2.lyrics ? _esc(k2.lyrics).replace(/\n/g, "<br>") : "Kein Songtext. Gehe zu KI-Studio und generiere einen!")
          + '</div></div>';
      }

      /* ═══ KONZERT ═══ */
      else if(tab === "konzert"){
        body += '<div class="card"><h3>🎬 Live-Konzert</h3>'
          + '<div style="padding:20px;background:linear-gradient(135deg,rgba(180,120,255,.15),rgba(0,229,255,.15));border-radius:12px;text-align:center;border:1.5px solid var(--p3);margin-bottom:14px">'
          + '<div style="font-size:56px">🎤</div>'
          + '<div style="font-size:14px;font-weight:900;color:var(--p3);margin-top:8px">Vollbild-Konzert</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:6px">Lichtshow · Visualizer · Sound</div>'
          + '</div>'
          + '<button class="btn full" id="konzert_start">🎬 Konzert starten</button>'
          + '</div>';
      }

      /* ═══ UPLOAD ═══ */
      else if(tab === "upload"){
        body += '<div class="card"><h3>📤 Musik hochladen</h3>'
          + '<input type="file" id="m_upload" accept="audio/*" multiple style="display:none">'
          + '<div id="m_drop" style="padding:36px 20px;border:2px dashed var(--p1);border-radius:12px;text-align:center;cursor:pointer;background:rgba(0,229,255,.03)">'
          + '<div style="font-size:42px">📁</div>'
          + '<div style="font-size:12px;color:var(--text-dim);font-weight:700;margin-top:8px">Klick oder ziehe MP3, WAV, OGG</div>'
          + '</div></div>';
      }

      /* ═══ EQ/FX ═══ */
      else if(tab === "eq"){
        var presets = ["flat","bass","vocal","rock","jazz","pop","classical","electronic"];
        body += '<div class="card"><h3>🎚️ 8-Band Equalizer</h3>'
          + '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px">';
        presets.forEach(function(p){
          var sel = state.eqPreset === p;
          body += '<button type="button" data-eq-preset="' + p + '" style="padding:7px 3px;background:' + (sel ? "rgba(0,229,255,.15)" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;font-size:10px;font-weight:800;text-transform:capitalize">' + p + '</button>';
        });
        body += '</div>';
        body += '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px">';
        ["60","150","400","1k","2.4k","6k","12k","16k"].forEach(function(f, i){
          body += '<div style="text-align:center">'
            + '<input type="range" data-eq-band="' + i + '" min="-12" max="12" value="' + state.eq[i] + '" style="width:100%;writing-mode:vertical-lr;direction:rtl;height:100px">'
            + '<div style="font-size:9px;color:var(--p1);font-weight:800">' + (state.eq[i] > 0 ? "+" : "") + state.eq[i] + '</div>'
            + '<div style="font-size:8.5px;color:var(--text-mute);font-weight:700">' + f + '</div>'
            + '</div>';
        });
        body += '</div></div>';

        body += '<div class="card"><h3>🎛️ Effekte</h3>'
          + fxSlider("Distortion", "fxDist", state.fxDist)
          + fxSlider("Reverb", "fxReverb", state.fxReverb)
          + fxSlider("Echo", "fxEcho", state.fxEcho)
          + panSlider(state.fxPan)
          + '</div>';
      }

      /* ═══ TRIM ═══ */
      else if(tab === "trim"){
        body += '<div class="card"><h3>✂️ Trim & Export</h3>'
          + trimSlider("Start", "trimStart", state.trimStart, "%")
          + trimSlider("Ende", "trimEnd", state.trimEnd, "%")
          + trimSlider("Fade-In", "fadeIn", state.fadeIn * 10, "s")
          + trimSlider("Fade-Out", "fadeOut", state.fadeOut * 10, "s")
          + '<button class="btn full" id="trim_export" style="margin-top:12px">📤 Als WAV exportieren</button>'
          + '<div id="trim_status" style="display:none;margin-top:10px;padding:12px;background:rgba(0,229,255,.1);border-radius:8px;font-size:11.5px"></div>'
          + '</div>';
      }

      container.innerHTML = body;

      /* ═══════════════════════════════════════════════════════
         EVENT-BINDINGS
         ═══════════════════════════════════════════════════════ */
      container.querySelectorAll("[data-mtab]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.mtab;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ KI-STUDIO Events ═══ */
      if(tab === "ki"){
        var descEl = container.querySelector("#ki_desc");
        if(descEl) descEl.addEventListener("input", function(){ state.ki.songDesc = this.value; save(); });

        var lyricsEl = container.querySelector("#ki_lyrics");
        if(lyricsEl) lyricsEl.addEventListener("input", function(){ state.ki.lyrics = this.value; save(); });

        container.querySelector("#ki_random").addEventListener("click", function(){
          var themes = ["Liebe und Trennung","Heimweh","Frieden und Hoffnung","Fest im Dorf","Verlorene Kindheit","Die Berge","Mutter und Kind","Freiheit und Kampf"];
          var rand = themes[Math.floor(Math.random() * themes.length)];
          container.querySelector("#ki_desc").value = rand;
          state.ki.songDesc = rand;
          save();
          if(HalDo.Notify) HalDo.Notify.info("🎲 " + rand, { app: "musik" });
        });

        container.querySelectorAll("[data-ki-action]").forEach(function(b){
          b.addEventListener("click", function(){
            var act = b.dataset.kiAction;
            var text = container.querySelector("#ki_lyrics").value.trim();
            var desc = container.querySelector("#ki_desc").value.trim();
            var lang = container.querySelector("#ki_lang").value;
            var style = container.querySelector("#ki_style").value;
            var stat = container.querySelector("#ki_status");

            if(act === "generate" && !text && !desc){
              stat.style.display = "block";
              stat.textContent = "⚠️ Schreibe eine Beschreibung oder Thema!";
              return;
            }

            stat.style.display = "block";
            stat.textContent = "⏳ KI arbeitet...";

            var prompt = "";
            if(act === "generate"){
              prompt = "Schreibe einen vollständigen Songtext auf " + lang + " im Stil " + style + ". Thema: " + (text || desc || "Liebe").substring(0, 200) + ". Format: [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus]. Nur den Songtext.";
            } else if(act === "reformulate"){
              prompt = "Formuliere diesen Songtext um (Sprache " + lang + "). NUR den Text:\n\n" + text;
            } else if(act === "rhyme"){
              prompt = "Verbessere die Reime in diesem Songtext. NUR den Text:\n\n" + text;
            } else if(act === "correct"){
              prompt = "Korrigiere Rechtschreibung und Grammatik. NUR den Text:\n\n" + text;
            } else if(act === "translate"){
              prompt = "Übersetze diesen Text nach " + lang + ". NUR den Text:\n\n" + text;
            }

            Studio.askGroq(prompt, 1500).then(function(res){
              container.querySelector("#ki_lyrics").value = res;
              state.ki.lyrics = res;
              save();
              stat.textContent = "✅ Fertig!";
            }).catch(function(e){
              stat.textContent = "❌ " + e.message + " — Groq-Key in Einstellungen → KI eintragen.";
            });
          });
        });

        /* Region/Lang/Style/Tempo */
        container.querySelector("#ki_region").addEventListener("change", function(){ state.ki.region = this.value; save(); });
        container.querySelector("#ki_lang").addEventListener("change", function(){ state.ki.lang = this.value; save(); });
        container.querySelector("#ki_style").addEventListener("change", function(){ state.ki.style = this.value; save(); });
        container.querySelector("#ki_tempo").addEventListener("change", function(){ state.ki.tempo = parseInt(this.value); save(); });

        /* Voice-Chips */
        container.querySelectorAll("[data-vtype]").forEach(function(b){
          b.addEventListener("click", function(){
            state.ki.voiceType = b.dataset.vtype;
            save();
            container.querySelectorAll("[data-vtype]").forEach(function(x){ x.style.borderColor = "var(--border-soft)"; x.style.background = "rgba(0,0,0,.2)"; });
            b.style.borderColor = "var(--p1)";
            b.style.background = "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))";
          });
        });

        /* Instrumente */
        container.querySelectorAll("[data-instr]").forEach(function(b){
          b.addEventListener("click", function(){
            var id = b.dataset.instr;
            var arr = state.ki.instruments;
            var idx = arr.indexOf(id);
            if(idx === -1){ arr.push(id); b.style.borderColor = "var(--p1)"; b.style.background = "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))"; }
            else { arr.splice(idx, 1); b.style.borderColor = "var(--border-soft)"; b.style.background = "rgba(0,0,0,.2)"; }
            save();
          });
        });

        /* Dauer */
        container.querySelectorAll("[data-dur]").forEach(function(b){
          b.addEventListener("click", function(){
            state.ki.duration = parseInt(b.dataset.dur);
            save();
            build();
          });
        });

        /* Engine */
        container.querySelectorAll("[data-engine]").forEach(function(b){
          b.addEventListener("click", function(){
            state.ki.engine = b.dataset.engine;
            save();
            build();
          });
        });

        /* Song generieren */
        container.querySelector("#ki_create").addEventListener("click", function(){
          var stat = container.querySelector("#ki_createStatus");
          stat.style.display = "block";
          stat.innerHTML = "⏳ Generiere Song... (Dauer: " + state.ki.duration + "s)";

          var engine = state.ki.engine;
          var dur = state.ki.duration;

          if(engine === "local"){
            renderSimpleSong(state.ki.style.toLowerCase(), "G", "minor", dur, state.ki.instruments).then(function(blob){
              var url = URL.createObjectURL(blob);
              state.playlist.push({ name: "🎼 " + state.ki.style + " · " + (dur/60).toFixed(1) + "min", url: url, dur: dur, added: Date.now(), size: blob.size, fav: false });
              save();
              stat.innerHTML = "✅ Song fertig! Wechsle zum Player.";
              if(HalDo.Notify) HalDo.Notify.success("Song generiert!", { app: "musik" });
              build();
            }).catch(function(e){
              stat.innerHTML = "❌ " + e.message;
            });
          } else if(engine === "myvoice" || engine === "eleven"){
            var ai = HalDo.Store.get("aiKeys", {});
            if(!ai.elevenKey){
              stat.innerHTML = "❌ ElevenLabs-Key fehlt — Einstellungen → KI";
              return;
            }
            if(engine === "eleven"){
              var prompt = state.ki.style + ", " + state.ki.lang + (state.ki.lyrics ? ", lyrics: " + state.ki.lyrics.substring(0,200) : "");
              fetch("https://api.elevenlabs.io/v1/music", {
                method: "POST",
                headers: { "Content-Type": "application/json", "xi-api-key": ai.elevenKey },
                body: JSON.stringify({ prompt: prompt, music_length_ms: dur * 1000, model_id: "music_v1" })
              }).then(function(r){
                if(!r.ok) throw new Error("ElevenLabs " + r.status);
                return r.blob();
              }).then(function(blob){
                var url = URL.createObjectURL(blob);
                state.playlist.push({ name: "🎤 " + state.ki.style, url: url, dur: dur, added: Date.now(), size: blob.size, fav: false });
                save();
                stat.innerHTML = "✅ Song fertig!";
                build();
              }).catch(function(e){
                stat.innerHTML = "❌ " + e.message;
              });
            } else {
              stat.innerHTML = "⚠️ 'Meine Stimme' — Klon braucht ElevenLabs Voice-ID in Einstellungen. Dann läuft's!";
            }
          } else {
            stat.innerHTML = "⚠️ Engine '" + engine + "' braucht Proxy-Server. Nutze 'Instrumental' oder 'ElevenLabs Music'.";
          }
        });
      }

      /* ═══ PLAYER Events ═══ */
      if(tab === "player"){
        setTimeout(function(){
          Studio.canvas = container.querySelector("#m_viz");
          if(Studio.canvas){
            Studio.canvas.width = Studio.canvas.offsetWidth * 2;
            Studio.canvas.height = Studio.canvas.offsetHeight * 2;
            Studio.canvasCtx = Studio.canvas.getContext("2d");
            if(Studio.animId) cancelAnimationFrame(Studio.animId);
            function draw(){
              drawViz(Studio, state);
              Studio.animId = requestAnimationFrame(draw);
            }
            draw();
          }
        }, 100);

        container.querySelectorAll("[data-viz]").forEach(function(b){
          b.addEventListener("click", function(){
            state.vizMode = b.dataset.viz;
            save();
            build();
          });
        });

        var playBtn = container.querySelector("#m_play");
        if(playBtn) playBtn.addEventListener("click", function(){
          if(!Studio.audio && state.playlist.length > 0){ playIndex(0); return; }
          if(!Studio.audio){ if(HalDo.Notify) HalDo.Notify.warn("Keine Tracks", { app: "musik" }); return; }
          if(Studio.audio.paused){
            if(Studio.ctx && Studio.ctx.state === "suspended") Studio.ctx.resume();
            Studio.audio.play();
            state.playing = true;
          } else {
            Studio.audio.pause();
            state.playing = false;
          }
          save();
          build();
        });

        container.querySelector("#m_prev").addEventListener("click", function(){
          if(state.current > 0) playIndex(state.current - 1);
        });
        container.querySelector("#m_next").addEventListener("click", function(){
          if(state.current < state.playlist.length - 1) playIndex(state.current + 1);
        });
        container.querySelector("#m_loop").addEventListener("click", function(){
          state.loop = !state.loop; save(); build();
        });
        container.querySelector("#m_shuffle").addEventListener("click", function(){
          if(state.playlist.length < 2) return;
          var i = Math.floor(Math.random() * state.playlist.length);
          playIndex(i);
        });

        container.querySelector("#m_vol").addEventListener("input", function(){
          state.volume = this.value / 100;
          if(Studio.gainNode) Studio.gainNode.gain.value = state.volume;
          container.querySelector("#m_volV").textContent = this.value + "%";
          save();
        });

        container.querySelector("#m_progress").addEventListener("click", function(e){
          if(!Studio.audio || !Studio.audio.duration) return;
          var r = this.getBoundingClientRect();
          var p = (e.clientX - r.left) / r.width;
          Studio.audio.currentTime = p * Studio.audio.duration;
        });

        container.querySelectorAll("[data-mplay]").forEach(function(el){
          el.addEventListener("click", function(){ playIndex(parseInt(el.dataset.mplay)); });
        });
        container.querySelectorAll("[data-mfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.mfav);
            state.playlist[i].fav = !state.playlist[i].fav;
            save(); build();
          });
        });
        container.querySelectorAll("[data-mrename]").forEach(function(el){
          el.addEventListener("click", function(){
            var i = parseInt(el.dataset.mrename);
            var nn = prompt("Neuer Name:", state.playlist[i].name);
            if(nn && nn.trim()){ state.playlist[i].name = nn.trim(); save(); build(); }
          });
        });
        container.querySelectorAll("[data-mdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Track löschen?")) return;
            var i = parseInt(el.dataset.mdel);
            state.playlist.splice(i, 1);
            if(state.current === i){ state.current = -1; if(Studio.audio) Studio.audio.pause(); }
            else if(state.current > i) state.current--;
            save(); build();
          });
        });
      }

      /* ═══ KARAOKE Events ═══ */
      if(tab === "karaoke"){
        container.querySelector("#kar_start").addEventListener("click", function(){
          var el = container.querySelector("#kar_lyrics");
          if(!state.ki.lyrics){ if(HalDo.Notify) HalDo.Notify.warn("Kein Songtext", { app: "musik" }); return; }
          if(!Studio.audio || !Studio.audio.src){ if(HalDo.Notify) HalDo.Notify.warn("Erst Track im Player starten", { app: "musik" }); return; }

          var lines = state.ki.lyrics.split(/\n+/).filter(function(l){ return l.trim().length > 0; });
          el.innerHTML = lines.map(function(l, i){ return '<div class="karaoke-line" data-line="' + i + '" style="padding:3px 7px;border-radius:5px">' + _esc(l) + '</div>'; }).join("");

          var lns = container.querySelectorAll(".karaoke-line");
          var dur = Studio.audio.duration || 60;
          var perLine = dur / lns.length;

          if(Studio.karaokeTimer) clearInterval(Studio.karaokeTimer);
          Studio.audio.currentTime = 0;
          Studio.audio.play();
          state.playing = true;
          save();

          Studio.karaokeTimer = setInterval(function(){
            var t = Studio.audio.currentTime;
            var idx = Math.min(lns.length - 1, Math.floor(t / perLine));
            lns.forEach(function(l, i){
              l.classList.toggle("active", i === idx);
              if(i === idx){ l.style.background = "rgba(0,229,255,.2)"; l.style.color = "var(--p1)"; l.style.fontWeight = "900"; }
              else { l.style.background = "transparent"; l.style.color = ""; l.style.fontWeight = ""; }
            });
            if(idx >= 0 && lns[idx]) lns[idx].scrollIntoView({ behavior: "smooth", block: "center" });
          }, 200);
        });

        container.querySelector("#kar_stop").addEventListener("click", function(){
          if(Studio.karaokeTimer){ clearInterval(Studio.karaokeTimer); Studio.karaokeTimer = null; }
          if(Studio.audio) Studio.audio.pause();
          state.playing = false; save();
        });
      }

      /* ═══ KONZERT Events ═══ */
      if(tab === "konzert"){
        container.querySelector("#konzert_start").addEventListener("click", function(){
          startConcert(state);
        });
      }

      /* ═══ UPLOAD Events ═══ */
      if(tab === "upload"){
        var drop = container.querySelector("#m_drop");
        var inp = container.querySelector("#m_upload");
        drop.addEventListener("click", function(){ inp.click(); });
        drop.addEventListener("dragover", function(e){ e.preventDefault(); drop.style.background = "rgba(0,229,255,.1)"; });
        drop.addEventListener("dragleave", function(){ drop.style.background = "rgba(0,229,255,.03)"; });
        drop.addEventListener("drop", function(e){
          e.preventDefault();
          drop.style.background = "rgba(0,229,255,.03)";
          handleFiles(e.dataTransfer.files, state, save, build);
        });
        inp.addEventListener("change", function(){
          handleFiles(this.files, state, save, build);
        });
      }

      /* ═══ EQ/FX Events ═══ */
      if(tab === "eq"){
        container.querySelectorAll("[data-eq-preset]").forEach(function(b){
          b.addEventListener("click", function(){
            var p = b.dataset.eqPreset;
            applyPreset(p, state, save, build);
          });
        });

        container.querySelectorAll("[data-eq-band]").forEach(function(sl){
          sl.addEventListener("input", function(){
            var i = parseInt(this.dataset.eqBand);
            var v = parseInt(this.value);
            state.eq[i] = v;
            if(Studio.eqNodes[i]) Studio.eqNodes[i].gain.value = v;
            state.eqPreset = "custom";
            save();
          });
        });

        ["fxDist","fxReverb","fxEcho"].forEach(function(key){
          var el = container.querySelector('[data-fxslider="' + key + '"]');
          if(el) el.addEventListener("input", function(){
            var v = this.value / 100;
            state[key] = v;
            if(key === "fxDist" && Studio.fxDist){ Studio.fxDist.curve = makeDistCurve(v); Studio.fxDistWet.gain.value = v * 0.7; Studio.fxDistDry.gain.value = 1 - v * 0.5; }
            if(key === "fxReverb" && Studio.fxReverbWet){ Studio.fxReverbWet.gain.value = v * 0.6; Studio.fxReverbDry.gain.value = 1 - v * 0.4; }
            if(key === "fxEcho" && Studio.fxEchoWet){ Studio.fxEchoWet.gain.value = v * 0.5; Studio.fxEchoDry.gain.value = 1 - v * 0.3; }
            var lbl = container.querySelector('[data-fxlabel="' + key + '"]');
            if(lbl) lbl.textContent = this.value + "%";
            save();
          });
        });

        var panEl = container.querySelector('[data-panslider]');
        if(panEl) panEl.addEventListener("input", function(){
          var v = this.value / 100;
          state.fxPan = v;
          if(Studio.fxPan) Studio.fxPan.pan.value = v;
          var lbl = container.querySelector('[data-panlabel]');
          if(lbl) lbl.textContent = this.value + "%";
          save();
        });
      }

      /* ═══ TRIM Events ═══ */
      if(tab === "trim"){
        ["trimStart","trimEnd","fadeIn","fadeOut"].forEach(function(key){
          var el = container.querySelector('[data-trim="' + key + '"]');
          if(el) el.addEventListener("input", function(){
            if(key === "fadeIn" || key === "fadeOut") state[key] = this.value / 10;
            else state[key] = parseInt(this.value);
            var lbl = container.querySelector('[data-trimlabel="' + key + '"]');
            if(lbl) lbl.textContent = (key === "fadeIn" || key === "fadeOut") ? (this.value / 10).toFixed(1) + "s" : this.value + "%";
            save();
          });
        });

        container.querySelector("#trim_export").addEventListener("click", function(){
          var st = container.querySelector("#trim_status");
          if(!Studio.audio || !Studio.audio.src){ st.style.display = "block"; st.textContent = "⚠️ Erst Track laden"; return; }
          st.style.display = "block";
          st.textContent = "⏳ Exportiere...";
          exportTrim(state).then(function(){
            st.textContent = "✅ WAV heruntergeladen!";
          }).catch(function(e){
            st.textContent = "❌ " + e.message;
          });
        });
      }
    }

    /* ═══════════════════════════════════════════════════════════
       HELPER
       ═══════════════════════════════════════════════════════════ */
    function selectField(id, val, opts){
      var h = '<div class="field"><select id="' + id + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">';
      opts.forEach(function(o){
        h += '<option value="' + _esc(o[0]) + '"' + (String(o[0]) === String(val) ? " selected" : "") + '>' + _esc(o[1]) + '</option>';
      });
      return h + '</select></div>';
    }
    function voiceChip(id, icon, label, current){
      var sel = current === id;
      return '<button type="button" data-vtype="' + id + '" style="padding:9px 4px;background:' + (sel ? "linear-gradient(135deg,rgba(0,229,255,.2),rgba(180,120,255,.2))" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (sel ? "var(--p1)" : "var(--border-soft)") + ';border-radius:9px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;font-size:9.5px;font-weight:700">'
        + '<div style="font-size:16px;margin-bottom:2px">' + icon + '</div>'
        + label
        + '</button>';
    }
    function vizBtn(id, icon, current){
      return '<button type="button" data-viz="' + id + '" style="padding:6px 3px;background:' + (current === id ? "rgba(0,229,255,.15)" : "rgba(0,0,0,.2)") + ';border:1px solid ' + (current === id ? "var(--p1)" : "var(--border-soft)") + ';border-radius:7px;cursor:pointer;color:inherit;font-family:inherit;font-size:14px">' + icon + '</button>';
    }
    function fxSlider(label, key, value){
      return '<div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
        + '<span style="font-size:10.5px;font-weight:700;min-width:90px">' + _esc(label) + '</span>'
        + '<input type="range" data-fxslider="' + key + '" min="0" max="100" value="' + Math.round(value * 100) + '" style="flex:1">'
        + '<span data-fxlabel="' + key + '" style="font-size:9.5px;color:var(--p1);font-weight:800;min-width:34px;text-align:right;font-family:monospace">' + Math.round(value * 100) + '%</span>'
        + '</div>';
    }
    function panSlider(value){
      return '<div style="display:flex;align-items:center;gap:9px;padding:7px 0">'
        + '<span style="font-size:10.5px;font-weight:700;min-width:90px">🎧 Stereo-Pan</span>'
        + '<input type="range" data-panslider min="-100" max="100" value="' + Math.round(value * 100) + '" style="flex:1">'
        + '<span data-panlabel style="font-size:9.5px;color:var(--p1);font-weight:800;min-width:34px;text-align:right;font-family:monospace">' + Math.round(value * 100) + '%</span>'
        + '</div>';
    }
    function trimSlider(label, key, value, unit){
      return '<div style="display:flex;align-items:center;gap:9px;padding:7px 0">'
        + '<span style="font-size:10.5px;font-weight:700;min-width:70px">' + _esc(label) + '</span>'
        + '<input type="range" data-trim="' + key + '" min="0" max="100" value="' + value + '" style="flex:1">'
        + '<span data-trimlabel="' + key + '" style="font-size:9.5px;color:var(--p1);font-weight:800;min-width:36px;text-align:right;font-family:monospace">' + value + unit + '</span>'
        + '</div>';
    }

    /* ═══════════════════════════════════════════════════════════
       PLAY / AUDIO / KONZERT / EXPORT
       ═══════════════════════════════════════════════════════════ */
    function playIndex(idx){
      if(idx < 0 || idx >= state.playlist.length) return;
      if(!Studio.ctx) Studio.initAudio();
      if(Studio.ctx && Studio.ctx.state === "suspended") Studio.ctx.resume();
      var t = state.playlist[idx];
      state.current = idx;
      if(Studio.audio){
        Studio.audio.pause();
        Studio.audio.src = t.url;
        Studio.audio.playbackRate = state.speed;
        Studio.audio.onloadedmetadata = function(){
          t.dur = Studio.audio.duration;
          save();
          var durEl = container.querySelector("#m_dur");
          if(durEl) durEl.textContent = fmtTime(t.dur);
        };
        Studio.audio.ontimeupdate = function(){
          var p = (Studio.audio.currentTime / Studio.audio.duration) * 100;
          var f = container.querySelector("#m_progressFill");
          if(f) f.style.width = p + "%";
          var cEl = container.querySelector("#m_cur");
          if(cEl) cEl.textContent = fmtTime(Studio.audio.currentTime);
        };
        Studio.audio.onended = function(){
          if(state.loop){ Studio.audio.currentTime = 0; Studio.audio.play(); }
          else {
            state.playing = false;
            save();
          }
        };
        Studio.audio.play().then(function(){
          state.playing = true;
          save();
          build();
        }).catch(function(e){
          if(HalDo.Notify) HalDo.Notify.error("Playback: " + e.message, { app: "musik" });
        });
      }
    }

    function drawViz(studio, state){
      var c = studio.canvas;
      if(!c) return;
      var ctx2 = studio.canvasCtx;
      var W = c.width, H = c.height;
      ctx2.clearRect(0, 0, W, H);

      if(!studio.analyser){
        ctx2.fillStyle = "rgba(122,139,168,.4)";
        ctx2.font = "18px sans-serif";
        ctx2.textAlign = "center";
        ctx2.fillText("▶ Track starten", W/2, H/2);
        return;
      }

      var m = state.vizMode;
      var data;

      if(m === "bars"){
        data = new Uint8Array(studio.analyser.frequencyBinCount);
        studio.analyser.getByteFrequencyData(data);
        var bars = 64, step = Math.floor(data.length / bars), bw = W / bars;
        for(var i = 0; i < bars; i++){
          var v = 0;
          for(var j = 0; j < step; j++) v += data[i * step + j];
          v /= step;
          var bh = (v / 255) * H * 0.9;
          var hue = 180 + (i / bars) * 120;
          var light = 40 + (v / 255) * 30;
          ctx2.fillStyle = "hsl(" + hue + ",100%," + light + "%)";
          ctx2.fillRect(i * bw + 2, H - bh, bw - 4, bh);
        }
      } else if(m === "wave"){
        data = new Uint8Array(studio.analyser.fftSize);
        studio.analyser.getByteTimeDomainData(data);
        ctx2.lineWidth = 3;
        ctx2.strokeStyle = "#00e5ff";
        ctx2.beginPath();
        var slice = W / data.length;
        for(var k = 0; k < data.length; k++){
          var vv = data[k] / 128.0;
          var yy = vv * H / 2;
          if(k === 0) ctx2.moveTo(0, yy);
          else ctx2.lineTo(k * slice, yy);
        }
        ctx2.stroke();
      } else if(m === "circle"){
        data = new Uint8Array(studio.analyser.frequencyBinCount);
        studio.analyser.getByteFrequencyData(data);
        var cx = W / 2, cy = H / 2;
        var r = Math.min(W, H) * 0.18;
        var bars2 = 64, step2 = Math.floor(data.length / bars2);
        for(var b = 0; b < bars2; b++){
          var v2 = 0;
          for(var j2 = 0; j2 < step2; j2++) v2 += data[b * step2 + j2];
          v2 /= step2;
          var len = (v2 / 255) * r * 1.5;
          var a1 = (b / bars2) * Math.PI * 2 - Math.PI / 2;
          var x1 = cx + Math.cos(a1) * r;
          var y1 = cy + Math.sin(a1) * r;
          var x2 = cx + Math.cos(a1) * (r + len);
          var y2 = cy + Math.sin(a1) * (r + len);
          var hue2 = 180 + (b / bars2) * 140;
          ctx2.strokeStyle = "hsl(" + hue2 + ",100%,60%)";
          ctx2.lineWidth = W / bars2 * 0.7;
          ctx2.beginPath();
          ctx2.moveTo(x1, y1); ctx2.lineTo(x2, y2);
          ctx2.stroke();
        }
      } else if(m === "particles"){
        data = new Uint8Array(studio.analyser.frequencyBinCount);
        studio.analyser.getByteFrequencyData(data);
        var sum = 0;
        for(var p = 0; p < 32; p++) sum += data[p];
        var bass = sum / 32;
        if(bass > 100 && studio.particles.length < 200){
          for(var kk = 0; kk < 3; kk++){
            studio.particles.push({
              x: W/2 + (Math.random() - 0.5) * 100,
              y: H/2 + (Math.random() - 0.5) * 50,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3 - 1,
              life: 1,
              hue: 180 + Math.random() * 140,
              size: 2 + Math.random() * 3
            });
          }
        }
        for(var pp = studio.particles.length - 1; pp >= 0; pp--){
          var pt = studio.particles[pp];
          pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.08; pt.life -= 0.012;
          if(pt.life <= 0){ studio.particles.splice(pp, 1); continue; }
          ctx2.globalAlpha = pt.life;
          ctx2.fillStyle = "hsl(" + pt.hue + ",100%,60%)";
          ctx2.beginPath();
          ctx2.arc(pt.x, pt.y, pt.size * pt.life, 0, Math.PI * 2);
          ctx2.fill();
        }
        ctx2.globalAlpha = 1;
      }
    }

    function handleFiles(files, state, save, build){
      var added = 0;
      Array.prototype.forEach.call(files, function(f){
        if(!f.type.startsWith("audio/")) return;
        var url = URL.createObjectURL(f);
        state.playlist.push({
          name: f.name.replace(/\.[^.]+$/, ""),
          url: url, dur: 0, added: Date.now(),
          size: f.size, fav: false, isLocal: true
        });
        added++;
      });
      save();
      build();
      if(HalDo.Notify) HalDo.Notify.success(added + " Datei(en) hinzugefügt", { app: "musik" });
    }

    function applyPreset(name, state, save, build){
      var presets = {
        flat: [0,0,0,0,0,0,0,0],
        bass: [8,6,3,0,-1,-2,-3,-4],
        vocal: [-3,-1,2,5,4,2,0,-2],
        rock: [5,3,1,-1,1,3,4,3],
        jazz: [3,2,1,2,-1,-1,0,1],
        pop: [-1,1,2,4,3,1,-1,-2],
        classical: [4,3,2,0,0,-1,-2,-3],
        electronic: [6,5,3,1,0,1,3,4]
      };
      var eq = presets[name] || presets.flat;
      state.eq = eq.slice();
      state.eqPreset = name;
      save();
      for(var i = 0; i < 8; i++){
        if(Studio.eqNodes[i]) Studio.eqNodes[i].gain.value = eq[i];
      }
      build();
    }

    function startConcert(state){
      var overlay = document.createElement("div");
      overlay.id = "m_concertOverlay";
      overlay.style.cssText = "position:fixed;inset:0;background:#000;z-index:99999;display:flex;flex-direction:column";

      var closeBtn = document.createElement("button");
      closeBtn.textContent = "✕";
      closeBtn.style.cssText = "position:absolute;top:16px;right:16px;width:44px;height:44px;border-radius:50%;background:rgba(255,128,128,.3);border:1px solid rgba(255,128,128,.6);color:#fff;font-size:18px;cursor:pointer;z-index:2";

      var canvas = document.createElement("canvas");
      canvas.style.cssText = "flex:1;width:100%;display:block";
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      overlay.appendChild(closeBtn);
      overlay.appendChild(canvas);
      document.body.appendChild(overlay);

      var ctx = canvas.getContext("2d");
      var animId = null;

      function draw(){
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        var bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W, H) / 2);
        bg.addColorStop(0, "#0a0f1c");
        bg.addColorStop(1, "#000");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        if(!Studio.analyser){
          ctx.fillStyle = "rgba(0,229,255,.4)";
          ctx.font = "40px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🎤 Konzert bereit", W/2, H/2);
          return;
        }

        var data = new Uint8Array(Studio.analyser.frequencyBinCount);
        Studio.analyser.getByteFrequencyData(data);
        var cx = W/2, cy = H/2;
        var r = Math.min(W, H) * 0.15;
        var bars = 80, step = Math.floor(data.length / bars);

        for(var i = 0; i < bars; i++){
          var v = 0;
          for(var j = 0; j < step; j++) v += data[i * step + j];
          v /= step;
          var len = (v / 255) * r * 2.2;
          var a1 = (i / bars) * Math.PI * 2 - Math.PI / 2;
          var x1 = cx + Math.cos(a1) * r;
          var y1 = cy + Math.sin(a1) * r;
          var x2 = cx + Math.cos(a1) * (r + len);
          var y2 = cy + Math.sin(a1) * (r + len);
          var hue = 180 + (i / bars) * 180;
          ctx.strokeStyle = "hsla(" + hue + ",100%,60%,0.85)";
          ctx.lineWidth = W / bars * 0.7;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        animId = requestAnimationFrame(draw);
      }

      if(!Studio.ctx) Studio.initAudio();
      if(Studio.ctx && Studio.ctx.state === "suspended") Studio.ctx.resume();
      if(Studio.audio && Studio.audio.paused && Studio.audio.src) Studio.audio.play();
      state.playing = true;
      save();

      draw();

      closeBtn.addEventListener("click", function(){
        if(animId) cancelAnimationFrame(animId);
        overlay.remove();
        if(Studio.audio) Studio.audio.pause();
        state.playing = false;
        save();
        build();
      });
    }

    function exportTrim(state){
      return new Promise(function(resolve, reject){
        if(!Studio.audio || !Studio.audio.src){ reject(new Error("Kein Track")); return; }
        var sr = 48000;
        var dur = Studio.audio.duration;
        var startT = (state.trimStart / 100) * dur;
        var endT = (state.trimEnd / 100) * dur;
        var len = Math.ceil((endT - startT) * sr);

        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        var offCtx = new OAC(2, len, sr);

        fetch(Studio.audio.src).then(function(r){ return r.arrayBuffer(); }).then(function(arr){
          if(!Studio.ctx) Studio.initAudio();
          return Studio.ctx.decodeAudioData(arr.slice(0));
        }).then(function(buf){
          var src = offCtx.createBufferSource();
          src.buffer = buf;
          var gain = offCtx.createGain();
          var fi = state.fadeIn, fo = state.fadeOut;

          gain.gain.setValueAtTime(fi > 0 ? 0.001 : 1, 0);
          if(fi > 0) gain.gain.linearRampToValueAtTime(1, fi);
          if(fo > 0){
            gain.gain.setValueAtTime(1, Math.max(0, (endT - startT) - fo));
            gain.gain.linearRampToValueAtTime(0.001, endT - startT);
          }

          src.connect(gain);
          gain.connect(offCtx.destination);
          src.start(0, startT, endT - startT);

          return offCtx.startRendering();
        }).then(function(rendered){
          var blob = bufToWav(rendered);
          var url = URL.createObjectURL(blob);
          var a = document.createElement("a");
          a.href = url;
          a.download = "haldo-musik-" + Date.now() + ".wav";
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        }).catch(reject);
      });
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js v170 geladen — FULL STUDIO · 21 Instrumente");
})();
