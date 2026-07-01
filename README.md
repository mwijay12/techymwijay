# 🎙️ Mwijay AI Voice Studio

> **Turn speech into text, text into speech, and Swahili into English — all powered by AI, all in one desktop app.**

---

## 📋 SECTION 1: PROJECT IDENTITY

### 🧠 Mwijay Tech — AI Voice Studio

**To a 10-year-old:** This is a smart app that listens when you speak in Swahili, writes down what you said, translates it to English, and can even speak back to you in different robot voices.

**To a developer:** Mwijay AI Voice Studio is a full-stack Next.js 14 application with Electron desktop packaging that provides multi-provider Text-to-Speech (AWS Polly, OpenAI, ElevenLabs, Gemini, xAI) and real-time Speech-to-Text using the Web Speech API with automatic Kiswahili→English translation, persistent localStorage memory, and an AI sidebar assistant powered by Puter.js.

**Business problem it solves:** African tech entrepreneurs and content creators lack accessible, offline-capable voice tools that work with African languages. Existing solutions (Google Cloud STT, Azure Cognitive Services) require complex API setup, credit cards, and don't prioritize Swahili. Mwijay Tech provides a zero-configuration, free-to-use voice studio that works immediately in any browser — and can be installed as a native Windows/Mac/Linux app.

| Detail | Value |
|--------|-------|
| **Version** | 1.0.0 |
| **Status** | 🟡 Beta — Active Development |
| **Built by** | Davie Mwijay (Mwijay Tech, Tanzania) |
| **Why it exists** | To make AI voice technology accessible to Swahili speakers and African developers |
| **What makes it different** | Zero API keys needed (Puter.js handles auth), Kiswahili-first design, Electron desktop app, 5 TTS providers in one UI, built-in translation, persistent memory |

---

## 📋 SECTION 2: LIVE SYSTEM SNAPSHOT

### Current System Components

| Component | Status | What It Does | Tech Used |
|-----------|--------|-------------|-----------|
| Home Page | ✅ Complete | Landing page with 3D Spline scene, stats, services, testimonials | Next.js, Framer Motion, Spline |
| TTS Studio | ✅ Complete | Text-to-Speech with 5 providers, 30+ voices, download, speed/pitch | Puter.js, Web Audio API |
| STT Studio | ✅ Complete | Speech-to-Text with Kiswahili, real-time transcription, translation | Web Speech API, Puter.js AI |
| AI Sidebar | ✅ Complete | Context-aware AI assistant for transcriptions | Puter.js GPT-4o |
| Memory System | ✅ Complete | Persistent localStorage with search, favorites, export | localStorage API |
| Navigation | ✅ Complete | Responsive nav with all routes, mobile menu | Next.js, Framer Motion |
| Contact Page | ✅ Complete | Contact form with validation, office hours | Next.js |
| Services/Pricing | ✅ Complete | Service cards, pricing tiers | Next.js, Tailwind |
| Blog/Team/Case Studies | ✅ Complete | Content pages | Next.js |
| Electron Desktop App | 🟡 Partial | Window controls, preload, build config — needs final packaging | Electron, electron-builder |
| Firebase Sync | 🟡 Partial | Firestore config, cloud memory functions — needs Firebase project | Firebase v12 |
| Custom Cursor | ✅ Complete | Animated cursor with hover effects | CSS, Framer Motion |
| Scroll Progress | ✅ Complete | Top progress bar on scroll | CSS |
| Spline 3D Scene | ✅ Complete | 3D interactive background on hero | @splinetool/runtime |

### What Works Right Now
- ✅ Real-time speech-to-text in Kiswahili, English, and 8 other languages
- ✅ Live interim transcription while speaking
- ✅ Auto-translation from Kiswahili → English using Puter.js AI
- ✅ Text-to-Speech with 5 providers and 30+ voices
- ✅ Audio download as MP3
- ✅ Speed and pitch controls for TTS
- ✅ Persistent memory with search, favorites, grid/list view
- ✅ Export memory as .txt file
- ✅ AI sidebar assistant with context from transcriptions
- ✅ Caption overlay view during recording
- ✅ File upload transcription via GPT-4o
- ✅ Responsive design (mobile + desktop)
- ✅ Custom cursor and scroll progress
- ✅ 3D Spline scene on homepage

