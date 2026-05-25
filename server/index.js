import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ─── Config pública para el frontend ───────────────────────────────────────
app.get("/api/config", (_req, res) => {
  res.json({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  });
});

// ─── Análisis IA ────────────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  if (!WEBHOOK_URL) {
    return res
      .status(503)
      .json({ error: "Servicio no configurado: falta WEBHOOK_URL." });
  }

  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: "Body vacío." });
  }

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return res.status(upstream.status).json({
        error: `Error del agente n8n: ${upstream.status}`,
        detail: text,
      });
    }

    const data = await upstream.json();
    res.json(data);
  } catch (err) {
    res
      .status(502)
      .json({ error: `No se pudo conectar con el agente: ${err.message}` });
  }
});

// ─── Fallback SPA ───────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`PsychAI server running on port ${PORT}`));
