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

  const { paciente, escalas, evaluacion_clinica, resumen_sesion, chatInput } = req.body;

  if (!chatInput && !resumen_sesion) {
    return res.status(400).json({ error: "El campo 'resumen_sesion' es obligatorio." });
  }

  // Payload estructurado que recibe n8n con todos los campos separados
  const payload = {
    // Campo principal para el agente actual (compatibilidad)
    chatInput: chatInput || resumen_sesion,

    // Datos estructurados para la nueva arquitectura
    paciente: {
      nombre:  paciente?.nombre  || "No especificado",
      edad:    paciente?.edad    || "No especificado",
      genero:  paciente?.genero  || "No especificado",
      motivo:  paciente?.motivo  || "No especificado",
    },
    escalas: {
      phq9:                 escalas?.phq9                 ?? 0,
      gad7:                 escalas?.gad7                 ?? 0,
      severidad_depresion:  escalas?.severidad_depresion  || "No calculado",
      porcentaje_depresion: escalas?.porcentaje_depresion ?? 0,
      severidad_ansiedad:   escalas?.severidad_ansiedad   || "No calculado",
      porcentaje_ansiedad:  escalas?.porcentaje_ansiedad  ?? 0,
    },
    evaluacion_clinica: {
      ideacion_suicida:       evaluacion_clinica?.ideacion_suicida       || "ninguna",
      sintomas_depresivos:    evaluacion_clinica?.sintomas_depresivos    || "",
      sintomas_ansiosos:      evaluacion_clinica?.sintomas_ansiosos      || "",
      factores_precipitantes: evaluacion_clinica?.factores_precipitantes || "",
      factores_protectores:   evaluacion_clinica?.factores_protectores   || "",
    },
    resumen_sesion: resumen_sesion || "",
  };

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    res.status(502).json({ error: `No se pudo conectar con el agente: ${err.message}` });
  }
});

// Fallback SPA
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => console.log(`PsychAI server running on port ${PORT}`));