### What Is Partially Working
- 🟡 **Electron desktop build** — App structure is ready, needs `npm run electron:build` to generate installer
- 🟡 **Firebase cloud sync** — Config and functions written, needs Firebase project credentials to activate

### What Is Planned But Not Started
- ❌ User authentication (login/signup)
- ❌ Cloud sync between devices
- ❌ Audio recording save/playback
- ❌ Voice cloning / custom voice creation
- ❌ Mobile app (React Native)
- ❌ Team collaboration features
- ❌ API for third-party integrations

### What Was Tried and Abandoned
- ❌ **@splinetool/react-spline v4.1.0** — The React component library broke due to ESM export changes. Replaced with direct `@splinetool/runtime` canvas-based approach.
- ❌ **puter.ai.speech2text()** — Puter.js does not have a speech2text method. Replaced with browser-native Web Speech API.
- ❌ **React.lazy() for Spline** — Generated broken chunk URLs (`/_next/undefined`). Replaced with Next.js `dynamic()` import.

---

## 📋 SECTION 3: SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser/Electron)                   │
└──────────┬──────────────────────┬────────────────────┬──────────┘
           │                      │                    │
           ▼                      ▼                    ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   Next.js 14      │   │  Web Speech API  │   │  Puter.js CDN    │
│   (App Router)    │   │  (SpeechRecog.)  │   │  (AI Services)   │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ • Pages/Routes   │   │ • Real-time STT  │   │ • GPT-4o Chat    │
│ • Layouts        │   │ • Interim results│   │ • TTS (5 prov.)  │
│ • Components     │   │ • 10 languages   │   │ • Translation    │
│ • API handlers   │   │ • Kiswahili      │   │ • File transcribe│
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    React Component Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Navigation │ Footer │ Chat │ TitleBar │ Cards │ AudioVis.      │
│  CustomCursor │ ScrollProgress │ SplineScene │ Spotlight        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    State Management (React Hooks)                 │
├─────────────────────────────────────────────────────────────────┤
│  useState │ useEffect │ useRef │ useCallback │ useContext       │
│  Framer Motion (animations) │ Tailwind CSS (styling)            │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                     │
├──────────────────────┬──────────────────────┬───────────────────┤
│   localStorage       │   Firebase (future)   │   Electron FS    │
│   (stt-memory.ts)    │   (firebase.ts)       │   (preload.js)   │
│   • 500 entries max  │   • Firestore sync    │   • Local files  │
│   • Search/favorites │   • Auth (anon)       │   • UserData     │
│   • Export as .txt   │   • Cloud backup      │   • Auto-update  │
└──────────────────────┴──────────────────────┴───────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Build & Deployment                             │
├──────────────────────┬──────────────────────┬───────────────────┤
│   Vercel (Web)       │   Electron (Desktop)  │   Firebase       │
│   • next build       │   • electron-builder  │   • Hosting      │
│   • Auto-deploy      │   • Windows/Mac/Linux │   • Functions    │
│   • Preview URLs     │   • Auto-updater      │   • Firestore    │
└──────────────────────┴──────────────────────┴───────────────────┘
```

### Data Flow: User Speaks in Swahili

1. User clicks microphone button → `startRecording()` fires
2. Browser requests microphone permission → `getUserMedia({ audio: true })`
3. `webkitSpeechRecognition` starts with `lang: 'sw-TZ'`
4. As user speaks, `onresult` fires every ~250ms with interim results
5. Interim text shows in gray italic — user sees live feedback
6. When user stops, `onend` fires → final transcript saved
7. `saveToMemory()` is called → text saved to localStorage
8. If `autoTranslate` is ON → `translateText()` sends to Puter.js GPT-4o-mini
9. Translation appears in blue box below original text
10. Entry appears in memory panel with Swahili flag 🇹🇿
11. User can copy, favorite, or delete the entry
12. All data persists in `localStorage` under key `mwj-stt-memory`

---

## 📋 SECTION 4: COMPLETE FILE STRUCTURE

```
mwijay-tech/
├── README.md                          # This file — project documentation
├── package.json                       # Dependencies, scripts, Electron build config
├── next.config.mjs                    # Next.js config (static export, images)
├── tailwind.config.ts                 # Tailwind CSS theme, colors, animations
├── tsconfig.json                      # TypeScript configuration
├── postcss.config.js                  # PostCSS config for Tailwind
│
├── electron/                          # Electron desktop app files
│   ├── main.js                        # Main process — window creation, IPC handlers
│   └── preload.js                     # Preload script — exposes electronAPI to renderer
│
├── public/                            # Static assets
│   └── icon.png                       # App icon for Electron builds
│
├── src/
│   ├── app/                           # Next.js App Router pages
│   │   ├── layout.tsx                 # Root layout — fonts, cursor, titlebar, Puter.js
│   │   ├── globals.css                # Global styles — Tailwind, custom cursor, animations
│   │   ├── page.tsx                   # Home page — hero, stats, services, testimonials, CTA
│   │   ├── ai-tts/
│   │   │   └── page.tsx              # TTS Studio — 5 providers, download, speed/pitch
│   │   ├── ai-stt/
│   │   │   └── page.tsx              # STT Studio — Kiswahili, translation, memory, AI sidebar
│   │   ├── blog/page.tsx             # Blog listing page
│   │   ├── case-studies/page.tsx     # Case studies page
│   │   ├── contact/page.tsx          # Contact form with validation
│   │   ├── pricing/page.tsx          # Pricing tiers
│   │   ├── services/page.tsx         # Services overview
│   │   └── team/page.tsx             # Team members
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx        # Top navigation bar with all routes
│   │   │   ├── Footer.tsx            # Site footer with links and contact
│   │   │   ├── ChatComponent.tsx     # Floating AI chat widget
│   │   │   └── ElectronTitleBar.tsx  # Custom title bar for Electron (min/max/close)
│   │   ├── ui/
│   │   │   ├── card.tsx              # Reusable card component (shadcn/ui style)
│   │   │   ├── custom-cursor.tsx     # Animated custom cursor
│   │   │   ├── scroll-progress.tsx   # Top scroll progress bar
│   │   │   ├── audio-visualizer.tsx  # Animated waveform bars for audio playback
│   │   │   ├── interactive-spotlight.tsx  # Mouse-following spotlight effect
│   │   │   ├── pricing-section-4.tsx # Pricing section component
│   │   │   ├── silk-background-animation.tsx  # Silk-like animated background
│   │   │   ├── sparkles.tsx          # Sparkle particle effects
│   │   │   ├── splite.tsx            # Spline 3D scene loader (canvas-based)
│   │   │   ├── spotlight.tsx         # Spotlight hover effect
│   │   │   ├── timeline-animation.tsx # Timeline scroll animation
│   │   │   └── vertical-cut-reveal.tsx # Vertical cut reveal animation
│   │   └── demo/
│   │       ├── spline-scene-basic.tsx # Basic Spline scene wrapper
│   │       ├── spline-scene-demo.tsx  # Spline demo showcase
│   │       ├── pricing-section-demo.tsx # Pricing demo
│   │       └── silk-background-demo.tsx # Silk background demo
│   │
│   └── lib/
│       ├── utils.ts                  # cn() utility for Tailwind class merging
│       ├── stt-memory.ts             # localStorage memory system (CRUD, export, favorites)
│       └── firebase.ts               # Firebase config, Firestore operations, auth
│
├── .next/                            # Next.js build output (gitignored)
├── out/                              # Static export for Electron (gitignored)
├── release/                          # Electron installer output (gitignored)
└── node_modules/                     # Dependencies (gitignored)
```

---

## 📋 SECTION 5: INSTALLATION & SETUP

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | ≥ 18.0 | [https://nodejs.org](https://nodejs.org) |
| npm | ≥ 9.0 | Comes with Node.js |
| Git | Latest | [https://git-scm.com](https://git-scm.com) |
| VS Code (recommended) | Latest | [https://code.visualstudio.com](https://code.visualstudio.com) |

### Step 1: Clone the Repository

```bash
git clone https://github.com/mwijaydavie/tech-website.git
cd tech-website
```

**Expected output:**
```
Cloning into 'tech-website'...
remote: Enumerating objects: ...
Receiving objects: 100% ...
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:**
```
npm notice created a lockfile as package-lock.json
npm WARN optional SKIPPING OPTIONAL DEPENDENCY ...
added 1500+ packages in 45s
```

