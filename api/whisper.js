import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY não configurada na Vercel." });
  }

  try {
    const form = formidable({});
    const [, files] = await form.parse(req);
    const audioFile = files.file?.[0] || files.file;

    if (!audioFile) {
      return res.status(400).json({ error: "Nenhum arquivo de áudio enviado." });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(audioFile.filepath), {
      filename: "audio.webm",
      contentType: "audio/webm",
    });
    formData.append("model", "whisper-1");
    formData.append("language", "pt");
    formData.append("temperature", "0");
    formData.append(
      "prompt",
      "Laudo de ultrassonografia radiológica: Fígado de dimensões normais, ecotextura homogênea. Cisto simples no segmento IV medindo 10 mm. Nódulo hiperecogênico no segmento VI medindo 1,5 cm. Colecistolitíase, vias biliares normais. Rins tópicos, cisto renal simples, nefrolitíase à direita. BI-RADS, TI-RADS."
    );

    const openAiResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(openAiResponse.status).json({ error: data.error?.message || "Erro no Whisper" });
    }

    return res.status(200).json({ text: data.text });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor de áudio: " + error.message });
  }
}
