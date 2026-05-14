interface PageBackdropProps {
  image?: string | null
  gradient?: string
  blur?: number
}

export default function PageBackdrop({ image, gradient, blur = 60 }: PageBackdropProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {image && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `blur(${blur}px)`,
            transform: 'scale(1.1)',
          }}
        />
      )}
      <div className="absolute inset-0" style={{
        background: gradient || 'var(--am-bg)',
        opacity: 0.85,
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(252,60,68,0.04) 0%, transparent 60%)',
      }} />
    </div>
  )
}
