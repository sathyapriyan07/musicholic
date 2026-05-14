export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-6 h-6 rounded-full border-2 border-transparent animate-spin"
        style={{ borderTopColor: 'var(--am-accent)' }}
      />
    </div>
  )
}