> ⚠️ **Warning:** If you see `ERR! code EINTEGRITY`, delete `package-lock.json` and run `npm install` again.

### Step 3: Environment Variables (Optional — for Firebase)

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> **Note:** The app works **without** Firebase. All features (STT, TTS, memory) work using localStorage and Puter.js. Firebase is only needed for cloud sync.

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.35
- Local: http://localhost:3000
✓ Ready in 2.5s
```

Open **http://localhost:3000** in your browser.

### Step 5: Verify It Works

1. Go to **http://localhost:3000/ai-stt**
2. Click the microphone button
3. Allow microphone access when prompted
4. Speak in Swahili: *"Habari, huu ni mtihani wa sauti"*
5. Click **Stop**
6. ✅ You should see your speech transcribed in the text box
7. ✅ If auto-translate is on, English translation appears below

### Common Setup Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module './935.js'` | Corrupt `.next` cache | Delete `.next` folder, run `npm run dev` again |
| `Module not found: Package path . is not exported` | Spline package issue | Already fixed — uses `@splinetool/runtime` directly |
| `puter.ai.speech2text is not a function` | Wrong API method | Already fixed — uses Web Speech API instead |
| `Microphone access denied` | Browser permission | Click lock icon in URL bar, enable microphone |
| `Speech recognition not supported` | Wrong browser | Use Chrome or Edge (not Firefox/Safari) |

