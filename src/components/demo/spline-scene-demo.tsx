'use client'

import { SplineScene } from "@/components/ui/splite"
import { Spotlight } from "@/components/ui/spotlight"
import { ArrowRight } from "lucide-react"
  
export function SplineSceneDemo() {
  return (
    <div className="w-full h-full min-h-screen bg-black relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="absolute inset-0">
        {/* Left content overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              AI Assistant Online
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
                Your Multi-Model
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed mb-8">
              Powered by <strong className="text-white">8 Google Gemini keys</strong>,{' '}
              <strong className="text-white">3 Cerebras keys</strong>, with intelligent 
              fallback across Groq & OpenRouter. Voice-enabled and built for scale.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-xl shadow-blue-500/25 flex items-center gap-2">
                Launch Assistant
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 backdrop-blur-sm">
                View Architecture
              </button>
            </div>
          </div>
        </div>

        {/* Spline Scene - Full background */}
        <div className="absolute inset-0">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
