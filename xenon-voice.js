window.xenonAudioPlayer = new Audio();
xenonAudioPlayer.preload="auto";

window.unlockXenonAudio = async function() {
  if (Xenon.state.audioUnlocked) return true;
  try {
    xenonAudioPlayer.muted=true;
    xenonAudioPlayer.src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    await xenonAudioPlayer.play();
    xenonAudioPlayer.pause();
    xenonAudioPlayer.currentTime=0;
    xenonAudioPlayer.muted=false;
    Xenon.state.audioUnlocked=true;
    return true;
  } catch(e) { return false; }
};

window.stopXenonAudio = function() {
  try { xenonAudioPlayer.pause(); xenonAudioPlayer.currentTime=0; } catch(e) {}
  if (Xenon.audio.objectURL) URL.revokeObjectURL(Xenon.audio.objectURL);
  Xenon.audio.objectURL=null;
  Xenon.audio.player=null;
};

window.speakWithElevenLabs = async function(text) {
  stopXenonAudio();
  const config=XENON_CONFIG.elevenLabs;
  if (!config.apiKey || config.apiKey.includes("PUT_ELEVENLABS")) { setMode("online"); return false; }

  try {
    const endpoint=`${config.textToSpeechEndpoint}/${config.voiceId}?output_format=${config.outputFormat}`;
    const response=await fetch(endpoint,{
      method:"POST",
      headers:{"xi-api-key":config.apiKey,"Content-Type":"application/json",Accept:"audio/mpeg"},
      body:JSON.stringify({
        text,
        model_id:config.voiceModel,
        voice_settings:{
          stability:config.voiceSettings.stability,
          similarity_boost:config.voiceSettings.similarityBoost,
          style:config.voiceSettings.style,
          use_speaker_boost:config.voiceSettings.speakerBoost
        }
      })
    });

    if (!response.ok) {
      addConsoleMessage("SYSTEM","VOICE ERROR "+response.status);
      setMode("online");
      return false;
    }

    const audioURL=URL.createObjectURL(await response.blob());
    Xenon.audio.objectURL=audioURL;
    Xenon.audio.player=xenonAudioPlayer;
    xenonAudioPlayer.src=audioURL;
    xenonAudioPlayer.muted=false;
    xenonAudioPlayer.volume=1;
    xenonAudioPlayer.onplay=()=>setMode("speaking");
    xenonAudioPlayer.onended=()=>{
      if (Xenon.audio.objectURL) URL.revokeObjectURL(Xenon.audio.objectURL);
      Xenon.audio.objectURL=null;
      Xenon.audio.player=null;
      setMode("online");
    };
    xenonAudioPlayer.onerror=()=>setMode("online");
    await xenonAudioPlayer.play();
    return true;
  } catch(e) {
    addConsoleMessage("SYSTEM","VOICE PLAYBACK FAILED");
    setMode("online");
    return false;
  }
};

window.XenonVoiceInput={
  recording:false,processing:false,stream:null,recorder:null,chunks:[],
  audioContext:null,analyser:null,source:null,monitorFrame:null,
  startedAt:null,speechDetected:false,lastSpeechAt:null
};

window.getXenonRecordingMimeType=function() {
  const types=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"];
  for (const type of types) if (MediaRecorder.isTypeSupported(type)) return type;
  return "";
};

window.getXenonAudioExtension=function(mimeType) {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
};

window.openXenonMicrophone=async function() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error("getUserMedia unavailable");
  return await navigator.mediaDevices.getUserMedia({
    audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}
  });
};

window.startXenonVoiceRecording=async function() {
  if (XenonVoiceInput.recording || XenonVoiceInput.processing) return;
  if (Xenon.state.status==="speaking") stopXenonAudio();

  try {
    const stream=await openXenonMicrophone();
    XenonVoiceInput.stream=stream;

    const mimeType=getXenonRecordingMimeType();
    const recorder=new MediaRecorder(stream,mimeType?{mimeType}:undefined);

    XenonVoiceInput.recorder=recorder;
    XenonVoiceInput.chunks=[];
    XenonVoiceInput.startedAt=Date.now();
    XenonVoiceInput.speechDetected=false;
    XenonVoiceInput.lastSpeechAt=null;

    recorder.ondataavailable=e=>{ if (e.data?.size>0) XenonVoiceInput.chunks.push(e.data); };
    recorder.onstop=finishXenonVoiceRecording;
    recorder.start();

    XenonVoiceInput.recording=true;
    Xenon.voice.recording=true;
    setMode("listening");
    startXenonSilenceMonitor();
  } catch(e) {
    XenonVoiceInput.recording=false;
    Xenon.voice.recording=false;
    cleanupXenonMicrophone();
    addConsoleMessage("SYSTEM","MICROPHONE ERROR");
    setMode("online");
  }
};