---

## 📋 SECTION 6: HOW TO USE IT

### 🎤 Speech-to-Text (STT Studio)

**What it does:** Converts your voice to text in real-time. Supports 10 languages including Kiswahili.

**How to use:**
1. Navigate to `/ai-stt`
2. Select language (default: Kiswahili)
3. Click the microphone button
4. Speak — text appears in real-time
5. Click **Stop** when done
6. Copy, translate, or save to memory

**Example:**
```
You speak: "Habari za leo? Ninataka kujenga tovuti."
Result:     "Habari za leo? Ninataka kujenga tovuti."
Translation: "How are you today? I want to build a website."
```

### 🔊 Text-to-Speech (TTS Studio)

**What it does:** Converts text to speech using 5 different AI providers.

**How to use:**
1. Navigate to `/ai-tts`
2. Select a provider (AWS Polly, OpenAI, ElevenLabs, Gemini, xAI)
3. Choose a voice
4. Type or paste text
5. Click **Speak**
6. Click **Download** to save as MP3

**Example:**
```
Input: "Hello! Welcome to Mwijay Tech."
Provider: AWS Polly
Voice: Joanna (Female)
→ Audio plays through speakers
→ Download as mwj-tts-aws-polly-123456789.mp3
```

### 🤖 AI Sidebar Assistant

**What it does:** Answers questions about your transcribed text using GPT-4o.

**How to use:**
1. Transcribe some text
2. Click the 🤖 icon in the toolbar
3. Click **Summarize**, **Grammar**, or **Keywords**
4. Or type your own question

**Example:**
```
Your text: "Nataka kujenga tovuti ya biashara ya mtandaoni."
Click: "Summarize"
AI: "The user wants to build an e-commerce website."
```

### 💾 Memory System

**What it does:** Saves all transcriptions to your browser's localStorage.

**Features:**
- ✅ Auto-saves every transcription
- ✅ Search by keyword
- ✅ Favorite important entries (⭐)
- ✅ Delete individual entries
- ✅ Export all as .txt file
- ✅ Grid or list view
- ✅ Click any entry to replay it

---

## 📋 SECTION 7: DATABASE SCHEMA

