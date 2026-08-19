window.XENON_CONFIG = {
  app: { name: "Xenon", version: "1.6", environment: "development" },
  openRouter: {
    apiKey: "PUT_OPENROUTER_API_KEY_HERE",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "openrouter/free",
    temperature: 0.5,
    maxTokens: 500,
    maxToolRounds: 8
  },
  elevenLabs: {
    apiKey: "PUT_ELEVENLABS_API_KEY_HERE",
    voiceId: "IKne3meq5aSn9XLyUdCD",
    voiceModel: "eleven_multilingual_v2",
    speechToTextModel: "scribe_v2",
    textToSpeechEndpoint: "https://api.elevenlabs.io/v1/text-to-speech",
    speechToTextEndpoint: "https://api.elevenlabs.io/v1/speech-to-text",
    outputFormat: "mp3_44100_128",
    voiceSettings: {
      stability: 0.62,
      similarityBoost: 0.82,
      style: 0.08,
      speakerBoost: true
    }
  },
  voice: {
    language: "ar-IQ",
    wakeWord: "زينون",
    wakeWordEnglish: "xenon",
    wakeResponse: "نعم سيدي",
    sleepWords: ["كافي","خلص","توقف","وقف","إنهاء","انهاء","خلاص"],
    sleepResponse: "حاضر سيدي",
    silenceStopDelay: 1200,
    maxRecordTime: 15000
  },
  reminders: {
    checkInterval: 30000,
    repeatInterval: 5 * 60 * 1000
  },
  storage: { memoryKey: "xenon_memory" }
};
