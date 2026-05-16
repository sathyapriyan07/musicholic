export default function AmbientGradient() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{
      background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--am-accent-rgb, 99,102,241), 0.12) 0%, transparent 60%)',
    }} />
  )
}
