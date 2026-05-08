# PsychAI — Documentación del Proyecto

---

## Acceso a la aplicación

La aplicación está desplegada en Render y puedes accesarla en el siguiente enlace:

**[https://proyecto-ia-psychai.onrender.com](https://proyecto-ia-psychai.onrender.com)**


### ⚠️ Posibles inconvenientes con el plan gratuito

La aplicación está corriendo en el **plan gratuito de Render**, lo que implica dos situaciones que pueden causar problemas ocasionales:

- **El servidor se duerme** después de 15 minutos sin actividad. La primera vez que entres después de un rato, puede tardar entre 20 y 30 segundos en cargar. Es normal, no está caída.
- **El agente de IA usa una base de datos vectorial en Supabase** (para buscar información relevante). Supabase también tiene un plan gratuito que **pausa los proyectos inactivos cada cierto tiempo**, lo que puede hacer que el análisis falle o devuelva un error aunque la interfaz cargue bien.

Si experimentas alguno de estos problemas, por favor avísanos para revisarlo.

---

## ¿Qué hace la aplicación?

PsychAI es un prototipo académico de evaluación psicológica asistida. El profesional ingresa los datos del paciente (nombre, edad, género, motivo de consulta, puntajes PHQ-9 y GAD-7) junto con un resumen clínico, y el sistema genera un reporte orientativo usando inteligencia artificial.

**Importante:** los resultados son orientativos y no reemplazan el criterio de un profesional de salud mental certificado.

---

## Cómo funciona por dentro

El sistema tiene tres partes:

**1. Frontend (interfaz web)**
Es la pantalla que ves en el navegador. Está hecha con HTML, CSS y JavaScript puro. Recoge los datos del formulario y los manda al backend.

**2. Backend (servidor Node.js)**
Es un servidor Express que recibe los datos del frontend y los reenvía al agente de IA. Aquí es donde está guardada de forma segura la URL del webhook (el endpoint de n8n), sin que el usuario la vea nunca.

**3. Agente n8n**
Es un flujo de automatización que recibe el caso clínico, lo procesa usando un modelo de lenguaje con acceso a una base de conocimiento en Supabase, y devuelve el análisis.

El flujo de datos es:

```
Navegador → /api/analyze (servidor Express) → Webhook n8n → Supabase + LLM → respuesta
```

---

## Estructura del código

```
psychai/
├── public/
│   └── index.html       ← Interfaz web (todo el frontend en un solo archivo)
├── server/
│   └── index.js         ← Servidor Express (backend)
├── package.json         ← Dependencias y scripts
├── render.yaml          ← Configuración de despliegue en Render
├── .env.example         ← Plantilla de variables de entorno
├── .gitignore
└── README.md
```

El archivo clave del backend es `server/index.js`. Lo más importante ahí es el endpoint `/api/analyze`:

```js
app.post("/api/analyze", async (req, res) => {
  // Recibe el caso clínico desde el frontend
  // Lo reenvía al webhook de n8n (cuya URL solo vive en el servidor)
  // Devuelve la respuesta al navegador
});
```

La URL del webhook nunca sale del servidor. El frontend no la conoce.

---

## Probarlo en local (paso a paso)

### Lo que necesitas tener instalado

- Node.js versión 18 o superior → [nodejs.org](https://nodejs.org)
- Git → [git-scm.com](https://git-scm.com)
- Repo en Github → [https://github.com/Alerun3530/Proyecto-IA-PsychAI.git](https://github.com/Alerun3530/Proyecto-IA-PsychAI.git)

### Pasos

**1. Clona el repositorio**
```bash
git clone https://github.com/Alerun3530/Proyecto-IA-PsychAI.git
cd psychai
```

**2. Instala las dependencias**
```bash
npm install
```

**3. Crea el archivo de configuración**
```bash
# Estando dentro de la carpeta psychai
echo WEBHOOK_URL=https://tu-webhook-aqui.com > .env
```

Abre el archivo `.env` con cualquier editor de texto. Verás esto:
```
WEBHOOK_URL=https://tu-servidor.com/webhook/psychai
```
Reemplaza el valor con el endpoint real del agente n8n. **Nosotros se lo pasamos directamente** (ver sección siguiente).

**4. Inicia el servidor**
```bash
npm run dev
```

**5. Abre la aplicación**

Entra a [http://localhost:3000](http://localhost:3000) en tu navegador. La aplicación debería cargar igual que la versión en línea.

Para detenerlo, presiona `Ctrl + C` en la terminal.

---

## El endpoint del agente (WEBHOOK_URL)

Para que la aplicación funcione en local necesitas el endpoint del webhook de n8n. Por razones de seguridad no lo publicamos en el repositorio.

Si quieres probarlo en local, escríbenos y te lo pasamos por un canal privado (WhatsApp, correo, etc.). No lo comparta públicamente.

---

## El agente n8n

El agente está construido en n8n, una herramienta de automatización de flujos. Si quieres revisarlo o usarlo en tu propia instancia de n8n, podemos pasarte el archivo de exportación del flujo (formato JSON).

### ⚠️ Cosas importantes si lo importas en tu n8n

Si importas el flujo en tu propia instancia, hay varias cosas que tendrás que configurar manualmente:

**Credenciales**
El flujo usa credenciales que están vinculadas a nuestra cuenta. Al importarlo, esas credenciales no van a funcionar en tu instancia. Tendrás que crear las tuyas propias en n8n para:
- El modelo de lenguaje (OpenAI, Anthropic, etc., dependiendo del que usemos)
- Supabase (para el vector store)

**El vector store de Supabase**
Esta es la parte más delicada. El agente busca información en una base de datos vectorial que está configurada en nuestra cuenta de Supabase, con nuestros datos, nuestros embeddings y nuestra estructura de tablas. Si lo corres apuntando a otra cuenta de Supabase, no va a encontrar nada o va a fallar.

Para que funcione en tu entorno necesitarías:
- Crear un proyecto en Supabase
- Crear la tabla de vectores con la estructura correcta
- Cargar los documentos de conocimiento
- Actualizar las credenciales en el flujo de n8n

Si lo necesitas, podemos orientarte en ese proceso.

---

*Prototipo académico — los resultados generados no reemplazan la evaluación de un profesional certificado en salud mental.*
