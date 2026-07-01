'use client'

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Volume2, Play, Sparkles, ChevronDown, Settings, 
  RefreshCw, Copy, Check, AlertCircle, Music, Mic, Globe, 
  Cpu, Zap, Headphones, Wand2, Code2,
  Download, History, Trash2, Rewind, PlayCircle,
  Gauge, Activity, Radio, SlidersHorizontal, StopCircle
} from "lucide-react"
import Navigation from "@/components/layout/Navigation"
import Footer from "@/components/layout/Footer"
import ChatComponent from "@/components/layout/ChatComponent"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AudioVisualizer from "@/components/ui/audio-visualizer"

type TTSProvider = 'aws-polly' | 'openai' | 'elevenlabs' | 'gemini' | 'xai'

interface ProviderConfig {
  name: string
  icon: React.ReactNode
  description: string
  gradient: string
  color: string
  voices: { value: string; label: string }[]
  engines?: { value: string; label: string }[]
  languages?: { value: string; label: string }[]
  models?: { value: string; label: string }[]
  formats?: { value: string; label: string }[]
}

interface AudioHistoryItem {
  id: string
  text: string
  provider: string
  voice: string
  timestamp: number
  duration?: number
}

const providers: Record<TTSProvider, ProviderConfig> = {
  'aws-polly': {
    name: 'AWS Polly',
    icon: <Mic className="w-5 h-5" />,
    description: 'Amazon Polly — multiple engines & voices',
    gradient: 'from-orange-500/10 to-red-500/10',
    color: 'text-orange-400',
    voices: [
      { value: 'Joanna', label: 'Joanna (Female)' },
      { value: 'Matthew', label: 'Matthew (Male)' },
      { value: 'Ivy', label: 'Ivy (Female)' },
      { value: 'Justin', label: 'Justin (Male)' },
      { value: 'Kendra', label: 'Kendra (Female)' },
      { value: 'Kimberly', label: 'Kimberly (Female)' },
      { value: 'Salli', label: 'Salli (Female)' },
      { value: 'Joey', label: 'Joey (Male)' },
      { value: 'Ruth', label: 'Ruth (Female)' },
    ],
    engines: [
      { value: 'standard', label: 'Standard' },
      { value: 'neural', label: 'Neural' },
      { value: 'generative', label: 'Generative' },
      { value: 'long-form', label: 'Long Form' },
    ],
    languages: [
      { value: 'en-US', label: 'English (US)' },
      { value: 'en-GB', label: 'English (UK)' },
      { value: 'es-US', label: 'Spanish (US)' },
      { value: 'fr-FR', label: 'French' },
      { value: 'de-DE', label: 'German' },
      { value: 'it-IT', label: 'Italian' },
      { value: 'ja-JP', label: 'Japanese' },
      { value: 'pt-BR', label: 'Portuguese (BR)' },
    ],
  },
  'openai': {
    name: 'OpenAI TTS',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'GPT-4o mini TTS & more',
    gradient: 'from-green-500/10 to-emerald-500/10',
    color: 'text-emerald-400',
    voices: [
      { value: 'alloy', label: 'Alloy' },
      { value: 'ash', label: 'Ash' },
      { value: 'ballad', label: 'Ballad' },
      { value: 'coral', label: 'Coral' },
      { value: 'echo', label: 'Echo' },
      { value: 'fable', label: 'Fable' },
      { value: 'nova', label: 'Nova' },
      { value: 'onyx', label: 'Onyx' },
      { value: 'sage', label: 'Sage' },
      { value: 'shimmer', label: 'Shimmer' },
    ],
    models: [
      { value: 'gpt-4o-mini-tts', label: 'GPT-4o Mini TTS' },
      { value: 'tts-1', label: 'TTS-1' },
      { value: 'tts-1-hd', label: 'TTS-1 HD' },
    ],
    formats: [
      { value: 'mp3', label: 'MP3' },
      { value: 'wav', label: 'WAV' },
      { value: 'opus', label: 'Opus' },
      { value: 'aac', label: 'AAC' },
      { value: 'flac', label: 'FLAC' },
      { value: 'pcm', label: 'PCM' },
    ],
  },
  'elevenlabs': {
    name: 'ElevenLabs',
    icon: <Headphones className="w-5 h-5" />,
    description: 'Multilingual voice synthesis',
    gradient: 'from-purple-500/10 to-pink-500/10',
    color: 'text-purple-400',
    voices: [
      { value: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel (Sample)' },
      { value: 'AZnzlk1XvdvUeBnXmlld', label: 'Domi' },
      { value: 'EXAVITQu4vr3xnSDxMaL', label: 'Bella' },
      { value: 'ODq5zmih8GrVes37Dizd', label: 'Patrick' },
      { value: 'N2lVS1w4EtoT3dr4eOWO', label: 'Callum' },
    ],
    models: [
      { value: 'eleven_multilingual_v2', label: 'Multilingual v2' },
      { value: 'eleven_flash_v2_5', label: 'Flash v2.5' },
      { value: 'eleven_turbo_v2_5', label: 'Turbo v2.5' },
      { value: 'eleven_v3', label: 'v3' },
    ],
    formats: [
      { value: 'mp3_44100_128', label: 'MP3 44100 128kbps' },
      { value: 'pcm_16000', label: 'PCM 16000Hz' },
      { value: 'ulaw_8000', label: 'u-law 8000Hz' },
    ],
  },
  'gemini': {
    name: 'Gemini TTS',
    icon: <Zap className="w-5 h-5" />,
    description: 'Google Gemini voice synthesis',
    gradient: 'from-blue-500/10 to-cyan-500/10',
    color: 'text-blue-400',
    voices: [
      { value: 'Kore', label: 'Kore' },
      { value: 'Zephyr', label: 'Zephyr' },
      { value: 'Puck', label: 'Puck' },
      { value: 'Charon', label: 'Charon' },
      { value: 'Fenrir', label: 'Fenrir' },
      { value: 'Leda', label: 'Leda' },
      { value: 'Aoede', label: 'Aoede' },
      { value: 'Enceladus', label: 'Enceladus' },
    ],
    models: [
      { value: 'gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Flash' },
      { value: 'gemini-2.5-pro-preview-tts', label: 'Gemini 2.5 Pro' },
    ],
  },
  'xai': {
    name: 'xAI (Grok)',
    icon: <Cpu className="w-5 h-5" />,
    description: 'Expressive TTS with inline tags',
    gradient: 'from-slate-500/10 to-zinc-500/10',
    color: 'text-slate-300',
    voices: [
      { value: 'eve', label: 'Eve (Energetic)' },
      { value: 'ara', label: 'Ara (Warm)' },
      { value: 'rex', label: 'Rex (Confident)' },
      { value: 'sal', label: 'Sal (Smooth)' },
      { value: 'leo', label: 'Leo (Authoritative)' },
    ],
    languages: [
      { value: 'en', label: 'English' },
      { value: 'auto', label: 'Auto-detect' },
    ],
    formats: [
      { value: 'mp3', label: 'MP3' },
      { value: 'wav', label: 'WAV' },
      { value: 'pcm', label: 'PCM' },
      { value: 'mulaw', label: 'µ-law' },
      { value: 'alaw', label: 'A-law' },
    ],
  },
}

const presetCategories = [
  {
    name: "Greetings",
    presets: [
      "Hello world! Welcome to Mwijay Tech AI voice synthesis. How can I assist you today?",
      "Greetings and salutations! This is a multilingual text-to-speech demonstration.",
    ]
  },
  {
    name: "Tech",
    presets: [
      "Artificial intelligence is transforming how we interact with technology, making it more natural and accessible for everyone.",
      "In the age of digital transformation, businesses must adapt to survive. AI-powered solutions are leading this revolution.",
    ]
  },
  {
    name: "Creative",
    presets: [
      "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
      "In a world of constant innovation, staying ahead means embracing change and leveraging modern tools.",
    ]
  },
  {
    name: "Business",
    presets: [
      "Technology is best when it brings people together. It enables us to communicate, collaborate, and create in new ways.",
      "Our mission is to make technology accessible to everyone. We build solutions that empower businesses worldwide.",
    ]
  },
]

const SectionWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.section 
    className={className}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.section>
)

