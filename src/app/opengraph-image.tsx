import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Mwijay Tech — AI Voice Studio & Developer Vault'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 0 60px rgba(99,102,241,0.5)',
            }}
          >
            ⚡
          </div>

          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2px',
              textAlign: 'center',
            }}
          >
            Mwijay Tech
          </div>

          <div
            style={{
              fontSize: '24px',
              color: '#94a3b8',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            AI Voice Studio · Developer Vault · Productivity OS
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              '🎙️ Swahili-English STT',
              '🔐 Encrypted Vault',
              '💰 TZS Spending',
              '🤖 AI Memory',
              '🇹🇿 Built in Tanzania',
            ].map(pill => (
              <div
                key={pill}
                style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#a5b4fc',
                  fontSize: '16px',
                  fontWeight: 600,
                }}
              >
                {pill}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#475569',
            fontSize: '16px',
          }}
        >
          <span>Built by Davie Mwijay</span>
          <span>·</span>
          <span>Dar es Salaam, Tanzania 🇹🇿</span>
          <span>·</span>
          <span>v1.0.0</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
