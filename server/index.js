import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/analyze", async (req, res) => {
  if (!WEBHOOK_URL) {
    return res.status(503).json({ error: "Servicio no configurado: falta WEBHOOK_URL en el servidor." });
  }

  const { message, chatInput } = req.body;
  if (!message && !chatInput) {
    return res.status(400).json({ error: "El campo 'message' es obligatorio." });
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, chatInput }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return res.status(upstream.status).json({ error: `Error del agente n8n: ${upstream.status}`, detail: text });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: `No se pudo conectar con el agente: ${err.message}` });
  }
});

// Fallback — SPA
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`PsychAI server running on port ${PORT}`));
