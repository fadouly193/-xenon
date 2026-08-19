window.Xenon = {
  name: XENON_CONFIG.app.name,
  version: XENON_CONFIG.app.version,
  state: {
    status: "initializing",
    online: false,
    listening: false,
    processing: false,
    speaking: false,
    voiceInputAvailable: false,
    audioUnlocked: false,
    notificationPermissionAsked: false,
    lastReminderId: null
  },
  memory: {
    userName: null,
    currentProject: null,
    notes: [],
    tasks: [],
    reminders: []
  },
  conversation: [],
  audio: { player: null, objectURL: null },
  agent: { enabled: true, active: false, currentRequest: null, currentActions: [] },
  voice: { wakeMode: false, conversationActive: false, recording: false, processing: false }
};
console.log(`XENON CORE READY — V${Xenon.version}`);
