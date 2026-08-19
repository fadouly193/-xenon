// =====================================================
// VOICE 01 — AUDIO PLAYER
// =====================================================

window.xenonAudioPlayer =
  new Audio();

xenonAudioPlayer.preload =
  "auto";


// =====================================================
// VOICE 02 — AUDIO UNLOCK
// =====================================================

window.unlockXenonAudio =
  async function () {

    if (
      Xenon.state.audioUnlocked
    ) {

      return true;

    }


    try {

      xenonAudioPlayer.muted =
        true;


      xenonAudioPlayer.src =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";


      await xenonAudioPlayer.play();


      xenonAudioPlayer.pause();


      xenonAudioPlayer.currentTime =
        0;


      xenonAudioPlayer.muted =
        false;


      Xenon.state.audioUnlocked =
        true;


      return true;

    }

    catch (error) {

      return false;

    }

  };


// =====================================================
// VOICE 03 — STOP AUDIO
// =====================================================

window.stopXenonAudio =
  function () {

    try {

      xenonAudioPlayer.pause();

      xenonAudioPlayer.currentTime =
        0;

    }

    catch (error) {}


    if (
      Xenon.audio.objectURL
    ) {

      URL.revokeObjectURL(
        Xenon.audio.objectURL
      );

    }


    Xenon.audio.objectURL =
      null;

    Xenon.audio.player =
      null;

  };


// =====================================================
// VOICE 04 — ELEVENLABS TTS VIA BACKEND
// =====================================================

window.speakWithElevenLabs =
  async function (text) {

    stopXenonAudio();


    const config =
      XENON_CONFIG.elevenLabs;


    try {

      const response =
        await fetch(

          XENON_CONFIG
            .backend
            .endpoint +
          "?action=tts",

          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                text,

                voiceId:
                  config.voiceId,

                modelId:
                  config.voiceModel,

                outputFormat:
                  config.outputFormat,

                voiceSettings: {

                  stability:
                    config.voiceSettings
                      .stability,

                  similarity_boost:
                    config.voiceSettings
                      .similarityBoost,

                  style:
                    config.voiceSettings
                      .style,

                  use_speaker_boost:
                    config.voiceSettings
                      .speakerBoost

                }

              })

          }

        );


      if (
        !response.ok
      ) {

        const errorText =
          await response.text();


        console.log(
          "XENON TTS ERROR:",
          response.status,
          errorText
        );


        addConsoleMessage(
          "SYSTEM",
          "VOICE ERROR " +
          response.status
        );


        setMode(
          "online"
        );


        return false;

      }


      const audioBlob =
        await response.blob();


      const audioURL =
        URL.createObjectURL(
          audioBlob
        );


      Xenon.audio.objectURL =
        audioURL;


      Xenon.audio.player =
        xenonAudioPlayer;


      xenonAudioPlayer.src =
        audioURL;


      xenonAudioPlayer.muted =
        false;


      xenonAudioPlayer.volume =
        1;


      xenonAudioPlayer.onplay =
        function () {

          setMode(
            "speaking"
          );

        };


      xenonAudioPlayer.onended =
        function () {

          if (
            Xenon.audio.objectURL
          ) {

            URL.revokeObjectURL(
              Xenon.audio.objectURL
            );

          }


          Xenon.audio.objectURL =
            null;


          Xenon.audio.player =
            null;


          setMode(
            "online"
          );

        };


      xenonAudioPlayer.onerror =
        function () {

          setMode(
            "online"
          );

        };


      await xenonAudioPlayer.play();


      return true;

    }

    catch (error) {

      console.log(
        "XENON VOICE PLAYBACK FAILED:",
        error
      );


      addConsoleMessage(
        "SYSTEM",
        "VOICE PLAYBACK FAILED"
      );


      setMode(
        "online"
      );


      return false;

    }

  };


// =====================================================
// VOICE 05 — VOICE STATE
// =====================================================

window.XenonVoiceInput = {

  recording:
    false,

  processing:
    false,

  stream:
    null,

  recorder:
    null,

  chunks:
    [],

  audioContext:
    null,

  analyser:
    null,

  source:
    null,

  monitorFrame:
    null,

  startedAt:
    null,

  speechDetected:
    false,

  lastSpeechAt:
    null

};


// =====================================================
// VOICE 06 — MIME TYPE
// =====================================================

window.getXenonRecordingMimeType =
  function () {

    const types = [

      "audio/mp4",

      "audio/webm;codecs=opus",

      "audio/webm",

      "audio/ogg;codecs=opus"

    ];


    for (
      const type of types
    ) {

      if (
        MediaRecorder
          .isTypeSupported(
            type
          )
      ) {

        return type;

      }

    }


    return "";

  };


// =====================================================
// VOICE 07 — AUDIO EXTENSION
// =====================================================

