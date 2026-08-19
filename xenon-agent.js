window.XenonAgent = {
  enabled:true,
  maxToolRounds:XENON_CONFIG.openRouter.maxToolRounds,
  permissions:{localRead:true,localWrite:true,externalCommunication:false,destructiveActions:false,purchases:false}
};

window.xenonRespond = async function(message,speak=true) {
  if (!message) { setMode("online"); return; }
  addConsoleMessage("XENON",message);
  if (speak && typeof speakWithElevenLabs==="function") {
    await speakWithElevenLabs(message);
    return;
  }
  setMode("online");
};

window.askXenonAI = async function(userMessage) {
  setMode("processing");
  Xenon.agent.active=true;
  Xenon.agent.currentRequest=userMessage;
  Xenon.agent.currentActions=[];

  const messages=[
    {role:"system",content:buildSystemPrompt()},
    ...Xenon.conversation,
    {role:"user",content:userMessage}
  ];

  try {
    let finalText=null;
    const executedTools=[];

    for (let round=0; round<XenonAgent.maxToolRounds; round++) {
      const data=await openRouterRequest(messages);
      const assistantMessage=data?.choices?.[0]?.message;
      if (!assistantMessage) throw new Error("No assistant message returned.");

      const toolCalls=assistantMessage.tool_calls;
      if (Array.isArray(toolCalls) && toolCalls.length) {
        messages.push(assistantMessage);

        for (const toolCall of toolCalls) {
          const toolName=toolCall?.function?.name;
          let args={};
          try { args=JSON.parse(toolCall?.function?.arguments || "{}"); } catch(e) {}

          const action={id:toolCall.id,name:toolName,args,status:"running",result:null};
          Xenon.agent.currentActions.push(action);

          const result=await executeTool(toolName,args);
          action.result=result;
          action.status=result?.success===false ? "failed" : "completed";
          executedTools.push({name:toolName,args,result});

          messages.push({role:"tool",tool_call_id:toolCall.id,content:JSON.stringify(result)});
        }
        continue;
      }

      if (typeof assistantMessage.content==="string" && assistantMessage.content.trim()) {
        finalText=cleanXenonAIResponse(assistantMessage.content);
        break;
      }

      throw new Error("AI returned no usable response.");
    }

    if (!finalText) {
      if (executedTools.length) {
        const failed=executedTools.filter(x=>x.result?.success===false);
        finalText=failed.length===0 ? "تم تنفيذ الطلب، سيدي." :
          failed.length===executedTools.length ? "ما كدرت أنفذ الطلب، سيدي." :
          "نفذت جزء من الطلب، سيدي، لكن أكو خطوة ما نجحت.";
      } else {
        finalText="ما كدرت أكمل الطلب، سيدي.";
      }
    }

    Xenon.conversation.push({role:"user",content:userMessage},{role:"assistant",content:finalText});
    if (Xenon.conversation.length>12) Xenon.conversation=Xenon.conversation.slice(-12);

    Xenon.agent.active=false;
    await xenonRespond(finalText);
  } catch(e) {
    console.log("XENON AGENT ERROR:",e);
    Xenon.agent.active=false;
    addConsoleMessage("SYSTEM","AI AGENT ERROR");
    setMode("online");
  }
};

window.handleCommand = async function(command) {
  const clean=String(command||"").trim();
  if (!clean) return;
  addConsoleMessage("YOU",clean);
  await askXenonAI(clean);
};