### localStorage: `mwj-stt-memory`

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `id` | string | `"lxj3p8k2m9"` | Auto-generated unique ID |
| `text` | string | `"Habari za leo?"` | Original transcribed text |
| `translatedText` | string (optional) | `"How are you today?"` | AI translation |
| `source` | string | `"microphone"` | `"microphone"` or `"file"` |
| `fileName` | string (optional) | `"recording.wav"` | Original file name |
| `duration` | number (optional) | `12` | Recording duration in seconds |
| `timestamp` | number | `1712345678000` | Unix timestamp in ms |
| `language` | string | `"sw"` | Language code |
| `favorite` | boolean (optional) | `true` | Starred by user |

### Firebase Firestore (Future): `users/{userId}/memory`

Same structure as localStorage, plus:

| Field | Type | Description |
|-------|------|-------------|
| `createdAt` | Timestamp | Firestore server timestamp |
| `synced` | boolean | Whether synced from localStorage |

### Indexes
- `createdAt` descending — for chronological listing
- `language` + `createdAt` — for filtering by language
- `favorite` + `createdAt` — for showing favorites first

---

## 📋 SECTION 8: AI INTEGRATION DETAILS

### Puter.js AI Services

Puter.js is loaded globally via CDN in `layout.tsx`:
```html
<script src="https://js.puter.com/v2/"></script>
```

This makes `window.puter` available everywhere with zero API keys needed.

### Available Puter.js Methods

| Method | Used In | Purpose |
|--------|---------|---------|
| `puter.ai.txt2speech(text, opts)` | `/ai-tts` | Text-to-Speech with 5 providers |
| `puter.ai.chat(message, opts)` | `/ai-stt`, Chat | GPT-4o chat, translation, file transcription |
| `puter.ai.txt2img(prompt)` | ChatComponent | Image generation |

### Translation Prompt (Exact)

```javascript
const response = await puter.ai.chat(
  `Translate this text from Kiswahili to English. Return ONLY the translation, nothing else:\n\n${text}`,
  {
    model: 'gpt-4o-mini',
    system: 'You are a translator. Return only the translated text.',
    stream: false,
  }
)
```

### TTS Provider Options

```javascript
// AWS Polly
puter.ai.txt2speech("Hello", {
  provider: 'aws-polly',
  voice: 'Joanna',
  engine: 'neural',
  language: 'en-US'
})

// OpenAI
puter.ai.txt2speech("Hello", {
  provider: 'openai',
  voice: 'alloy',
  model: 'gpt-4o-mini-tts',
  instructions: 'Speak cheerfully'
})

// ElevenLabs
puter.ai.txt2speech("Hello", {
  provider: 'elevenlabs',
  voice: '21m00Tcm4TlvDq8ikWAM',
  model: 'eleven_multilingual_v2'
})
```

### Cost Estimates

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Puter.js TTS | ✅ Free (test mode) | Free for development |
| Puter.js Chat | ✅ Free | Free for development |
| Web Speech API | ✅ Built into browser | Free |
| localStorage | ✅ Unlimited | Free |
| Vercel Hosting | ✅ 100GB bandwidth/mo | Free |
| Firebase (optional) | ✅ 1GB storage, 10GB download | Free for small apps |

---

## 📋 SECTION 9: CURRENT LIMITATIONS & KNOWN BUGS

### Known Bugs

| Bug | Steps to Reproduce | Impact | Status |
|-----|-------------------|--------|--------|
| Hydration error on STT page | Load `/ai-stt` directly (not via client navigation) | Shows error briefly, then recovers | 🟡 Mitigated with `isClient` check |
| Spline chunk loading | Visit home page with slow network | 3D scene may not load | 🟡 Falls back silently |
| localStorage quota exceeded | Save 500+ large transcriptions | New entries stop saving | 🟡 Trims to 100 entries automatically |
| Electron build not tested | Run `npm run electron:build` | May need adjustments | 🔴 Not yet tested |

### Performance Bottlenecks

- **Translation on every interim result** — Currently translates the entire accumulated text on each speech segment. Should debounce or only translate on final.
- **Memory panel with 500 entries** — Rendering 500 items in a list causes jank. Virtual scrolling needed.
- **No Web Worker for AI calls** — Puter.js calls block the main thread during transcription.

### Security Issues