window.getXenonAudioExtension =
  function (
    mimeType
  ) {

    if (
      mimeType.includes(
        "mp4"
      )
    ) {

      return "m4a";

    }


    if (
      mimeType.includes(
        "ogg"
      )
    ) {

      return "ogg";

    }


    return "webm";

  };


// =====================================================
// VOICE 08 — OPEN MICROPHONE
// =====================================================

window.openXenonMicrophone =
  async function () {

    if (
      !navigator
        .mediaDevices
        ?.getUserMedia
    ) {

      throw new Error(
        "getUserMedia unavailable"
      );

    }


    return await navigator
      .mediaDevices
      .getUserMedia({

        audio: {

          echoCancellation:
            true,

          noiseSuppression:
            true,

          autoGainControl:
            true

        }

      });

  };


// =====================================================
// VOICE 09 — START RECORDING
// =====================================================

window.startXenonVoiceRecording =
  async function () {

    if (
      XenonVoiceInput.recording ||
      XenonVoiceInput.processing
    ) {

      return;

    }


    if (
      Xenon.state.status ===
      "speaking"
    ) {

      stopXenonAudio();

    }


    try {

      const stream =
        await openXenonMicrophone();


      XenonVoiceInput.stream =
        stream;


      const mimeType =
        getXenonRecordingMimeType();


      const recorder =
        new MediaRecorder(

          stream,

          mimeType
            ? {
                mimeType
              }
            : undefined

        );


      XenonVoiceInput.recorder =
        recorder;


      XenonVoiceInput.chunks =
        [];


      XenonVoiceInput.startedAt =
        Date.now();


      XenonVoiceInput.speechDetected =
        false;


      XenonVoiceInput.lastSpeechAt =
        null;


      recorder.ondataavailable =
        function (event) {

          if (
            event.data?.size >
            0
          ) {

            XenonVoiceInput
              .chunks
              .push(
                event.data
              );

          }

        };


      recorder.onstop =
        finishXenonVoiceRecording;


      recorder.start();


      XenonVoiceInput.recording =
        true;


      Xenon.voice.recording =
        true;


      setMode(
        "listening"
      );


      startXenonSilenceMonitor();

    }

    catch (error) {

      console.log(
        "XENON MICROPHONE ERROR:",
        error
      );


      XenonVoiceInput.recording =
        false;


      Xenon.voice.recording =
        false;


      cleanupXenonMicrophone();


      addConsoleMessage(
        "SYSTEM",
        "MICROPHONE ERROR"
      );


      setMode(
        "online"
      );

    }

  };


// =====================================================
// VOICE 10 — SILENCE MONITOR
// =====================================================

window.startXenonSilenceMonitor =
  function () {

    try {

      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


      if (
        !AudioContextClass
      ) {

        return;

      }


      XenonVoiceInput.audioContext =
        new AudioContextClass();


      XenonVoiceInput.source =
        XenonVoiceInput
          .audioContext
          .createMediaStreamSource(
            XenonVoiceInput.stream
          );


      XenonVoiceInput.analyser =
        XenonVoiceInput
          .audioContext
          .createAnalyser();


      XenonVoiceInput
        .analyser
        .fftSize =
        2048;


      XenonVoiceInput
        .source
        .connect(
          XenonVoiceInput.analyser
        );


      const buffer =
        new Uint8Array(

          XenonVoiceInput
            .analyser
            .fftSize

        );


      const threshold =
        0.025;


      function monitor() {

        if (
          !XenonVoiceInput.recording
        ) {

          return;

        }


        XenonVoiceInput
          .analyser
          .getByteTimeDomainData(
            buffer
          );


        let sum =
          0;


        for (
          const b of buffer
        ) {

          const v =
            (b - 128) /
            128;


          sum +=
            v * v;

        }


        const rms =
          Math.sqrt(
            sum /
            buffer.length
          );


        const now =
          Date.now();


        const elapsed =
          now -
          XenonVoiceInput
            .startedAt;


        if (
          rms >
          threshold
        ) {

          XenonVoiceInput.speechDetected =
            true;


          XenonVoiceInput.lastSpeechAt =
            now;

        }


        if (
          XenonVoiceInput.speechDetected &&
          XenonVoiceInput.lastSpeechAt
        ) {

          const silenceTime =
            now -
            XenonVoiceInput
              .lastSpeechAt;


          if (
            elapsed >
              500 &&
            silenceTime >
              XENON_CONFIG
                .voice
                .silenceStopDelay
          ) {

            stopXenonVoiceRecording();

            return;

          }

        }


        if (
          elapsed >=
          XENON_CONFIG
            .voice
            .maxRecordTime
        ) {

          stopXenonVoiceRecording();

          return;

        }


        XenonVoiceInput.monitorFrame =
          requestAnimationFrame(
            monitor
          );

      }


      monitor();

    }

    catch (error) {

      console.log(
        "XENON SILENCE MONITOR ERROR:",
        error
      );

    }

  };


