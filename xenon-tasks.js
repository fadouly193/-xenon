window.tasksAdd = function(content) {
  const text = String(content || "").trim();
  if (!text) return {success:false,message:"ماكو محتوى للمهمة، سيدي."};
  Xenon.memory.tasks.push({id:Date.now(),text,completed:false,createdAt:new Date().toISOString(),completedAt:null});
  saveMemory();
  return {success:true,message:`تمت إضافة المهمة، سيدي: ${text}`};
};

window.tasksList = function() {
  if (!Xenon.memory.tasks.length) return {success:true,count:0,tasks:[],message:"ما عندك مهام حالياً، سيدي."};
  return {success:true,count:Xenon.memory.tasks.length,tasks:Xenon.memory.tasks.map((t,i)=>({
    number:i+1,text:t.text,completed:t.completed,createdAt:t.createdAt,completedAt:t.completedAt||null
  }))};
};

window.tasksComplete = function(number) {
  const i = Number(number)-1;
  if (i<0 || i>=Xenon.memory.tasks.length) return {success:false,message:"رقم المهمة غير موجود، سيدي."};
  const task = Xenon.memory.tasks[i];
  if (task.completed) return {success:true,message:`المهمة منجزة أصلاً، سيدي: ${task.text}`};
  task.completed = true;
  task.completedAt = new Date().toISOString();
  saveMemory();
  return {success:true,message:`تم إنجاز المهمة، سيدي: ${task.text}`};
};

window.tasksDelete = function(number) {
  const i = Number(number)-1;
  if (i<0 || i>=Xenon.memory.tasks.length) return {success:false,message:"رقم المهمة غير موجود، سيدي."};
  const removed = Xenon.memory.tasks.splice(i,1)[0];
  saveMemory();
  return {success:true,message:`تم حذف المهمة، سيدي: ${removed.text}`};
};
