window.notesAdd = function(content) {
  const text = String(content || "").trim();
  if (!text) return {success:false,message:"ماكو محتوى للملاحظة، سيدي."};
  Xenon.memory.notes.push({id:Date.now(),text,createdAt:new Date().toISOString()});
  saveMemory();
  return {success:true,message:`تم حفظ الملاحظة، سيدي: ${text}`};
};

window.notesList = function() {
  if (!Xenon.memory.notes.length) return {success:true,count:0,notes:[],message:"ما عندك ملاحظات محفوظة، سيدي."};
  return {success:true,count:Xenon.memory.notes.length,notes:Xenon.memory.notes.map((n,i)=>({number:i+1,text:n.text,createdAt:n.createdAt}))};
};

window.notesDelete = function(number) {
  const i = Number(number)-1;
  if (i<0 || i>=Xenon.memory.notes.length) return {success:false,message:"رقم الملاحظة غير موجود، سيدي."};
  const removed = Xenon.memory.notes.splice(i,1)[0];
  saveMemory();
  return {success:true,message:`تم حذف الملاحظة، سيدي: ${removed.text}`};
};
