export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[var(--am-accent)] animate-spin" />
    </div>
  )
}
