import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder?: string
  label: string
}

export default function SearchableSelect({ value, onChange, options, placeholder, label }: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  )
  const displayValue = selected ? selected.label : query || ''

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative">
      <div
        className={cn(
          'w-full rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors cursor-pointer flex items-center justify-between',
          open ? 'ring-1 ring-[var(--am-accent)]' : ''
        )}
        style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
        onClick={() => {
          setOpen(!open)
          if (!open) setQuery('')
        }}
      >
        <span className={cn(!selected && 'text-[var(--am-text-3)]')}>
          {selected ? displayValue : (placeholder || label)}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform flex-shrink-0', open && 'rotate-180')} style={{ color: 'var(--am-text-3)' }} />
      </div>

      {open && (
        <div
          className="absolute z-[100] w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
        >
          <div className="p-2">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none"
                style={{ background: 'var(--am-surface-3)', border: '1px solid var(--am-border)' }}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--am-text-3)] hover:text-white"
                  onClick={() => setQuery('')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    'w-full text-left px-4 py-2 text-[13px] transition-colors',
                    value === opt.value
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-[var(--am-text-2)] hover:text-white hover:bg-white/5'
                  )}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-[13px] text-center" style={{ color: 'var(--am-text-3)' }}>
                No results
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
