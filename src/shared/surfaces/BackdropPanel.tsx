interface BackdropPanelProps {
  children: React.ReactNode
  className?: string
}

export default function BackdropPanel({ children, className = '' }: BackdropPanelProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(252,60,68,0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />
      <div className="relative">{children}</div>
    </div>
  )
}
