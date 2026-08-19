// =====================================================
// XENON API 01 — MAIN BACKEND
// =====================================================

module.exports = async function handler(req, res) {

  // ===================================================
  // API 02 — CORS / METHOD
  // ===================================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  if (req.method === "OPTIONS") {

    return res
      .status(204)
      .end();

  }


  if (req.method !== "POST") {

    return res
      .status(405)
      .json({
        success: false,
        error: "METHOD_NOT_ALLOWED"
      });

  }


  // ===================================================
  // API 03 — ACTION
  // ===================================================

  const action =
    String(
      req.query?.action ||
      ""
    ).trim();


  try {

    // =================================================
    // API 04 — OPENROUTER
    // =================================================

    if (action === "chat") {

      const apiKey =
        process.env
          .OPENROUTER_API_KEY;


      if (!apiKey) {

        console.log(
          "OPENROUTER KEY MISSING"
        );


        return res
          .status(500)
          .json({
            success: false,
            error: "OPENROUTER_API_KEY_MISSING"
          });

      }


      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : (req.body || {});


      console.log(
        "OPENROUTER REQUEST MODEL:",
        body.model
      );


      const response =
        await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",

            headers: {

              Authorization:
                `Bearer ${apiKey}`,

              "Content-Type":
                "application/json",

              "HTTP-Referer":
                "https://xenon-sable.vercel.app",

              "X-Title":
                "Xenon"

            },

            body:
              JSON.stringify(
                body
              )

          }
        );


      const responseText =
        await response.text();


      console.log(
        "OPENROUTER STATUS:",
        response.status
      );


      console.log(
        "OPENROUTER RESPONSE:",
        responseText
      );


      res.status(
        response.status
      );


      res.setHeader(
        "Content-Type",
        "application/json"
      );


      return res.send(
        responseText
      );

    }


    // =================================================
    // API 05 — ELEVENLABS TEXT TO SPEECH
    // =================================================

    if (action === "tts") {

      const apiKey =
        process.env
          .ELEVENLABS_API_KEY;


      if (!apiKey) {

        console.log(
          "ELEVENLABS KEY MISSING"
        );


        return res
          .status(500)
          .json({
            success: false,
            error: "ELEVENLABS_API_KEY_MISSING"
          });

      }


      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body)
          : (req.body || {});


      const text =
        String(
          body.text ||
          ""
        ).trim();


      const voiceId =
        String(
          body.voiceId ||
          ""
        ).trim();


      const modelId =
        body.modelId ||
        "eleven_multilingual_v2";


      const outputFormat =
        body.outputFormat ||
        "mp3_44100_128";


      if (
        !text ||
        !voiceId
      ) {

        return res
          .status(400)
          .json({
            success: false,
            error: "TEXT_OR_VOICE_MISSING"
          });

      }


      const endpoint =
        "https://api.elevenlabs.io/v1/text-to-speech/" +
        encodeURIComponent(
          voiceId
        ) +
        "?output_format=" +
        encodeURIComponent(
          outputFormat
        );


      const response =
        await fetch(
          endpoint,
          {
            method: "POST",

            headers: {

              "xi-api-key":
                apiKey,

              "Content-Type":
                "application/json",

              Accept:
                "audio/mpeg"

            },

            body:
              JSON.stringify({

                text,

                model_id:
                  modelId,

                voice_settings:
                  body.voiceSettings ||
                  {

                    stability:
                      0.62,

                    similarity_boost:
                      0.82,

                    style:
                      0.08,

                    use_speaker_boost:
                      true

                  }

              })

          }
        );


      if (!response.ok) {

        const errorText =
          await response.text();


        console.log(
          "ELEVENLABS TTS STATUS:",
          response.status
        );


        console.log(
          "ELEVENLABS TTS RESPONSE:",
          errorText
        );


        return res
          .status(
            response.status
          )
          .json({
            success: false,
            error: "ELEVENLABS_TTS_ERROR",
            details: errorText
          });

      }


      const audioBuffer =
        Buffer.from(
          await response
            .arrayBuffer()
        );


      res.status(200);


      res.setHeader(
        "Content-Type",
        "audio/mpeg"
      );


      res.setHeader(
        "Content-Length",
        audioBuffer.length
      );


      return res.end(
        audioBuffer
      );

    }


    // =================================================
    // API 06 — ELEVENLABS SPEECH TO TEXT
    // =================================================

    if (action === "stt") {

      const apiKey =
        process.env
          .ELEVENLABS_API_KEY;


      if (!apiKey) {

        return res
          .status(500)
          .json({
            success: false,
            error: "ELEVENLABS_API_KEY_MISSING"
          });

      }


      const contentType =
        req.headers[
          "content-type"
        ];


      if (
        !contentType ||
        !contentType.includes(
          "multipart/form-data"
        )
      ) {

        return res
          .status(400)
          .json({
            success: false,
            error: "INVALID_AUDIO_FORM"
          });

      }


      const response =
        await fetch(
          "https://api.elevenlabs.io/v1/speech-to-text",
          {
            method: "POST",

            headers: {

              "xi-api-key":
                apiKey,

              "Content-Type":
                contentType

            },

            body:
              req,

            duplex:
              "half"

          }
        );


      const responseText =
        await response.text();


      console.log(
        "ELEVENLABS STT STATUS:",
        response.status
      );


      console.log(
        "ELEVENLABS STT RESPONSE:",
        responseText
      );


      res.status(
        response.status
      );


      res.setHeader(
        "Content-Type",
        "application/json"
      );


      return res.send(
        responseText
      );

    }


    // =================================================
    // API 07 — UNKNOWN ACTION
    // =================================================

    return res
      .status(400)
      .json({
        success: false,
        error: "UNKNOWN_ACTION"
      });

  }

  catch (error) {

    console.error(
      "XENON API ERROR:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,
        error: "XENON_BACKEND_ERROR",
        message:
          error?.message ||
          "Unknown server error"
      });

  }

};
