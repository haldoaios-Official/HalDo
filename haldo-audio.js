/* HalDo Audio Engine v1.1 — Web Audio API Sound System + Equalizer */
/* Globale API: window.HalDoAudio */
(function () {
  'use strict';

  let ctx = null;
  const appGains = {};
  let masterNode = null;
  let eqBass = null, eqMid = null, eqTreble = null;
  let masterVolume = 0.8;
  const vibrationEnabled = {};

  function init() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      // Chain: appGain → bass → mid → treble → master → destination
      eqBass = ctx.createBiquadFilter();
      eqBass.type = 'lowshelf';
      eqBass.frequency.value = 200;
      eqBass.gain.value = 0;

      eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;
      eqMid.Q.value = 1;
      eqMid.gain.value = 0;

      eqTreble = ctx.createBiquadFilter();
      eqTreble.type = 'highshelf';
      eqTreble.frequency.value = 5000;
      eqTreble.gain.value = 0;

      masterNode = ctx.createGain();
      masterNode.gain.value = masterVolume;

      eqBass.connect(eqMid);
      eqMid.connect(eqTreble);
      eqTreble.connect(masterNode);
      masterNode.connect(ctx.destination);
    } catch (e) {
      console.warn('HalDoAudio: AudioContext nicht verfügbar', e);
    }
    return ctx;
  }

  function getAppGain(appId) {
    init();
    if (!ctx) return null;
    if (!appGains[appId]) {
      const g = ctx.createGain();
      g.gain.value = 1.0;
      g.connect(eqBass);
      appGains[appId] = g;
    }
    return appGains[appId];
  }

  function setMasterVolume(v) {
    masterVolume = Math.max(0, Math.min(1, Number(v) || 0));
    if (masterNode && ctx) {
      masterNode.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.02);
    }
  }

  function setAppVolume(appId, v) {
    const g = getAppGain(appId);
    if (g && ctx) {
      g.gain.setTargetAtTime(Math.max(0, Math.min(1, Number(v) || 0)), ctx.currentTime, 0.02);
    }
  }

  function setEQ(bass, mid, treble) {
    init();
    if (!ctx || !eqBass) return;
    eqBass.gain.value = Math.max(-15, Math.min(15, Number(bass) || 0));
    eqMid.gain.value = Math.max(-15, Math.min(15, Number(mid) || 0));
    eqTreble.gain.value = Math.max(-15, Math.min(15, Number(treble) || 0));
  }

  function getEQ() {
    return {
      bass: eqBass ? eqBass.gain.value : 0,
      mid: eqMid ? eqMid.gain.value : 0,
      treble: eqTreble ? eqTreble.gain.value : 0
    };
  }

  function playTone(freq, duration, type, appId, vol) {
    init();
    if (!ctx) return;
    type = type || 'sine';
    appId = appId || 'system';
    vol = (vol == null) ? 0.3 : vol;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const target = getAppGain(appId) || masterNode;
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(g);
    g.connect(target);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  function playSequence(notes, appId) {
    // notes: [{freq, dur, type, vol, delay}]
    notes.forEach(n => {
      setTimeout(() => playTone(n.freq, n.dur, n.type, appId, n.vol), n.delay || 0);
    });
  }

  function vibrate(appId, pattern) {
    if (vibrationEnabled[appId] === false) return;
    if (!navigator.vibrate) return;
    navigator.vibrate(pattern || [40]);
  }

  const SOUNDS = {
    ping:    { play: (id) => playTone(880, 0.15, 'sine', id) },
    ding:    { play: (id) => playTone(1320, 0.20, 'sine', id) },
    pop:     { play: (id) => playTone(440, 0.08, 'triangle', id) },
    alert:   { play: (id) => playSequence([{freq:880,dur:0.10,type:'square'},{freq:660,dur:0.10,type:'square',delay:120}], id) },
    error:   { play: (id) => playTone(220, 0.25, 'sawtooth', id) },
    success: { play: (id) => playSequence([{freq:523,dur:0.10},{freq:659,dur:0.10,delay:80},{freq:784,dur:0.15,delay:160}], id) },
    bell:    { play: (id) => playTone(1046, 0.50, 'sine', id) },
    chime:   { play: (id) => playSequence([{freq:659,dur:0.15},{freq:988,dur:0.20,delay:150}], id) },
    alarm:   { play: (id) => playSequence([{freq:1400,dur:0.15,type:'square',vol:0.4,delay:0},{freq:1400,dur:0.15,type:'square',vol:0.4,delay:250},{freq:1400,dur:0.15,type:'square',vol:0.4,delay:500}], id) },
    marimba: { play: (id) => playSequence([{freq:523,dur:0.25,type:'triangle',vol:0.25,delay:0},{freq:659,dur:0.25,type:'triangle',vol:0.25,delay:90},{freq:784,dur:0.25,type:'triangle',vol:0.25,delay:180},{freq:1046,dur:0.25,type:'triangle',vol:0.25,delay:270}], id) },
    swoosh:  { play: (id) => { init(); if (!ctx) return; const b = ctx.createBuffer(1, ctx.sampleRate*0.4, ctx.sampleRate); const d = b.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length); const s = ctx.createBufferSource(); s.buffer = b; const g = ctx.createGain(); g.gain.value = 0.2; s.connect(g); g.connect(getAppGain(id)||masterNode); s.start(); } },
    bubble:  { play: (id) => playSequence([{freq:400,dur:0.05},{freq:600,dur:0.05,delay:60},{freq:800,dur:0.08,delay:120}], id) },
    click:   { play: (id) => playTone(2000, 0.03, 'square', id, 0.15) },
    whoosh:  { play: (id) => { init(); if (!ctx) return; const osc = ctx.createOscillator(); const g = ctx.createGain(); osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime+0.3); g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.3); osc.connect(g); g.connect(getAppGain(id)||masterNode); osc.start(); osc.stop(ctx.currentTime+0.35); } },
    wood:    { play: (id) => playTone(320, 0.08, 'triangle', id, 0.3) },
    glass:   { play: (id) => playSequence([{freq:2200,dur:0.10},{freq:2400,dur:0.10,delay:50},{freq:2600,dur:0.15,delay:100}], id) },
    none:    { play: () => {} }
  };

  function playSound(soundId, appId) {
    const s = SOUNDS[soundId] || SOUNDS.ping;
    s.play(appId || 'system');
  }

  function listSounds() {
    return Object.keys(SOUNDS);
  }

  function setVibrationEnabled(appId, on) {
    vibrationEnabled[appId] = !!on;
  }

  window.HalDoAudio = {
    init, setMasterVolume, setAppVolume,
    setEQ, getEQ,
    playTone, playSound, vibrate, listSounds, setVibrationEnabled,
    SOUNDS
  };

  console.log('🦚 haldo-audio.js v1.1 geladen — 16 Sounds + Equalizer bereit');
})();