window.startXenonSilenceMonitor=function() {
  try {
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if (!AudioContextClass) return;

    XenonVoiceInput.audioContext=new AudioContextClass();
    XenonVoiceInput.source=XenonVoiceInput.audioContext.createMediaStreamSource(XenonVoiceInput.stream);
    XenonVoiceInput.analyser=XenonVoiceInput.audioContext.createAnalyser();
    XenonVoiceInput.analyser.fftSize=2048;
    XenonVoiceInput.source.connect(XenonVoiceInput.analyser);

    const buffer=new Uint8Array(XenonVoiceInput.analyser.fftSize);
    const threshold=.025;

    function monitor() {
      if (!XenonVoiceInput.recording) return;

      XenonVoiceInput.analyser.getByteTimeDomainData(buffer);
      let sum=0;
      for (const b of buffer) {
        const v=(b-128)/128;
        sum+=v*v;
      }

      const rms=Math.sqrt(sum/buffer.length);
      const now=Date.now();
      const elapsed=now-XenonVoiceInput.startedAt;

      if (rms>threshold) {
        XenonVoiceInput.speechDetected=true;
        XenonVoiceInput.lastSpeechAt=now;
      }

      if (XenonVoiceInput.speechDetected && XenonVoiceInput.lastSpeechAt) {
        const silenceTime=now-XenonVoiceInput.lastSpeechAt;
        if (elapsed>500 && silenceTime>XENON_CONFIG.voice.silenceStopDelay) {
          stopXenonVoiceRecording();
          return;
        }
      }

      if (elapsed>=XENON_CONFIG.voice.maxRecordTime) {
        stopXenonVoiceRecording();
        return;
      }

      XenonVoiceInput.monitorFrame=requestAnimationFrame(monitor);
    }

    monitor();
  } catch(e) {}
};

window.stopXenonVoiceRecording=function() {
  if (!XenonVoiceInput.recording) return;
  XenonVoiceInput.recording=false;
  Xenon.voice.recording=false;

  if (XenonVoiceInput.monitorFrame) {
    cancelAnimationFrame(XenonVoiceInput.monitorFrame);
    XenonVoiceInput.monitorFrame=null;
  }

  if (XenonVoiceInput.recorder && XenonVoiceInput.recorder.state!=="inactive") {
    try { XenonVoiceInput.recorder.stop(); } catch(e) {}
  }
};

window.finishXenonVoiceRecording=async function() {
  const recorder=XenonVoiceInput.recorder;
  const mimeType=recorder?.mimeType||"audio/webm";
  const chunks=XenonVoiceInput.chunks;

  cleanupXenonMicrophone();
  XenonVoiceInput.recorder=null;
  XenonVoiceInput.chunks=[];

  if (!chunks.length) { setMode("online"); return; }

  const blob=new Blob(chunks,{type:mimeType});
  if (blob.size<500) { setMode("online"); return; }

  XenonVoiceInput.processing=true;
  Xenon.voice.processing=true;
  setMode("processing");

  try {
    const transcript=await transcribeXenonAudio(blob,mimeType);
    if (!transcript) {
      addConsoleMessage("SYSTEM","NO SPEECH DETECTED");
      setMode("online");
      return;
    }
    await handleCommand(transcript);
  } catch(e) {
    addConsoleMessage("SYSTEM","VOICE TRANSCRIPTION FAILED");
    setMode("online");
  } finally {
    XenonVoiceInput.processing=false;
    Xenon.voice.processing=false;
  }
};

window.transcribeXenonAudio=async function(audioBlob,mimeType) {
  const config=XENON_CONFIG.elevenLabs;
  const extension=getXenonAudioExtension(mimeType);
  const file=new File([audioBlob],`xenon-voice.${extension}`,{type:mimeType});
  const formData=new FormData();
  formData.append("file",file);
  formData.append("model_id",config.speechToTextModel);
  formData.append("language_code","ar");
  formData.append("num_speakers","1");

  const response=await fetch(config.speechToTextEndpoint,{
    method:"POST",
    headers:{"xi-api-key":config.apiKey},
    body:formData
  });

  if (!response.ok) throw new Error(`STT ${response.status}: ${await response.text()}`);
  const data=await response.json();
  return String(data?.text||"").trim();
};

window.cleanupXenonMicrophone=function() {
  if (XenonVoiceInput.monitorFrame) {
    cancelAnimationFrame(XenonVoiceInput.monitorFrame);
    XenonVoiceInput.monitorFrame=null;
  }

  try { XenonVoiceInput.source?.disconnect(); } catch(e) {}
  XenonVoiceInput.source=null;
  XenonVoiceInput.analyser=null;

  try { XenonVoiceInput.audioContext?.close(); } catch(e) {}
  XenonVoiceInput.audioContext=null;

  if (XenonVoiceInput.stream) {
    XenonVoiceInput.stream.getTracks().forEach(t=>t.stop());
  }
  XenonVoiceInput.stream=null;
};
