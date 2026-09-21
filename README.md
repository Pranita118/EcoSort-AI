# 🌱 EcoSort AI

**"Know your waste. Make the right choice."**

An AI-powered waste identification, segregation, and disposal-guidance app, built around
Retrieval-Augmented Generation (RAG) and the **Groq API**. Aligned with **UN SDG 12** (Responsible
Consumption and Production), with secondary alignment to **SDG 11** and **SDG 13**.

> **This app requires a live connection to Groq.** There is no offline/demo mode — every
> classification and chat answer is generated in real time by an LLM, grounded in a local
> knowledge base via RAG. If the server isn't running or the API key isn't set, the app will tell
> you clearly on-screen (a status badge in the navbar + inline setup instructions) rather than
> silently faking a result.

---

## ✨ What's inside

- Landing page, waste identification (image + text), AI result page with confidence scoring
- A RAG pipeline: local knowledge-base retrieval feeds context into every Groq call
- Source-transparency / explainability panel on every result
- "Ask EcoSort" conversational assistant (fully live)
- Smart Disposal Decision tree (Reuse → Repair → Donate → Recycle → Special Disposal)
- Waste Category Explorer, Local Disposal Guide, Personal Impact dashboard, Analytics dashboard
- Knowledge Base admin view, Responsible AI page, About page
- A live connection-status badge in the navbar (Live · Groq connected / Server offline / Groq key missing)

---

## 🧱 Tech stack

| Layer      | Technology                                  |
|------------|----------------------------------------------|
| Frontend   | React 18 + Vite, React Router, Tailwind CSS  |
| Icons      | lucide-react                                 |
| Charts     | Recharts                                     |
| Backend    | Node.js + Express                            |
| AI         | Groq API (Llama 3.3, OpenAI-compatible)      |
| Knowledge  | Local JSON knowledge base (RAG via keyword retrieval) |

---

## 📂 File structure

```
ecosort-ai/
├── package.json                 # root scripts — runs client+server together
├── client/                      # React + Vite frontend
│   └── src/
│       ├── App.jsx              # all routes + page-transition animation
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── StatusBadge.jsx      # live server/Groq connection indicator
│       │   ├── SetupNotice.jsx      # inline fix-it banner on AI pages
│       │   ├── WasteChip.jsx
│       │   ├── ConfidenceMeter.jsx
│       │   ├── AnimatedCounter.jsx
│       │   └── PrototypeBadge.jsx   # labels simulated metrics (Impact/Analytics/Local Guide)
│       ├── pages/                   # Home, Identify, Results, AskAI, Categories,
│       │                            # DecisionSupport, LocalGuide, Impact, Learn,
│       │                            # KnowledgeBase, Analytics, ResponsibleAI, About
│       ├── services/
│       │   ├── aiService.js         # talks to the backend only — no local fallback
│       │   ├── classificationService.js  # shared category constants/styles
│       │   └── AppContext.jsx       # global impact/analytics state + live health polling
│       └── data/
│           ├── knowledgeBase.js     # mirrors server/data/knowledgeBase.json (used for display only)
│           └── demoExamples.js      # quick-example chips (still sent live to Groq)
│
└── server/                      # Express backend (required — the app won't work without it)
    ├── .env.example              # copy to .env and add your Groq API key
    ├── server.js                 # /api/classify, /api/chat, /api/knowledge-base, /api/health
    └── services/
        ├── groqService.js        # calls Groq's chat completions endpoint
        └── ragService.js         # retrieval over the knowledge base, used to ground every prompt
```

---

## 🚀 How to run this project

### 1. Get a free Groq API key

