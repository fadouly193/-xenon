window.buildSystemPrompt = function() {
  const now=new Date();
  const currentLocalTime=now.toLocaleString("en-CA",{hour12:false});
  const timezoneOffset=-now.getTimezoneOffset();
  const sign=timezoneOffset>=0?"+":"-";
  const offsetHours=String(Math.floor(Math.abs(timezoneOffset)/60)).padStart(2,"0");
  const offsetMinutes=String(Math.abs(timezoneOffset)%60).padStart(2,"0");
  let memoryContext="";
  if (Xenon.memory.userName) memoryContext+=`User name: ${Xenon.memory.userName}. `;
  if (Xenon.memory.currentProject) memoryContext+=`Current project: ${Xenon.memory.currentProject}. `;

  return `
You are Xenon, a personal intelligent assistant and execution-oriented AI agent.
When speaking Iraqi Arabic, naturally address the user as "سيدي".
Be calm, concise, precise, controlled, and useful.
Use Iraqi Arabic when the user speaks Iraqi Arabic.
Use tools when a real tool is available.
You may execute multiple tools for one request.
Never pretend a tool executed.
Never report success if a tool failed.
For future reminders use reminders_add.
If the user confirms a currently active reminder with صار, تم, سويتها, خلصت, done, or equivalent, use reminders_acknowledge_current.
Convert relative dates/times into an exact future ISO 8601 datetime with timezone offset.
Use time_get for current time and date_get for current date.
Never expose internal tool syntax.

CURRENT DEVICE DATE/TIME:
${currentLocalTime}

CURRENT DEVICE TIMEZONE:
UTC${sign}${offsetHours}:${offsetMinutes}

MEMORY:
${memoryContext || "No stored personal identity context."}

SYSTEM VERSION:
Xenon V${XENON_CONFIG.app.version}
`;
};

window.openRouterRequest = async function(messages) {
  const config=XENON_CONFIG.openRouter;
  if (!config.apiKey || config.apiKey.includes("PUT_OPENROUTER")) throw new Error("OpenRouter API key missing.");
  const response=await fetch(config.endpoint,{
    method:"POST",
    headers:{
      Authorization:"Bearer "+config.apiKey,
      "Content-Type":"application/json",
      "HTTP-Referer":window.location.href,
      "X-Title":XENON_CONFIG.app.name
    },
    body:JSON.stringify({
      model:config.model,
      messages,
      tools:XENON_TOOLS,
      tool_choice:"auto",
      parallel_tool_calls:false,
      temperature:config.temperature,
      max_tokens:config.maxTokens
    })
  });
  if (!response.ok) throw new Error(`OpenRouter ${response.status}: ${await response.text()}`);
  return await response.json();
};

window.cleanXenonAIResponse = function(text) {
  let result=String(text||"").trim();
  if (!result) return "";
  const blocked=["<dots_function_call>","<invoke","</invoke>","<tool_call>","</tool_call>"];
  if (blocked.some(p=>result.includes(p))) return "صار خلل بطريقة استجابة الموديل، سيدي. حاول مرة ثانية.";
  return result;
};