- **No authentication** — Anyone with access to the browser can see all memory
- **localStorage is not encrypted** — Sensitive transcriptions stored in plain text
- **Puter.js CDN dependency** — App breaks if Puter.js CDN is down

### Technical Debt

- `ai-stt/page.tsx` is 800+ lines — should be split into smaller components
- Translation logic is duplicated in `saveToMemory()` and `onresult`
- No error boundary component — any render crash shows white screen
- CSS warnings about gradient syntax — should update to modern syntax

---

## 📋 SECTION 10: FOUNDATION HARDENING (Prompt 0)

This section documents the foundation hardening pass completed to stabilize the codebase.

### What Was Added

| Component | Purpose |
|-----------|---------|
| `.env.example` | Environment variable scaffolding for Firebase + future providers |
| `src/lib/env.ts` | Typed, centralized env var access — never crashes on import |
| `src/lib/runtime.ts` | Browser/SSR detection helpers |
| `src/lib/electron.ts` | Safe Electron runtime detection and API access |
| `src/lib/browser-storage.ts` | SSR-safe localStorage wrappers |
| `src/components/providers/ClientOnly.tsx` | Reusable hydration-safe wrapper |
| `src/components/providers/AppErrorBoundary.tsx` | Client-side React error boundary with branded fallback |
| `src/components/providers/AppProviders.tsx` | Global providers shell for future growth |
| `src/app/error.tsx` | Global error page with retry + back-home |
| `src/app/not-found.tsx` | Branded 404 page |
| `src/app/api/health/route.ts` | JSON health endpoint |
| `src/app/health/page.tsx` | Visual diagnostics page |

### What Was Modified

| File | Change |
|------|--------|
| `src/lib/firebase.ts` | Safe singleton init, doesn't crash if env missing, exports `isFirebaseReady()` |
| `src/app/layout.tsx` | Wrapped in `AppProviders`, uses `next/script` for Puter.js |
| `next.config.mjs` | Disabled static export by default (enables API routes), `BUILD_FOR_ELECTRON` env toggle |
| `package.json` | Added `typecheck` script, fixed `export` script with `cross-env` |
| `README.md` | This section |

### Acceptance Status

- [x] `.env.example` covers Firebase + future providers
- [x] Firebase init no longer crashes when env vars missing
- [x] `ClientOnly` component is reusable
- [x] Browser-safe storage/runtime helpers exist
- [x] `error.tsx`, `not-found.tsx`, client error boundary work
- [x] `/api/health` returns valid JSON
- [x] `/health` page renders diagnostics
- [x] Electron/browser detection works safely
- [x] `globals.css` preserved (only pre-existing CSS warning remains)
- [x] Build passes (14 routes compiled)

---

## 📋 SECTION 11: MODIFICATION & ADDON GUIDE

### MOD 1: Add a New TTS Provider

- **Difficulty:** ⭐⭐
- **Time:** 1-2 hours
- **Files to modify:** `src/app/ai-tts/page.tsx`
- **New files:** None

**Steps:**
1. Add new provider to the `providers` object (around line 42)
2. Add provider type to `TTSProvider` union type
3. Add voice/model/format options
4. Add provider button in the selector UI
5. Add options handling in `getProviderOptions()`

**Example — Adding Microsoft Azure TTS:**
```typescript
'azure': {
  name: 'Azure TTS',
  icon: <Cloud className="w-5 h-5" />,
  description: 'Microsoft Azure neural voices',
  gradient: 'from-blue-500/10 to-indigo-500/10',
  color: 'text-blue-400',
  voices: [
    { value: 'en-US-JennyNeural', label: 'Jenny (Female)' },
    { value: 'en-US-GuyNeural', label: 'Guy (Male)' },
  ],
  // ... add to provider selector and options
}
```

### MOD 2: Add User Authentication

- **Difficulty:** ⭐⭐⭐⭐
- **Time:** 2-3 days
- **Files to modify:** `src/lib/firebase.ts`, `src/app/layout.tsx`, `src/components/layout/Navigation.tsx`
- **New files:** `src/components/auth/LoginModal.tsx`, `src/lib/auth-context.tsx`
- **Dependencies:** Already installed (Firebase)