function generateId() {
  return Math.random().toString(36).substring(2, 11)
}

function formatTimestamp(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function AITTSpage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [text, setText] = useState("Hello! This is a test of the AI text-to-speech system. I can speak in different voices and languages.")
  const [provider, setProvider] = useState<TTSProvider>('aws-polly')
  const [voice, setVoice] = useState('Joanna')
  const [engine, setEngine] = useState('neural')
  const [language, setLanguage] = useState('en-US')
  const [model, setModel] = useState('')
  const [format, setFormat] = useState('')
  const [instructions, setInstructions] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [pitch, setPitch] = useState(1.0)
  const [audioHistory, setAudioHistory] = useState<AudioHistoryItem[]>([])
  const [audioSrcUrl, setAudioSrcUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const downloadLinkRef = useRef<HTMLAnchorElement | null>(null)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mwj-tts-history')
      if (saved) setAudioHistory(JSON.parse(saved))
    } catch {}
  }, [])

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mwj-tts-history', JSON.stringify(audioHistory.slice(0, 50)))
    } catch {}
  }, [audioHistory])

  const getProviderOptions = () => {
    const opts: any = { provider }

    if (provider === 'aws-polly') {
      opts.voice = voice
      opts.engine = engine
      opts.language = language
    } else if (provider === 'openai') {
      opts.voice = voice
      if (model) opts.model = model
      if (format) opts.response_format = format
      if (instructions) opts.instructions = instructions
    } else if (provider === 'elevenlabs') {
      opts.voice = voice
      if (model) opts.model = model
      if (format) opts.output_format = format
    } else if (provider === 'gemini') {
      opts.voice = voice
      if (model) opts.model = model
      if (instructions) opts.instructions = instructions
    } else if (provider === 'xai') {
      opts.voice = voice
      opts.language = language
      if (format) opts.output_format = format
    }

    if (speed !== 1.0) opts.speed = speed
    if (pitch !== 1.0) opts.pitch = pitch
    if (testMode) opts.test_mode = true
    return opts
  }

  const handleSpeak = async () => {
    if (!text.trim()) {
      setErrorMsg('Please enter some text to convert to speech.')
      setStatus('error')
      return
    }

    if (text.length > 15000) {
      setErrorMsg('Text must be less than 15,000 characters.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')
    setAudioSrcUrl(null)

    try {
      const opts = getProviderOptions()
      const result = await (window as any).puter.ai.txt2speech(text, opts)
      let audio: HTMLAudioElement

      // Handle different response types from puter.js
      if (result instanceof HTMLAudioElement) {
        audio = result
        // Store the audio src for download (it's a blob URL from puter.js)
        if (audio.src) {
          setAudioSrcUrl(audio.src)
        }
      } else if (result instanceof Blob) {
        const url = URL.createObjectURL(result)
        setAudioSrcUrl(url)
        audio = new Audio(url)
      } else if (typeof result === 'string' && result.startsWith('blob:')) {
        setAudioSrcUrl(result)
        audio = new Audio(result)
      } else {
        throw new Error('Unexpected response type from TTS. Please try again.')
      }

      audioRef.current = audio

      audio.onended = () => {
        setStatus('idle')
      }
      audio.onplay = () => setStatus('playing')
      audio.onerror = () => {
        setStatus('error')
        setErrorMsg('Failed to play audio.')
      }

      // Add to history
      setAudioHistory(prev => [{
        id: generateId(),
        text: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
        provider: providers[provider].name,
        voice: voice,
        timestamp: Date.now(),
      }, ...prev].slice(0, 50))

      audio.play()
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'An error occurred during text-to-speech conversion.')
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setStatus('idle')
  }

  const handleDownload = () => {
    if (!audioSrcUrl) {
      setErrorMsg('No audio to download. Generate speech first.')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    // Create a hidden anchor and click it to trigger download
    // Blob URLs can be downloaded directly via anchor download attribute
    const a = document.createElement('a')
    a.href = audioSrcUrl
    const ext = format ? format.replace(/_.*$/, '') : 'mp3'
    a.download = `mwj-tts-${provider}-${Date.now()}.${ext}`
    document.body.appendChild(a)
    a.click()
    // Clean up: remove the anchor after a brief delay
    setTimeout(() => {
      document.body.removeChild(a)
    }, 100)
  }

  const handleReplayHistory = (item: AudioHistoryItem) => {
    setText(item.text)
    setProvider(item.provider.toLowerCase().replace(' ', '-') as TTSProvider)
    setVoice(item.voice)
  }

  const clearHistory = () => {
    setAudioHistory([])
    localStorage.removeItem('mwj-tts-history')
  }

  const handleProviderChange = (newProvider: TTSProvider) => {
    setProvider(newProvider)
    setVoice(newProvider === 'aws-polly' ? 'Joanna' : 
           newProvider === 'openai' ? 'alloy' :
           newProvider === 'elevenlabs' ? '21m00Tcm4TlvDq8ikWAM' :
           newProvider === 'gemini' ? 'Kore' : 'eve')
    setEngine('neural')
    setLanguage('en-US')
    setModel('')
    setFormat('')
    setInstructions('')
    setErrorMsg('')
    setStatus('idle')
  }

  const copyCode = () => {
    const code = `puter.ai.txt2speech("${text}", ${JSON.stringify(getProviderOptions(), null, 2)})`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const config = providers[provider]

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <Navigation onOpenChat={() => setChatOpen(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-4">
              <Volume2 className="w-4 h-4" />
              <span>AI Text-to-Speech Studio</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-purple-200 to-gray-300 bg-clip-text text-transparent">
                Multi-Provider Voice Studio
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Convert text into natural-sounding speech using <span className="text-purple-400">5 different AI providers</span>. 
              AWS Polly, OpenAI, ElevenLabs, Gemini, or xAI — each with unique voices and capabilities.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-500 border border-white/5">Download audio</span>
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-500 border border-white/5">Speed control</span>
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-500 border border-white/5">Waveform visualizer</span>
              <span className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-500 border border-white/5">Audio history</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Provider Selector */}
      <SectionWrapper className="px-4 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {(Object.entries(providers) as [TTSProvider, ProviderConfig][]).map(([key, prov]) => (
              <motion.button
                key={key}
                onClick={() => handleProviderChange(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  provider === key
                    ? 'bg-white/10 border-white/20 text-white shadow-lg shadow-white/5'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {prov.icon}
                {prov.name}
              </motion.button>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Main TTS Interface */}
      <SectionWrapper className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Waveform Visualizer */}
          <div className={`mb-4 rounded-xl overflow-hidden border border-white/5 bg-black/40 p-4 transition-all ${
            status === 'playing' ? 'border-purple-500/20' : ''
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Audio Waveform
              </span>
              {status === 'playing' && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Playing...
                </span>
              )}
            </div>
            <AudioVisualizer isPlaying={status === 'playing'} />
          </div>

          <Card className={`bg-gradient-to-br ${config.gradient} border-white/10`}>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <CardTitle className="text-white">{config.name}</CardTitle>
                    <CardDescription className="text-gray-400">{config.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-lg transition-colors ${
                      showHistory ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Audio History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`p-2 rounded-lg transition-colors ${
                      showAdvanced ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    title="Advanced Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTestMode(!testMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      testMode
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                        : 'text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {testMode ? '🔬 Test Mode' : 'Test Mode'}
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="text-sm text-gray-400">Text to convert</label>
                  <div className="flex gap-1 flex-wrap">
                    {presetCategories.map((cat, ci) => (
                      <div key={ci} className="relative group">
                        <button
                          className="px-2 py-0.5 text-[10px] bg-white/5 hover:bg-white/10 rounded text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {cat.name}
                        </button>
                        <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-white/10 rounded-xl p-2 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[200px]">
                          {cat.presets.map((p, pi) => (
                            <button
                              key={pi}
                              onClick={() => setText(p)}
                              className="block w-full text-left px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                              {cat.name} {pi + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to convert to speech..."
                  className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/20 transition-colors"
                  maxLength={15000}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">{text.length}/15000 characters</span>
                  {provider === 'xai' && (
                    <span className="text-xs text-gray-500">
                      Supports: [pause], [laugh], {'<whisper>text</whisper>'}
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Voice Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Voice</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                  >
                    {config.voices.map((v) => (
                      <option key={v.value} value={v.value} className="bg-gray-900">{v.label}</option>
                    ))}
                  </select>
                </div>

                {/* Engine/Language/Model */}
                {config.engines && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Engine</label>
                    <select
                      value={engine}
                      onChange={(e) => setEngine(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      {config.engines.map((e) => (
                        <option key={e.value} value={e.value} className="bg-gray-900">{e.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {config.languages && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      {config.languages.map((l) => (
                        <option key={l.value} value={l.value} className="bg-gray-900">{l.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {config.models && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Model</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Default</option>
                      {config.models.map((m) => (
                        <option key={m.value} value={m.value} className="bg-gray-900">{m.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {config.formats && (
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Output Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Default</option>
                      {config.formats.map((f) => (
                        <option key={f.value} value={f.value} className="bg-gray-900">{f.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Speed & Pitch Controls */}
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-4 pt-2 border-t border-white/5"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Voice Fine-Tuning
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm text-gray-400 flex items-center gap-1">
                          <Rewind className="w-3.5 h-3.5" />
                          Speed
                        </label>
                        <span className="text-xs text-gray-500 font-mono">{speed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="2.0"
                        step="0.25"
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                        <span>0.25x</span>
                        <span>1.0x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm text-gray-400 flex items-center gap-1">
                          <Gauge className="w-3.5 h-3.5" />
                          Pitch
                        </label>
                        <span className="text-xs text-gray-500 font-mono">{pitch.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                        <span>0.5x</span>
                        <span>1.0x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Advanced Options - Instructions */}
              {(provider === 'openai' || provider === 'gemini') && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <Wand2 className="w-4 h-4" />
                    Voice Instructions
                    <ChevronDown className={`w-3 h-3 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
                  </button>
                  {showInstructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3"
                    >
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder={provider === 'openai' ? "e.g. Speak cheerfully but not too fast, emphasize key words." : "e.g. Speak in a friendly, upbeat tone."}
                        className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/20 transition-colors text-sm"
                      />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Status & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  {status === 'loading' ? (
                    <div className="flex items-center gap-2 text-amber-400">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Converting...</span>
                    </div>
                  ) : status === 'playing' ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <Music className="w-4 h-4 animate-pulse" />
                      <span className="text-sm">Playing audio</span>
                    </div>
                  ) : status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errorMsg}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm">Ready</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={status === 'loading'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Download audio"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                  {status === 'playing' ? (
                    <motion.button
                      onClick={handleStop}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <StopCircle className="w-4 h-4" />
                      Stop
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleSpeak}
                      disabled={status === 'loading'}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all ${
                        status === 'loading'
                          ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25'
                      }`}
                      whileHover={status !== 'loading' ? { scale: 1.02 } : {}}
                      whileTap={status !== 'loading' ? { scale: 0.98 } : {}}
                    >
                      <PlayCircle className="w-4 h-4" />
                      {testMode ? 'Test' : 'Speak'}
                    </motion.button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Panel */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-purple-400" />
                        <CardTitle className="text-white text-lg">Audio History</CardTitle>
                        <span className="text-xs text-gray-500">({audioHistory.length})</span>
                      </div>
                      {audioHistory.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {audioHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Music className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No audio history yet. Generate some speech!</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {audioHistory.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                            onClick={() => handleReplayHistory(item)}
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="text-sm text-gray-300 truncate">{item.text}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-purple-400">{item.provider}</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-500">{item.voice}</span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">{formatTimestamp(item.timestamp)}</span>
                              </div>
                            </div>
                            <Play className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SectionWrapper>

      {/* Provider Capabilities Section */}
      <SectionWrapper className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Provider Capabilities
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Each provider offers unique capabilities. Compare and choose what works best for your project.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.entries(providers) as [TTSProvider, ProviderConfig][]).map(([key, prov], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`bg-gradient-to-br ${prov.gradient} border-white/10 hover:border-white/20 transition-all duration-300 h-full`}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${prov.color}`}>
                        {prov.icon}
                      </div>
                      <CardTitle className="text-white text-lg">{prov.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prov.engines && (
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                          <Cpu className="w-3.5 h-3.5 text-gray-600" />
                          Engines: {prov.engines.map(e => e.label).join(', ')}
                        </li>
                      )}
                      {prov.languages && (
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                          <Globe className="w-3.5 h-3.5 text-gray-600" />
                          {prov.languages.length} languages supported
                        </li>
                      )}
                      {prov.models && (
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                          <Zap className="w-3.5 h-3.5 text-gray-600" />
                          Multiple model options
                        </li>
                      )}
                      {prov.voices && (
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                          <Mic className="w-3.5 h-3.5 text-gray-600" />
                          {prov.voices.length} voices available
                        </li>
                      )}
                      {prov.formats && (
                        <li className="flex items-center gap-2 text-sm text-gray-400">
                          <Music className="w-3.5 h-3.5 text-gray-600" />
                          Multiple output formats
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Code Example */}
      <SectionWrapper className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-900/50 to-zinc-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                Integration Code
              </CardTitle>
              <CardDescription className="text-gray-400">
                Integrate text-to-speech into your own projects with just a few lines of code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-black/60 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">
{`// Initialize with Puter.js
import 'https://js.puter.com/v2/';

// Basic TTS
const audio = await puter.ai.txt2speech("Hello world!");
audio.play();

// With provider & voice options
const audio2 = await puter.ai.txt2speech(
  "Hello! This uses a neural voice.",
  {
    provider: "${provider}",
    voice: "${voice}",${engine ? `\n    engine: "${engine}",` : ''}${language ? `\n    language: "${language}",` : ''}${speed !== 1.0 ? `\n    speed: ${speed},` : ''}${pitch !== 1.0 ? `\n    pitch: ${pitch},` : ''}${model ? `\n    model: "${model}",` : ''}${instructions ? `\n    instructions: "${instructions}",` : ''}
    test_mode: ${testMode}
  }
);
audio2.play();

// Download audio
const a = document.createElement('a');
a.href = audio.src;
a.download = 'speech.${format || 'mp3'}';
a.click();`}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      <Footer />
      <ChatComponent chatOpen={chatOpen} setChatOpen={setChatOpen} />
    </main>
  )
}