Go to [console.groq.com](https://console.groq.com) → sign up → create an API key.

### 2. Configure the server

```bash
cd ecosort-ai/server
cp .env.example .env
```

Open `.env` in a text editor and paste your key:

```
GROQ_API_KEY=your_actual_key_here
```

> ⚠️ Make sure the file is named exactly `.env` — not `.env.txt`. Some editors (Notepad
> especially) silently add `.txt`. Run `dir -Force` (PowerShell) or `ls -a` (Mac/Linux) in the
> `server` folder to confirm.

### 3. Install everything from the project root

```bash
cd ecosort-ai
npm run install:all
```

This installs dependencies in **both** `client/` and `server/`. If it ever fails partway, you can
also install them individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run client and server together

```bash
npm run dev
```

(run from the **project root** — the folder that directly contains `client/` and `server/`)

This starts:
- the **Express server** on `http://localhost:5050` (talks to Groq)
- the **React app** on `http://localhost:5173` (the actual website — open this one in your browser)

Vite automatically forwards `/api/*` requests from the client to the server, so you don't need to
open `localhost:5050` directly — it has no page of its own, only API routes.

### 5. Open the app

Go to **`http://localhost:5173`** in your browser. Check the navbar — it should show a green
**"Live · Groq connected"** badge. If it shows something else, see Troubleshooting below.

---

## 🧠 How the RAG pipeline works

```
USER QUERY
   ↓
QUERY PROCESSING (normalize text)
   ↓
RETRIEVE RELEVANT DOCUMENTS (keyword/phrase overlap scoring over knowledgeBase.json)
   ↓
RANK RELEVANT INFORMATION (top 2–3 matches by score)
   ↓
GENERATE RESPONSE (Groq LLM, grounded in the retrieved documents)
   ↓
DISPLAY ANSWER + SOURCE (shown in the "Why did EcoSort recommend this?" panel)
```

This is intentionally a lightweight keyword-based retriever rather than a vector database, so the
whole app runs with no external dependencies besides Groq itself. Swapping in a real
embeddings-based vector store (e.g. Pinecone, Chroma, pgvector) means replacing the `retrieve()`
function in `server/services/ragService.js` — everything downstream (classification, chat,
explainability) stays the same.

---

## 🩺 Troubleshooting

**Navbar shows "Server offline"**
The Express server isn't running. Make sure you ran `npm run dev` from the **project root**, not
just from `client/`. You need both the server (port 5050) and client (port 5173) running at the
same time — the root `npm run dev` starts both together in one terminal.

**Navbar shows "Groq key missing"**
The server is running but couldn't find your key. Check:
- `server/.env` exists (not `.env.example`, not `.env.txt`)
- It contains a line like `GROQ_API_KEY=gsk_...` with no quotes and no spaces around `=`
- You restarted the server after editing `.env` (it only reads the file on startup)

**`Cannot GET /` in the browser**
You opened `http://localhost:5050` directly — that's the backend, which has no homepage, only API
routes. The actual site is at `http://localhost:5173`.

**`ECONNREFUSED` / `http proxy error` in the terminal**
The client is running but the server isn't (or crashed). Check the server's own terminal output
for the real error — a common one is missing dependencies:
```bash
cd server
npm install
node server.js
```
If `node server.js` prints its own error (e.g. `Cannot find module 'dotenv'`), that confirms
`npm install` wasn't run inside `server/` yet.

**PowerShell says `Cannot find path ...` on `cd`**
This almost always means the path was typed relative to the wrong folder. Run `pwd` (or just read
your prompt — it always shows your current folder) before every `cd`, and remember:
- `cd folder-name` goes **into** a subfolder of where you are
- `cd ..` goes **up** one level
- Folder names with spaces (like `Pranita Kumbhar`) need quotes if you type the full path:
  `cd "C:\Users\Pranita Kumbhar\Downloads\ecosort-ai"`

**`npm error Missing script: "install:all"`**
You ran that command from inside `client/` or `server/` instead of the project root — that script
only exists in the root `package.json`. Run `cd ..` until `dir`/`ls` shows `client`, `server`, and
`package.json` all together, then try again.

---

## ⚠️ Responsible AI notes

- Confidence is never faked: results are explicitly labeled **high / moderate / low confidence**,
  and low-confidence items ask the user for more detail instead of guessing.
- Image analysis uses a clearly labeled **mock inference layer** to guess a text label from the
  filename (it does not run a real computer-vision model) — the resulting classification is then
  generated live by Groq. See the Identify and About pages.
- Local disposal guidance is labeled **prototype demo data**, not live municipal information.
- Impact and analytics numbers are labeled **estimated / prototype metrics** and only reflect
  items you've actually analyzed in this session — they are not measured environmental outcomes.

See the in-app **Responsible AI** page for the full breakdown (Fairness, Transparency, Ethics,
Privacy, Uncertainty).