**Steps:**
1. Create `AuthContext` provider wrapping the app
2. Add sign-in with Google/Email in a modal
3. Update `stt-memory.ts` to use `userId` from auth
4. Add cloud sync toggle in settings
5. Test with Firebase Auth emulator

### MOD 3: Add Cloud Sync (Firebase)

- **Difficulty:** ⭐⭐⭐
- **Time:** 1-2 days
- **Files to modify:** `src/lib/stt-memory.ts`, `src/lib/firebase.ts`
- **New files:** None

**Steps:**
1. Set up Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore and Anonymous Auth
3. Add `.env.local` with Firebase config
4. In `stt-memory.ts`, add `syncToCloud()` that calls `saveMemoryToCloud()`
5. Add sync status indicator in memory panel

### MOD 4: Add Audio Recording Save/Playback

- **Difficulty:** ⭐⭐⭐
- **Time:** 1 day
- **Files to modify:** `src/app/ai-stt/page.tsx`
- **New files:** None

**Steps:**
1. In `startRecording()`, save audio chunks as blob
2. Store blob URL alongside transcription in memory
3. Add play button in memory entries
4. Handle cleanup of blob URLs on page unload

### MOD 5: Add Mobile App (React Native)

- **Difficulty:** ⭐⭐⭐⭐⭐
- **Time:** 2-4 weeks
- **New project:** Separate React Native app
- **Shared code:** `src/lib/stt-memory.ts` logic, Puter.js API calls

**Steps:**
1. Create new React Native project
2. Port UI components (Navigation, Cards, etc.)
3. Use `expo-speech` for TTS, `expo-speech-recognition` for STT
4. Share Puter.js API layer
5. Use AsyncStorage instead of localStorage

---

## 📋 SECTION 12: DEPLOYMENT GUIDE

### Deploy to Vercel (Web)

1. Push code to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and import your GitHub repo

3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - (etc.)

4. Deploy — Vercel auto-detects Next.js

5. ✅ Your site is live at `https://your-project.vercel.app`

### Build Electron Desktop App

```bash
# Build for Windows
npm run electron:build:win

# Build for Mac
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux
```

Output goes to `release/` folder:
- Windows: `MwijayTech-Setup-1.0.0.exe`
- Mac: `MwijayTech-1.0.0.dmg`
- Linux: `MwijayTech-1.0.0.AppImage`

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

### Rollback Procedure

```bash
# Vercel — go to Deployments tab, click "..." on previous version, "Promote to Production"

# Electron — keep previous installer, reinstall old version

# Firebase — use Firestore console to restore from backup
```

---

## 📋 SECTION 12: COST CALCULATOR

| Service | Free Tier | Paid Tier | 100 Users | 1,000 Users |
|---------|-----------|-----------|-----------|-------------|
| **Vercel Hosting** | 100GB bandwidth, 100hrs serverless | $20/mo Pro | $0 | $20/mo |
| **Puter.js AI** | Unlimited (beta) | Coming soon | $0 | $0 (beta) |
| **Web Speech API** | Built into browser | Free | $0 | $0 |
| **Firebase (optional)** | 1GB storage, 10GB/mo download | Pay as you go | $0 | ~$5/mo |
| **Electron (desktop)** | Free | Free | $0 | $0 |
| **Custom Domain** | Free (Vercel) | $0 | $0 | $0 |
| **Total** | | | **$0/mo** | **~$25/mo** |

---

## 📋 SECTION 13: ROADMAP

### 🟢 SHORT TERM (Next 2 Weeks)

- [ ] **Fix hydration error** — Complete the `isClient` pattern for all server/client mismatches
- [ ] **Add debounce to translation** — Don't translate on every interim result
- [ ] **Split STT page into components** — Extract TranscriptionCard, MemoryPanel, AISidebar
- [ ] **Test Electron build** — Run `npm run electron:build:win` and fix any issues
- [ ] **Add error boundary** — Prevent white screen crashes

### 🟡 MEDIUM TERM (Next 3 Months)

