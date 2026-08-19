window.remindersAdd = function(content,dueAt) {
  const text = String(content || "").trim();
  if (!text) return {success:false,message:"ماكو محتوى للتذكير، سيدي."};
  const date = new Date(dueAt);
  if (!dueAt || Number.isNaN(date.getTime())) return {success:false,message:"وقت التذكير غير واضح، سيدي."};
  Xenon.memory.reminders.push({
    id:Date.now(),text,dueAt:date.toISOString(),completed:false,lastFiredAt:null,createdAt:new Date().toISOString()
  });
  saveMemory();
  return {success:true,message:`تم ضبط التذكير، سيدي: ${text}`,dueAt:date.toISOString()};
};

window.remindersList = function() {
  const active = Xenon.memory.reminders.filter(r=>r.completed!==true);
  if (!active.length) return {success:true,count:0,reminders:[],message:"ما عندك تذكيرات حالياً، سيدي."};
  return {success:true,count:active.length,reminders:active.map((r,i)=>({number:i+1,text:r.text,dueAt:r.dueAt,lastFiredAt:r.lastFiredAt||null}))};
};

window.remindersDelete = function(number) {
  const active = Xenon.memory.reminders.map((reminder,index)=>({reminder,index})).filter(e=>e.reminder.completed!==true);
  const displayIndex = Number(number)-1;
  if (displayIndex<0 || displayIndex>=active.length) return {success:false,message:"رقم التذكير غير موجود، سيدي."};
  const removed = Xenon.memory.reminders.splice(active[displayIndex].index,1)[0];
  if (Xenon.state.lastReminderId===removed.id) Xenon.state.lastReminderId=null;
  saveMemory();
  return {success:true,message:`تم حذف التذكير، سيدي: ${removed.text}`};
};

window.remindersAcknowledgeCurrent = function() {
  let idx = -1;
  if (Xenon.state.lastReminderId) idx = Xenon.memory.reminders.findIndex(r=>r.id===Xenon.state.lastReminderId);
  if (idx===-1) {
    const now = Date.now();
    const active = Xenon.memory.reminders.map((reminder,index)=>({reminder,index}))
      .filter(e=>!e.reminder.completed && new Date(e.reminder.dueAt).getTime()<=now)
      .sort((a,b)=>new Date(b.reminder.dueAt)-new Date(a.reminder.dueAt));
    if (active.length) idx = active[0].index;
  }
  if (idx===-1) return {success:false,message:"ماكو تذكير فعال حالياً، سيدي."};
  const removed = Xenon.memory.reminders.splice(idx,1)[0];
  Xenon.state.lastReminderId=null;
  saveMemory();
  return {success:true,message:`تم، سيدي. أوقفت ومسحت التذكير: ${removed.text}`};
};

window.requestXenonNotificationPermission = async function() {
  if (!("Notification" in window)) return false;
  if (Notification.permission==="granted") return true;
  if (Notification.permission==="denied") return false;
  try {
    Xenon.state.notificationPermissionAsked=true;
    return (await Notification.requestPermission())==="granted";
  } catch(e) { return false; }
};

window.showXenonNotification = function(title,body) {
  if (!("Notification" in window) || Notification.permission!=="granted") return false;
  try {
    const n = new Notification(title,{body,tag:"xenon-reminder-"+Date.now()});
    n.onclick = ()=>{ try{window.focus()}catch(e){} n.close(); };
    return true;
  } catch(e) { return false; }
};

let xenonReminderCheckRunning=false;
window.checkReminders = async function() {
  if (xenonReminderCheckRunning) return;
  xenonReminderCheckRunning=true;
  try {
    const now=Date.now();
    for (const reminder of Xenon.memory.reminders) {
      if (reminder.completed) continue;
      const due=new Date(reminder.dueAt).getTime();
      if (Number.isNaN(due) || now<due) continue;
      const first=!reminder.lastFiredAt;
      const last=reminder.lastFiredAt ? new Date(reminder.lastFiredAt).getTime() : null;
      const repeat=last && !Number.isNaN(last) && now-last>=XENON_CONFIG.reminders.repeatInterval;
      if (!first && !repeat) continue;
      reminder.lastFiredAt=new Date().toISOString();
      Xenon.state.lastReminderId=reminder.id;
      saveMemory();
      const message=`سيدي، تذكير: ${reminder.text}. راح أبقى أذكرك لحد ما تكلي صار.`;
      showXenonNotification("XENON",`سيدي، ${reminder.text}`);
      addConsoleMessage("SYSTEM","REMINDER");
      if (typeof xenonRespond==="function") await xenonRespond(message);
    }
  } finally {
    xenonReminderCheckRunning=false;
  }
};
