window.XENON_TOOLS = [
  {type:"function",function:{name:"notes_add",description:"Save a note in Xenon's persistent local memory.",parameters:{type:"object",properties:{content:{type:"string"}},required:["content"],additionalProperties:false}}},
  {type:"function",function:{name:"notes_list",description:"List all notes saved in Xenon.",parameters:{type:"object",properties:{},additionalProperties:false}}},
  {type:"function",function:{name:"notes_delete",description:"Delete a saved note by displayed number.",parameters:{type:"object",properties:{number:{type:"integer"}},required:["number"],additionalProperties:false}}},
  {type:"function",function:{name:"tasks_add",description:"Add a task to Xenon's persistent task list.",parameters:{type:"object",properties:{content:{type:"string"}},required:["content"],additionalProperties:false}}},
  {type:"function",function:{name:"tasks_list",description:"List all stored tasks.",parameters:{type:"object",properties:{},additionalProperties:false}}},
  {type:"function",function:{name:"tasks_complete",description:"Mark a task as completed by its displayed number.",parameters:{type:"object",properties:{number:{type:"integer"}},required:["number"],additionalProperties:false}}},
  {type:"function",function:{name:"tasks_delete",description:"Delete a task by displayed number.",parameters:{type:"object",properties:{number:{type:"integer"}},required:["number"],additionalProperties:false}}},
  {type:"function",function:{name:"reminders_add",description:"Create a future reminder.",parameters:{type:"object",properties:{content:{type:"string"},dueAt:{type:"string"}},required:["content","dueAt"],additionalProperties:false}}},
  {type:"function",function:{name:"reminders_list",description:"List all active reminders.",parameters:{type:"object",properties:{},additionalProperties:false}}},
  {type:"function",function:{name:"reminders_delete",description:"Delete an active reminder by displayed number.",parameters:{type:"object",properties:{number:{type:"integer"}},required:["number"],additionalProperties:false}}},
  {type:"function",function:{name:"reminders_acknowledge_current",description:"Stop and permanently delete the currently active reminder.",parameters:{type:"object",properties:{},additionalProperties:false}}},
  {type:"function",function:{name:"time_get",description:"Get the current local device time.",parameters:{type:"object",properties:{},additionalProperties:false}}},
  {type:"function",function:{name:"date_get",description:"Get the current local device date.",parameters:{type:"object",properties:{},additionalProperties:false}}}
];

window.getCurrentTime = ()=>({success:true,time:new Date().toLocaleTimeString("ar-IQ",{hour:"2-digit",minute:"2-digit"})});
window.getCurrentDate = ()=>({success:true,date:new Date().toLocaleDateString("ar-IQ",{weekday:"long",year:"numeric",month:"long",day:"numeric"})});

window.executeTool = async function(toolName,args={}) {
  switch(toolName) {
    case "notes_add": return notesAdd(args.content);
    case "notes_list": return notesList();
    case "notes_delete": return notesDelete(args.number);
    case "tasks_add": return tasksAdd(args.content);
    case "tasks_list": return tasksList();
    case "tasks_complete": return tasksComplete(args.number);
    case "tasks_delete": return tasksDelete(args.number);
    case "reminders_add": return remindersAdd(args.content,args.dueAt);
    case "reminders_list": return remindersList();
    case "reminders_delete": return remindersDelete(args.number);
    case "reminders_acknowledge_current": return remindersAcknowledgeCurrent();
    case "time_get": return getCurrentTime();
    case "date_get": return getCurrentDate();
    default: return {success:false,message:`Unknown Xenon tool: ${toolName}`};
  }
};
