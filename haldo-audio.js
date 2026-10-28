/* HalDo Audio Engine v1.0 — Web Audio API Sound System */
/* Globale API: window.HalDoAudio */
(function () {
  'use strict';

  let ctx = null;
  const appGains = {};
  let masterNode = null;
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
      masterNode = ctx.createGain();
      masterNode.gain.value = masterVolume;
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
      g.connect(masterNode);
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

  function vibrate(appId, pattern) {
    if (vibrationEnabled[appId] === false) return;
    if (!navigator.vibrate) return;
    navigator.vibrate(pattern || [40]);
  }

  const SOUNDS = {
    ping:    { play: (id) => playTone(880, 0.15, 'sine', id) },
    ding:    { play: (id) => playTone(1320, 0.20, 'sine', id) },
    pop:     { play: (id) => playTone(440, 0.08, 'triangle', id) },
    alert:   { play: (id) => { playTone(880, 0.10, 'square', id); setTimeout(() => playTone(660, 0.10, 'square', id), 120); } },
    error:   { play: (id) => playTone(220, 0.25, 'sawtooth', id) },
    success: { play: (id) => { playTone(523, 0.10, 'sine', id); setTimeout(() => playTone(659, 0.10, 'sine', id), 80); setTimeout(() => playTone(784, 0.15, 'sine', id), 160); } },
    bell:    { play: (id) => playTone(1046, 0.50, 'sine', id) },
    chime:   { play: (id) => { playTone(659, 0.15, 'sine', id); setTimeout(() => playTone(988, 0.20, 'sine', id), 150); } },
    alarm:   { play: (id) => { for (let i = 0; i < 3; i++) setTimeout(() => playTone(1400, 0.15, 'square', id, 0.4), i * 250); } },
    marimba: { play: (id) => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.25, 'triangle', id, 0.25), i * 90)); } },
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
    playTone, playSound, vibrate, listSounds, setVibrationEnabled,
    SOUNDS
  };

  console.log('🦚 haldo-audio.js v1.0 geladen — Sound Engine bereit');
})();
