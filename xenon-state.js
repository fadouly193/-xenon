window.setMode = function(mode) {
  const core = document.querySelector(".xenon-core");
  const statusText = document.getElementById("status-text");
  const topSystemStatus = document.getElementById("top-system-status");
  if (!core) return;

  core.classList.remove("listening","processing","speaking");
  Xenon.state.listening = false;
  Xenon.state.processing = false;
  Xenon.state.speaking = false;

  if (mode === "online") {
    Xenon.state.status = "online";
    Xenon.state.online = true;
    if (statusText) statusText.textContent = "SYSTEM ONLINE";
    if (topSystemStatus) topSystemStatus.textContent = "ONLINE";
    return;
  }

  if (mode === "listening") {
    Xenon.state.status = "listening";
    Xenon.state.online = true;
    Xenon.state.listening = true;
    core.classList.add("listening");
    if (statusText) statusText.textContent = "LISTENING...";
    if (topSystemStatus) topSystemStatus.textContent = "LISTENING";
    return;
  }

  if (mode === "processing") {
    Xenon.state.status = "processing";
    Xenon.state.online = true;
    Xenon.state.processing = true;
    core.classList.add("processing");
    if (statusText) statusText.textContent = "AI PROCESSING...";
    if (topSystemStatus) topSystemStatus.textContent = "THINKING";
    return;
  }

  if (mode === "speaking") {
    Xenon.state.status = "speaking";
    Xenon.state.online = true;
    Xenon.state.speaking = true;
    core.classList.add("speaking");
    if (statusText) statusText.textContent = "RESPONDING...";
    if (topSystemStatus) topSystemStatus.textContent = "SPEAKING";
  }
};