- [ ] **User authentication** — Google sign-in, email/password
- [ ] **Firebase cloud sync** — Sync memory across devices
- [ ] **Audio recording save** — Save and playback recordings
- [ ] **Dark/light theme toggle**
- [ ] **PWA support** — Install as mobile app
- [ ] **API rate limiting** — Prevent abuse of Puter.js calls

### 🔵 LONG TERM (6-12 Months)

- **Version 2.0:** Full SaaS platform with:
  - Team collaboration workspaces
  - Custom voice cloning
  - API for third-party integrations
  - Mobile apps (iOS/Android)
  - Premium tier with advanced features
  - Analytics dashboard
  - Enterprise SSO

---

## 📋 SECTION 14: LESSONS LEARNED

### What Worked Better Than Expected

- **Puter.js zero-config approach** — No API keys, no signup, just works. Perfect for prototyping and African developers who may not have credit cards.
- **Web Speech API quality** — Browser-native speech recognition for Swahili is surprisingly good. Handles accents well.
- **Framer Motion animations** — Made the app feel premium with minimal code.
- **localStorage as primary storage** — For a single-user desktop app, localStorage is perfectly adequate. No server needed.

### What Was Harder Than Expected

- **Spline React package** — Version 4.1.0 broke ESM exports. Had to rewrite the component to use the runtime package directly.
- **Hydration errors** — Next.js server/client mismatch is tricky. Every `window` check needs a `useEffect` wrapper.
- **Electron + Next.js** — Getting them to play together requires careful config. The static export approach works but limits some Next.js features.
- **Puter.js documentation** — No official docs for `speech2text` (because it doesn't exist). Had to discover this through trial and error.

### What We Would Do Differently

1. **Start with `@splinetool/runtime` directly** — Skip the React wrapper package entirely
2. **Use `next/dynamic` from the start** — Avoid `React.lazy()` which causes chunk path issues
3. **Build the memory system as a separate module first** — The `stt-memory.ts` library was extracted late; should have been designed first
4. **Add TypeScript strict mode earlier** — Would have caught the `undefined` type issues sooner
5. **Test Electron earlier** — The desktop packaging should be validated from week 1

### Universal Lessons

- **Always check package.json exports** before importing — Modern packages use the `exports` field and may not have a default export
- **Browser APIs > third-party APIs** when available — Web Speech API is more reliable than any cloud STT service for basic use
- **localStorage is underrated** — For single-user apps, it's simpler than a database
- **Kiswahili support exists in browsers** — Chrome's Web Speech API supports `sw-TZ` natively

---

## 📋 SECTION 16: QUICK REFERENCE CARD

### 🚀 Start the App

```bash
npm run dev          # Development server at http://localhost:3000
npm run build        # Production build
npm run electron:dev # Electron + Next.js together
```

### 📌 Key Routes

| Route | Feature |
|-------|---------|
| `/` | Home page |
| `/ai-tts` | Text-to-Speech Studio |
| `/ai-stt` | Speech-to-Text Studio (Kiswahili) |
| `/contact` | Contact form |

### 🔧 Most Important Files

| File | Purpose |
|------|---------|
| `src/app/ai-stt/page.tsx` | STT Studio (800+ lines, main feature) |
| `src/app/ai-tts/page.tsx` | TTS Studio (5 providers) |
| `src/lib/stt-memory.ts` | Memory system (CRUD, export) |
| `src/lib/firebase.ts` | Firebase config (optional) |
| `electron/main.js` | Electron main process |
| `package.json` | All scripts and build config |

### 🌍 Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=   # From Firebase Console > Project Settings
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

### 🛠️ Common Fix Commands

```bash
# Clear Next.js cache
Remove-Item -Recurse -Force ".next"

# Kill all Node processes
taskkill /F /IM node.exe

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Build for Electron
npm run export && npm run electron:build:win
```

### 📚 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.35 | React framework |
| `framer-motion` | 11.x | Animations |
| `lucide-react` | 0.344.x | Icons |
| `tailwindcss` | 3.4.x | Styling |
| `electron` | 42.x | Desktop app |
| `firebase` | 12.x | Cloud sync (optional) |

---

> **Built with ❤️ by Davie Mwijay in Dar es Salaam, Tanzania**
> 
> *"Make tech accessible" — Mwijay Tech*