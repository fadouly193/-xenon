window.XENON_CONFIG = {

  app: {
    name: "Xenon",
    version: "1.6",
    environment: "production"
  },


  // ===================================================
  // SECURE BACKEND
  // ===================================================

  backend: {

    endpoint:
      "/api/index"

  },


  // ===================================================
  // OPENROUTER
  // ===================================================

  openRouter: {

    model:
      "openrouter/free",

    temperature:
      0.5,

    maxTokens:
      500,

    maxToolRounds:
      8

  },


  // ===================================================
  // ELEVENLABS
  // ===================================================

  elevenLabs: {

    voiceId:
      "IKne3meq5aSn9XLyUdCD",

    voiceModel:
      "eleven_multilingual_v2",

    speechToTextModel:
      "scribe_v2",

    outputFormat:
      "mp3_44100_128",

    voiceSettings: {

      stability:
        0.62,

      similarityBoost:
        0.82,

      style:
        0.08,

      speakerBoost:
        true

    }

  },


  // ===================================================
  // VOICE
  // ===================================================

  voice: {

    language:
      "ar-IQ",

    wakeWord:
      "زينون",

    wakeWordEnglish:
      "xenon",

    wakeResponse:
      "نعم سيدي",

    sleepWords: [
      "كافي",
      "خلص",
      "توقف",
      "وقف",
      "إنهاء",
      "انهاء",
      "خلاص"
    ],

    sleepResponse:
      "حاضر سيدي",

    silenceStopDelay:
      1200,

    maxRecordTime:
      15000

  },


  // ===================================================
  // REMINDERS
  // ===================================================

  reminders: {

    checkInterval:
      30000,

    repeatInterval:
      5 * 60 * 1000

  },


  // ===================================================
  // STORAGE
  // ===================================================

  storage: {

    memoryKey:
      "xenon_memory"

  }

};
