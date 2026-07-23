interface LoadingSkeletonProps {
  message?: string
}

export function LoadingSkeleton({ message = 'Loading...' }: LoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6">
      {/* Animated logo placeholder */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent opacity-30 animate-ping" />
      </div>

      {/* App name */}
      <div className="text-center">
        <h1 className="text-xl font-bold gradient-text">Mwijay Tech</h1>
        <p className="text-brand-muted text-sm mt-1 animate-pulse">{message}</p>
      </div>

      {/* Loading bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-brand-primary rounded-full animate-pulse"
            style={{
              height: `${12 + Math.random() * 16}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
