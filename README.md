# ⚡ Mwijay Tech — AI Voice Studio, Developer Vault & Personal Productivity OS

<div align="center">

![Status](https://img.shields.io/badge/Status-🟢%20Production%20Ready-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop%20%7C%20PWA%20%7C%20Extension-purple)
![License](https://img.shields.io/badge/License-MIT-green)
![Tanzania](https://img.shields.io/badge/Built%20in-Tanzania%20🇹🇿-blue)

**Live Web App**: [mwijaytech.vercel.app](https://mwijaytech.vercel.app)
| **GitHub Repository**: [github.com/mwijay12/techymwijay](https://github.com/mwijay12/techymwijay)

</div>

---

## 🚀 What Is Mwijay Tech?

**Mwijay Tech** is a personal AI productivity operating system engineered by Davie Mwijay for developers, students, and power users in Dar es Salaam, Tanzania. It seamlessly integrates a real-time Swahili-English AI voice studio, local-first encrypted credential vault, TZS expense tracker, todo planner, meeting transcriber, and personal AI memory engine across **Web**, **Desktop (Electron)**, **Mobile (PWA)**, and **Chrome Extension (Manifest V3)**.

---

## ✨ Key Features Summary (Prompts 1–21 Complete)

| Module | Feature | Description | Status |
|--------|---------|-------------|--------|
| 🎙️ **Voice STT** | Swahili-English Speech | Real-time audio dictation powered by Groq Whisper-large-v3 with Web Speech API fallback | ✅ Live |
| 🔊 **Voice TTS** | Text to Speech Studio | Natural AI speech synthesis powered by Puter.js free engine (default) + ElevenLabs Multilingual v2 | ✅ Live |
| 🔐 **Vault** | Encrypted Developer Vault | AES-256-GCM local-first vault for API keys, passwords, code snippets, notes & Cloudinary media | ✅ Live |
| 💰 **Spending** | TZS Expense Tracker | Tanzanian Shilling expense manager with M-Pesa/Chakula categories, monthly summaries & budgets | ✅ Live |
| ✅ **Todos** | Personal Planner | Swahili priority levels (`haraka`, `kawaida`, `baadaye`), drag-to-sort, and streak counters | ✅ Live |
| 🎙️ **Meeting** | Live Conference Capture | 30s chunked audio recorder with Groq transcription, timeline visualizer & AI meeting summaries | ✅ Live |
| 🧠 **Memory** | Personal AI Memory | Living preference profile automatically injected into AI chat calls for personalized responses | ✅ Live |
| 🤖 **AI Chat** | Multi-Provider Chat | Multi-model failover pool (OpenRouter → Groq → HuggingFace → Puter.js) with `Ctrl+K` shortcut | ✅ Live |
| 🖥️ **Desktop** | Electron Application | Native desktop window with system tray, `Ctrl+Shift+M` dictation hotkey, clipboard watcher & screenshots | ✅ Live |
| 🌐 **Extension**| Chrome Extension V3 | Injects voice mic button into any input field on any webpage (`Alt+M` hotkey) | ✅ Live |
| 📱 **PWA** | Installable Web App | Service Worker offline caching, background sync queue, conflict resolution (last-write-wins) | ✅ Live |
| 🛡️ **Sync** | Multi-Tab Hardening | BroadcastChannel cross-tab coordination preventing duplicate Firestore writes & locks | ✅ Live |
| 📊 **Health** | System Health Checker | In-app integration test runner & live API latency verification dashboard (`/health`) | ✅ Live |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router), React 18, TypeScript 5 (Strict)
- **Styling & Motion**: Tailwind CSS, Framer Motion, Spline 3D Scene
- **Desktop Runtime**: Electron 42 (Win/Mac/Linux)
- **Extension**: Chrome Manifest V3 (Background Service Worker + Content Scripts)
- **Database & Sync**: Firebase Auth, Firestore Cloud DB, LocalStorage (offline-first)
- **Media CDN**: Cloudinary unsigned direct uploads
- **Deployment**: Vercel Primary (`mwijaytech.vercel.app`)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
│  Next.js Web App  │  Electron Desktop  │  Chrome Extension       │
│   (PWA + Vercel)  │   (Win/Mac/Linux)  │   (Manifest V3)        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   AppShell +    │
                    │  Auth Context   │
                    │  (Firebase)     │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐  ┌────────▼───────┐  ┌──────▼───────┐
   │  AI Engine  │  │  Data Layer    │  │  Media/Files │
   │  OpenRouter │  │  localStorage  │  │  Cloudinary  │
   │  Groq       │  │  + Firestore   │  │  CDN         │
   │  ElevenLabs │  │  + Sync Queue  │  └──────────────┘
   │  Puter.js   │  └────────────────┘
   └─────────────┘
```

---

## 🚦 Getting Started Locally

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/mwijay12/techymwijay.git
cd techymwijay
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mwijaytech-b9c98.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mwijaytech-b9c98
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mwijaytech-b9c98.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=563469161055
NEXT_PUBLIC_FIREBASE_APP_ID=1:563469161055:web:f660f63ee9f867440041ea
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 4. Run Web App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Electron Desktop App
```bash
npm run electron:dev
```

### 6. Run Integration Test Suite
Navigate to `http://localhost:3000/health` in your browser and click **Run All Tests**.

---

## 📦 Build Commands

| Target | Command | Output |
|--------|---------|--------|
| Type Check | `npm run typecheck` | Validates TypeScript with 0 errors |
| Web Production | `npm run build` | `.next/` production build |
| Windows Installer | `npm run electron:build:win` | `dist/MwijayTech-Setup-1.0.0.exe` |
| macOS Installer | `npm run electron:build:mac` | `dist/MwijayTech-1.0.0.dmg` |
| Linux AppImage | `npm run electron:build:linux` | `dist/MwijayTech-1.0.0.AppImage` |
| Production Deploy | `npm run deploy` | Deploys to Vercel (`mwijaytech.vercel.app`) |

---

## 🇹🇿 Author & Credits

Built with ❤️ by **Davie Mwijay** in Dar es Salaam, Tanzania 🇹🇿.
Designed for developer productivity, offline resilience, and high-performance AI workflows.