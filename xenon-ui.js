window.XenonUI = {
  statusText:null, core:null, commandInput:null, commandSend:null,
  console:null, topSystemStatus:null, time:null, date:null
};

window.initXenonUI = function() {
  XenonUI.statusText = document.getElementById("status-text");
  XenonUI.core = document.querySelector(".xenon-core");
  XenonUI.commandInput = document.getElementById("command-input");
  XenonUI.commandSend = document.getElementById("command-send");
  XenonUI.console = document.getElementById("xenon-console");
  XenonUI.topSystemStatus = document.getElementById("top-system-status");
  XenonUI.time = document.getElementById("time");
  XenonUI.date = document.getElementById("date");
};

window.addConsoleMessage = function(sender,message) {
  if (!XenonUI.console) return;
  const line = document.createElement("div");
  line.classList.add("console-line", sender === "YOU" ? "user" : "system");

  const label = document.createElement("span");
  label.classList.add("console-label");
  label.textContent = sender;

  const text = document.createElement("span");
  text.classList.add("console-text");
  text.textContent = message;

  line.append(label,text);
  XenonUI.console.appendChild(line);
  XenonUI.console.scrollTop = XenonUI.console.scrollHeight;
};

window.setXenonStatusText = t => { if (XenonUI.statusText) XenonUI.statusText.textContent = t; };
window.setXenonTopStatus = t => { if (XenonUI.topSystemStatus) XenonUI.topSystemStatus.textContent = t; };

window.updateXenonClock = function() {
  const now = new Date();
  if (XenonUI.time) XenonUI.time.textContent = now.toLocaleTimeString("en-GB");
  if (XenonUI.date) XenonUI.date.textContent = now.toLocaleDateString("en-US",{
    weekday:"short",day:"2-digit",month:"short",year:"numeric"
  }).toUpperCase();
};

window.getXenonCommandInput = () => XenonUI.commandInput ? XenonUI.commandInput.value : "";
window.clearXenonCommandInput = () => { if (XenonUI.commandInput) XenonUI.commandInput.value = ""; };
