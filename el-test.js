/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ELEVENLABS TEST TOOL
   Prüft API-Key + Voice-IDs einzeln
   ═══════════════════════════════════════════════════════════ */

window.ELTest = {
  checkKey: function(){
    var key = HalDo.Config.get("elevenLabsKey", "");
    if(!key || key.length < 10) return Promise.resolve({ok:false, error:"Kein Key eingetragen"});
    return fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": key }
    }).then(function(r){
      if(r.status === 401) return {ok:false, error:"❌ Key ungültig (401)"};
      if(r.status === 403) return {ok:false, error:"❌ Key hat keine Rechte (403)"};
      if(!r.ok) return {ok:false, error:"❌ HTTP " + r.status};
      return r.json().then(function(d){
        var sub = d.subscription || {};
        return {
          ok: true,
          tier: sub.tier || "?",
          chars: sub.character_count || 0,
          limit: sub.character_limit || 0,
          name: d.first_name || d.username || "?"
        };
      });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  },
  listVoices: function(){
    var key = HalDo.Config.get("elevenLabsKey", "");
    if(!key) return Promise.resolve({ok:false, error:"Kein Key"});
    return fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key }
    }).then(function(r){
      if(!r.ok) return {ok:false, error:"HTTP " + r.status};
      return r.json().then(function(d){
        return {ok:true, voices: d.voices || []};
      });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  },
  testVoice: function(voiceId){
    var key = HalDo.Config.get("elevenLabsKey", "");
    if(!key) return Promise.resolve({ok:false, error:"Kein Key"});
    return fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId + "?output_format=mp3_44100_128", {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: "Test. Hallo Bruder.",
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    }).then(function(r){
      if(r.status === 400) return {ok:false, error:"❌ Voice-ID existiert nicht in deinem Account (400)"};
      if(r.status === 401) return {ok:false, error:"❌ Key ungültig (401)"};
      if(r.status === 422) return {ok:false, error:"❌ Voice-ID Format falsch (422)"};
      if(!r.ok) return {ok:false, error:"❌ HTTP " + r.status};
      return r.blob().then(function(b){
        if(b.size < 100) return {ok:false, error:"Leere Antwort"};
        var url = URL.createObjectURL(b);
        new Audio(url).play();
        return {ok:true, size: b.size};
      });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  },
  runAll: function(){
    console.log("═══════ ElevenLabs Diagnose ═══════");
    this.checkKey().then(function(k){
      console.log("API-Key:", k);
      if(!k.ok) return;
      return ELTest.listVoices().then(function(v){
        console.log("Verfügbare Stimmen in deinem Account:");
        if(v.ok){
          v.voices.forEach(function(voice){
            console.log("  • " + voice.name + " → " + voice.voice_id);
          });
        } else {
          console.log("  Fehler:", v.error);
        }
        var testIds = ["7A4KEolVtZ8n3djQIOjb", "Gote05fci1vNcoJBh9Zn", "IUcJJs5QnotPLhMotOd7", "zcF1DZzEkcYBq33PqIkO"];
        return Promise.all(testIds.map(function(id){
          return ELTest.testVoice(id).then(function(r){
            console.log("Voice " + id + ":", r);
            return r;
          });
        }));
      });
    });
  }
};

console.log("🦚 el-test.js geladen — öffne Konsole und tippe: ELTest.runAll()");