// =====================================================
// VOICE 11 — STOP RECORDING
// =====================================================

window.stopXenonVoiceRecording =
  function () {

    if (
      !XenonVoiceInput.recording
    ) {

      return;

    }


    XenonVoiceInput.recording =
      false;


    Xenon.voice.recording =
      false;


    if (
      XenonVoiceInput.monitorFrame
    ) {

      cancelAnimationFrame(
        XenonVoiceInput
          .monitorFrame
      );


      XenonVoiceInput.monitorFrame =
        null;

    }


    if (
      XenonVoiceInput.recorder &&
      XenonVoiceInput
        .recorder
        .state !==
        "inactive"
    ) {

      try {

        XenonVoiceInput
          .recorder
          .stop();

      }

      catch (error) {}

    }

  };


// =====================================================
// VOICE 12 — FINISH RECORDING
// =====================================================

window.finishXenonVoiceRecording =
  async function () {

    const recorder =
      XenonVoiceInput.recorder;


    const mimeType =
      recorder?.mimeType ||
      "audio/webm";


    const chunks =
      XenonVoiceInput.chunks;


    cleanupXenonMicrophone();


    XenonVoiceInput.recorder =
      null;


    XenonVoiceInput.chunks =
      [];


    if (
      !chunks.length
    ) {

      setMode(
        "online"
      );

      return;

    }


    const blob =
      new Blob(
        chunks,
        {
          type:
            mimeType
        }
      );


    if (
      blob.size <
      500
    ) {

      setMode(
        "online"
      );

      return;

    }


    XenonVoiceInput.processing =
      true;


    Xenon.voice.processing =
      true;


    setMode(
      "processing"
    );


    try {

      const transcript =
        await transcribeXenonAudio(

          blob,

          mimeType

        );


      if (
        !transcript
      ) {

        addConsoleMessage(
          "SYSTEM",
          "NO SPEECH DETECTED"
        );


        setMode(
          "online"
        );


        return;

      }


      addConsoleMessage(
        "YOU",
        transcript
      );


      await handleCommand(
        transcript
      );

    }

    catch (error) {

      console.log(
        "XENON STT FAILED:",
        error
      );


      addConsoleMessage(
        "SYSTEM",
        "VOICE TRANSCRIPTION FAILED"
      );


      setMode(
        "online"
      );

    }

    finally {

      XenonVoiceInput.processing =
        false;


      Xenon.voice.processing =
        false;

    }

  };


// =====================================================
// VOICE 13 — ELEVENLABS STT VIA BACKEND
// =====================================================

window.transcribeXenonAudio =
  async function (
    audioBlob,
    mimeType
  ) {

    const config =
      XENON_CONFIG.elevenLabs;


    const extension =
      getXenonAudioExtension(
        mimeType
      );


    const file =
      new File(

        [
          audioBlob
        ],

        `xenon-voice.${extension}`,

        {
          type:
            mimeType
        }

      );


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    formData.append(
      "model_id",
      config.speechToTextModel
    );


    formData.append(
      "language_code",
      "ar"
    );


    formData.append(
      "num_speakers",
      "1"
    );


    const response =
      await fetch(

        XENON_CONFIG
          .backend
          .endpoint +
        "?action=stt",

        {

          method:
            "POST",

          body:
            formData

        }

      );


    if (
      !response.ok
    ) {

      const errorText =
        await response.text();


      throw new Error(
        `STT ${response.status}: ${errorText}`
      );

    }


    const data =
      await response.json();


    return String(
      data?.text ||
      ""
    ).trim();

  };


// =====================================================
// VOICE 14 — CLEANUP MICROPHONE
// =====================================================

window.cleanupXenonMicrophone =
  function () {

    if (
      XenonVoiceInput.monitorFrame
    ) {

      cancelAnimationFrame(
        XenonVoiceInput
          .monitorFrame
      );


      XenonVoiceInput.monitorFrame =
        null;

    }


    try {

      XenonVoiceInput
        .source
        ?.disconnect();

    }

    catch (error) {}


    XenonVoiceInput.source =
      null;


    XenonVoiceInput.analyser =
      null;


    try {

      XenonVoiceInput
        .audioContext
        ?.close();

    }

    catch (error) {}


    XenonVoiceInput.audioContext =
      null;


    if (
      XenonVoiceInput.stream
    ) {

      XenonVoiceInput
        .stream
        .getTracks()
        .forEach(
          function (track) {

            track.stop();

          }
        );

    }


    XenonVoiceInput.stream =
      null;

  };


// =====================================================
// VOICE 15 — READY
// =====================================================

console.log(
  "XENON VOICE READY — SECURE BACKEND MODE"
);
