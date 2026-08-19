window.startXenon=function() {
  setXenonStatusText("INITIALIZING CORE...");
  setXenonTopStatus("BOOTING");

  setTimeout(()=>setXenonStatusText("LOADING MEMORY..."),500);
  setTimeout(()=>setXenonStatusText("LOADING AI BRAIN..."),1000);
  setTimeout(()=>setXenonStatusText("REGISTERING TOOLS..."),1500);
  setTimeout(()=>setXenonStatusText("LOADING AGENT CORE..."),1900);
  setTimeout(()=>setXenonStatusText("LOADING REMINDERS..."),2300);
  setTimeout(()=>setXenonStatusText("INITIALIZING VOICE..."),2700);

  setTimeout(()=>{
    loadMemory();
    Xenon.state.voiceInputAvailable=Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
    Xenon.state.online=true;
    setMode("online");

    addConsoleMessage("XENON",`Xenon V${Xenon.version} online, سيدي.`);
    addConsoleMessage("SYSTEM","AI Agent Core ready.");
    addConsoleMessage("SYSTEM","Multi-step execution ready.");
    addConsoleMessage("SYSTEM","Native Tools ready.");
    addConsoleMessage("SYSTEM","Memory ready.");
    addConsoleMessage("SYSTEM","Repeating Reminders ready.");
    addConsoleMessage("SYSTEM","Voice Input ready.");
    addConsoleMessage("SYSTEM","ElevenLabs ready.");

    checkReminders();
  },3200);
};

window.bindXenonSendButton=function() {
  if (!XenonUI.commandSend) return;
  XenonUI.commandSend.addEventListener("click",async()=>{
    await unlockXenonAudio();
    if (!Xenon.state.notificationPermissionAsked) await requestXenonNotificationPermission();
    const command=getXenonCommandInput();
    clearXenonCommandInput();
    await handleCommand(command);
  });
};

window.bindXenonEnterKey=function() {
  if (!XenonUI.commandInput) return;
  XenonUI.commandInput.addEventListener("keydown",async e=>{
    if (e.key!=="Enter") return;
    await unlockXenonAudio();
    const command=getXenonCommandInput();
    clearXenonCommandInput();
    await handleCommand(command);
  });
};

window.bindXenonCore=function() {
  if (!XenonUI.core) return;
  XenonUI.core.addEventListener("click",async()=>{
    if (!Xenon.state.online) return;

    await unlockXenonAudio();

    if (Xenon.state.status==="speaking") {
      stopXenonAudio();
      setMode("online");
      return;
    }

    if (XenonVoiceInput.recording) {
      stopXenonVoiceRecording();
      return;
    }

    if (XenonVoiceInput.processing || Xenon.state.processing || Xenon.agent.active) return;
    await startXenonVoiceRecording();
  });
};

window.bindXenonAudioUnlock=function() {
  document.addEventListener("touchstart",()=>unlockXenonAudio(),{once:true});
  document.addEventListener("click",()=>unlockXenonAudio(),{once:true});
};

window.startXenonClock=function() {
  updateXenonClock();
  setInterval(updateXenonClock,1000);
};

window.startXenonReminderService=function() {
  setInterval(checkReminders,XENON_CONFIG.reminders.checkInterval);
};

window.initializeXenonApp=function() {
  initXenonUI();
  bindXenonAudioUnlock();
  bindXenonSendButton();
  bindXenonEnterKey();
  bindXenonCore();
  startXenonClock();
  startXenonReminderService();
  startXenon();
};

window.addEventListener("DOMContentLoaded",initializeXenonApp);
