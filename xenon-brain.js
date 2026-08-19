// =====================================================
// BRAIN 01 — SYSTEM PROMPT
// =====================================================

window.buildSystemPrompt =
  function () {

    const now =
      new Date();


    const currentLocalTime =
      now.toLocaleString(
        "en-CA",
        {
          hour12:
            false
        }
      );


    const timezoneOffset =
      -now.getTimezoneOffset();


    const sign =
      timezoneOffset >= 0
        ? "+"
        : "-";


    const offsetHours =
      String(
        Math.floor(
          Math.abs(
            timezoneOffset
          ) / 60
        )
      ).padStart(
        2,
        "0"
      );


    const offsetMinutes =
      String(
        Math.abs(
          timezoneOffset
        ) % 60
      ).padStart(
        2,
        "0"
      );


    const currentOffset =
      `${sign}${offsetHours}:${offsetMinutes}`;


    let memoryContext =
      "";


    if (
      Xenon.memory.userName
    ) {

      memoryContext +=
        `User name: ${Xenon.memory.userName}. `;

    }


    if (
      Xenon.memory.currentProject
    ) {

      memoryContext +=
        `Current project: ${Xenon.memory.currentProject}. `;

    }


    return `
You are Xenon, a personal intelligent assistant and execution-oriented AI agent.

IDENTITY:
Your name is Xenon.
The user is your principal.
When speaking Iraqi Arabic, naturally address the user as "سيدي".
Do not repeat "سيدي" in every sentence.

PERSONALITY:
- Calm
- Controlled
- Intelligent
- Precise
- Concise by default
- Confident without arrogance
- No emojis
- No excessive greetings
- Do not sound like a generic chatbot

LANGUAGE:
- Iraqi Arabic when the user speaks Iraqi Arabic
- English when the user speaks English
- Technical terminology may stay in English

AGENT MODE:
You are not only conversational.
You are an execution-oriented AI agent.

When the user gives a request:
1. Understand the final objective.
2. Determine whether one or more available tools are required.
3. Create an internal execution plan.
4. Execute the required tools in the correct order.
5. Inspect each tool result before continuing.
6. Continue using additional tools when needed.
7. Only report completion after required actions actually succeed.

MULTI-STEP EXECUTION:
You may use multiple tools for one request.

Example:
User:
"ذكرني باجر أراجع المخطط وخليها عندي كمهمة"

Required:
1. tasks_add
2. reminders_add
3. Verify both succeeded
4. Respond briefly

Example:
User:
"خزن موعد العميل كملاحظة وضيفلي مهمة أجهز العرض"

Required:
1. notes_add
2. tasks_add
3. Verify
4. Respond

Do not stop after the first tool if the request contains multiple actions.

TOOL RULES:
- Use real tools when available.
- Never pretend a tool executed.
- Never fake success.
- If one step fails, explain which one failed.
- If part of a request succeeds, clearly state what succeeded and what failed.

NOTES:
Use note tools for notes.

TASKS:
Use task tools for tasks.

REMINDERS:
- Use reminders_add for future reminders.
- Use reminders_list to list reminders.
- Use reminders_delete to delete one.
- Active reminders repeat until completion is confirmed.
- If user says "صار", "تم", "سويتها", "خلصت", "done", or equivalent after an active reminder, use reminders_acknowledge_current.
- Do not create a new reminder when user is acknowledging an existing one.

TIME EXPRESSIONS:
Convert:
- اليوم
- باجر
- بعد دقيقة
- بعد دقيقتين
- بعد نص ساعة
- بعد ساعة
- بعد ساعتين
- الساعة 8

into an exact future datetime.

Always include timezone offset in dueAt.
If time is ambiguous, ask for clarification.

TIME:
Use time_get for current time.
Use date_get for current date.

CRITICAL:
- Never expose internal tool syntax.
- Never print fake tool calls.
- Never print XML.
- Never print <invoke>.
- Never print <dots_function_call>.

CURRENT DEVICE DATE/TIME:
${currentLocalTime}

CURRENT DEVICE TIMEZONE:
UTC${currentOffset}

MEMORY:
${memoryContext || "No stored personal identity context."}

SYSTEM VERSION:
Xenon V${XENON_CONFIG.app.version}
`;

  };


// =====================================================
// BRAIN 02 — OPENROUTER VIA XENON BACKEND
// =====================================================

window.openRouterRequest =
  async function (
    messages
  ) {

    const config =
      XENON_CONFIG.openRouter;


    const response =
      await fetch(

        XENON_CONFIG
          .backend
          .endpoint +
        "?action=chat",

        {

          method:
            "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              model:
                config.model,

              messages,

              tools:
                XENON_TOOLS,

              tool_choice:
                "auto",

              parallel_tool_calls:
                false,

              temperature:
                config.temperature,

              max_tokens:
                config.maxTokens

            })

        }

      );


    if (
      !response.ok
    ) {

      const errorText =
        await response.text();


      console.log(
        "XENON BACKEND CHAT ERROR:",
        response.status,
        errorText
      );


      throw new Error(
        `Xenon Backend ${response.status}: ${errorText}`
      );

    }


    return await response.json();

  };


// =====================================================
// BRAIN 03 — RESPONSE SANITIZER
// =====================================================

window.cleanXenonAIResponse =
  function (text) {

    let result =
      String(
        text ||
        ""
      ).trim();


    if (!result) {

      return "";

    }


    const blockedPatterns = [

      "<dots_function_call>",

      "<invoke",

      "</invoke>",

      "<tool_call>",

      "</tool_call>"

    ];


    const hasBlockedPattern =
      blockedPatterns.some(
        function (pattern) {

          return result.includes(
            pattern
          );

        }
      );


    if (
      hasBlockedPattern
    ) {

      return "صار خلل بطريقة استجابة الموديل، سيدي. حاول مرة ثانية.";

    }


    return result;

  };


// =====================================================
// BRAIN 04 — READY
// =====================================================

console.log(
  "XENON BRAIN READY — SECURE BACKEND MODE"
);
