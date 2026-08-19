window.saveMemory = function() {
  try {
    localStorage.setItem(XENON_CONFIG.storage.memoryKey, JSON.stringify({
      userName:Xenon.memory.userName,
      currentProject:Xenon.memory.currentProject,
      notes:Xenon.memory.notes,
      tasks:Xenon.memory.tasks,
      reminders:Xenon.memory.reminders
    }));
    return true;
  } catch(e) {
    console.log("XENON MEMORY SAVE ERROR:",e);
    return false;
  }
};

window.loadMemory = function() {
  try {
    const saved = localStorage.getItem(XENON_CONFIG.storage.memoryKey);
    if (!saved) return false;
    const data = JSON.parse(saved);
    Xenon.memory.userName = data.userName || null;
    Xenon.memory.currentProject = data.currentProject || null;
    Xenon.memory.notes = Array.isArray(data.notes) ? data.notes : [];
    Xenon.memory.tasks = Array.isArray(data.tasks) ? data.tasks : [];
    Xenon.memory.reminders = (Array.isArray(data.reminders) ? data.reminders : []).map(r => ({
      ...r,
      completed: r.completed === true,
      lastFiredAt: r.lastFiredAt || null
    }));
    return true;
  } catch(e) {
    console.log("XENON MEMORY LOAD ERROR:",e);
    return false;
  }
};

window.clearXenonMemory = function() {
  localStorage.removeItem(XENON_CONFIG.storage.memoryKey);
  Xenon.memory.userName = null;
  Xenon.memory.currentProject = null;
  Xenon.memory.notes = [];
  Xenon.memory.tasks = [];
  Xenon.memory.reminders = [];
  return true;
};
