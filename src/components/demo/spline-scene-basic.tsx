'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { useRouter } from "next/navigation"

export function SplineSceneBasic() {
  const router = useRouter()

  return (
    <Card className="w-full h-full min-h-screen bg-black/[0.96] relative overflow-hidden border-0 rounded-none">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content - on mobile this will be smaller overlay on top of scene */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 relative z-10 flex flex-col justify-center md:min-h-0 min-h-[45vh]">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm text-blue-400 mb-4 sm:mb-6 backdrop-blur-sm w-fit">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse" />
            Mwijay Tech - Creative Digital Solutions
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
              We Build
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Digital Excellence
            </span>
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed mb-6 sm:mb-8">
            Websites, AI integration, automation, and creative tech solutions. 
            From concept to launch, we bring your digital vision to life.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button 
              onClick={() => {
                const event = new CustomEvent('openChat')
                window.dispatchEvent(event)
              }}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-semibold transition-all duration-200 shadow-xl shadow-blue-500/25 flex items-center gap-2"
            >
              Start Your Project
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button 
              onClick={() => router.push('/services')}
              className="border border-white/20 hover:border-white/40 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-semibold transition-all duration-200 backdrop-blur-sm"
            >
              View Our Work
            </button>
          </div>
        </div>

        {/* Right content - Spline 3D scene - full height on mobile */}
        <div className="w-full md:w-1/2 relative flex-1 md:flex-none" style={{ minHeight: '55vh' }}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}