# PsychAI — Sistema de Evaluación Psicológica

Prototipo académico de evaluación psicológica asistida por IA, con backend Node.js/Express y agente n8n como motor de análisis.

---

## Arquitectura

```
Browser → /api/analyze (Express) → WEBHOOK_URL (n8n) → respuesta
```

El frontend nunca ve la URL del webhook. Solo el servidor la conoce a través de una variable de entorno.

---

## Desarrollo local

### 1. Clona el repo
```bash
git clone https://github.com/tu-usuario/psychai.git
cd psychai
```

### 2. Instala dependencias
```bash
npm install
```

### 3. Configura la variable de entorno
```bash
cp .env.example .env
# Edita .env y pon tu WEBHOOK_URL real
```

> Para cargar `.env` en local, instala dotenv o usa `node --env-file=.env server/index.js`

### 4. Inicia el servidor
```bash
npm run dev    # con hot-reload (Node 18+)
# o
npm start
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Render

### Opción A — Automático con render.yaml (recomendado)
1. Sube el repo a GitHub.
2. En [Render](https://render.com) → **New → Blueprint** → conecta el repo.
3. Render detecta `render.yaml` automáticamente.
4. En el dashboard del servicio → **Environment** → agrega:
   ```
   WEBHOOK_URL = https://tu-servidor.com/webhook/psychai
   ```
5. Despliega. ✅

### Opción B — Manual
1. **New → Web Service** → conecta el repo.
2. Runtime: **Node**
3. Build command: `npm install`
4. Start command: `npm start`
5. Agrega la variable de entorno `WEBHOOK_URL`.
6. Despliega.

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `WEBHOOK_URL` | ✅ | URL del webhook de n8n que procesa el análisis |
| `PORT` | No | Puerto del servidor (Render lo asigna automáticamente) |

---

## Advertencia

Este sistema es un **prototipo académico**. Los resultados son orientativos y no reemplazan el criterio de un profesional de la salud mental certificado.
