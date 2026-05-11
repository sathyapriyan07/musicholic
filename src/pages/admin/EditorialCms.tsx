import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save } from 'lucide-react'

interface EditorialEntry {
  id: string
  title: string
  subtitle: string
  description: string
  slug: string
  heroColor: string
  sections: EditorialSection[]
}

interface EditorialSection {
  id: string
  label: string
  type: 'text' | 'songs' | 'gallery'
  content: string
}

const inputClass = 'w-full rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]'
const inputStyle = { background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }

export default function EditorialCms() {
  const [entries, setEntries] = useState<EditorialEntry[]>(() => {
    const saved = localStorage.getItem('musicholic-editorial')
    return saved ? JSON.parse(saved) : []
  })
  const [editing, setEditing] = useState<EditorialEntry | null>(null)

  const createNew = () => {
    const entry: EditorialEntry = {
      id: crypto.randomUUID(),
      title: '',
      subtitle: '',
      description: '',
      slug: '',
      heroColor: '#1a1a2e',
      sections: [],
    }
    setEditing(entry)
  }

  const save = () => {
    if (!editing) return
    const updated = editing.slug
      ? entries.map(e => e.slug === editing.slug ? editing : e)
      : [...entries, { ...editing, slug: editing.title.toLowerCase().replace(/\s+/g, '-') }]
    setEntries(updated)
    localStorage.setItem('musicholic-editorial', JSON.stringify(updated))
    setEditing(null)
  }

  const remove = (slug: string) => {
    const updated = entries.filter(e => e.slug !== slug)
    setEntries(updated)
    localStorage.setItem('musicholic-editorial', JSON.stringify(updated))
  }

  const addSection = () => {
    if (!editing) return
    setEditing({
      ...editing,
      sections: [...editing.sections, { id: crypto.randomUUID(), label: '', type: 'text', content: '' }],
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold">Editorial Stories</h2>
        <button
          onClick={createNew}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--am-accent)', color: '#fff' }}
        >
          <Plus className="w-4 h-4" /> New Story
        </button>
      </div>

      {/* List existing */}
      <div className="space-y-3 mb-8">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}
          >
            <div>
              <p className="text-[14px] font-semibold">{entry.title || 'Untitled'}</p>
              <p className="text-[12px]" style={{ color: 'var(--am-text-2)' }}>/{entry.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(entry)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-white/10"
                style={{ background: 'var(--am-surface-2)' }}
              >
                Edit
              </button>
              <button
                onClick={() => remove(entry.slug)}
                className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" style={{ color: 'var(--am-accent)' }} />
              </button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-[14px] py-8 text-center" style={{ color: 'var(--am-text-2)' }}>
            No editorial stories yet. Create your first one.
          </p>
        )}
      </div>

      {/* Edit form */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-8"
          style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}
        >
          <h3 className="text-[18px] font-bold mb-4">
            {editing.slug ? 'Edit Story' : 'New Story'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--am-text-2)' }}>Title</label>
              <input
                className={inputClass}
                style={inputStyle}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Story title"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--am-text-2)' }}>Subtitle</label>
              <input
                className={inputClass}
                style={inputStyle}
                value={editing.subtitle}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                placeholder="Brief subtitle"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--am-text-2)' }}>Description</label>
              <textarea
                className={inputClass}
                style={inputStyle}
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Full description"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--am-text-2)' }}>Hero Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={editing.heroColor}
                  onChange={(e) => setEditing({ ...editing, heroColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                  style={{ background: 'transparent', border: 'none' }}
                />
                <span className="text-[13px]" style={{ color: 'var(--am-text-2)' }}>{editing.heroColor}</span>
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[12px] font-medium" style={{ color: 'var(--am-text-2)' }}>Sections</label>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors hover:opacity-80"
                  style={{ background: 'var(--am-surface-2)' }}
                >
                  <Plus className="w-3 h-3" /> Add Section
                </button>
              </div>
              <div className="space-y-3">
                {editing.sections.map((section, i) => (
                  <div key={section.id} className="p-3 rounded-xl" style={{ background: 'var(--am-surface-2)' }}>
                    <div className="flex gap-2 mb-2">
                      <input
                        className="flex-1 rounded-lg px-3 py-1.5 text-[13px] focus:outline-none"
                        style={{ background: 'var(--am-surface-3)', border: '1px solid var(--am-border)' }}
                        value={section.label}
                        onChange={(e) => {
                          const updated = [...editing.sections]
                          updated[i] = { ...updated[i], label: e.target.value }
                          setEditing({ ...editing, sections: updated })
                        }}
                        placeholder="Section label"
                      />
                      <select
                        className="rounded-lg px-3 py-1.5 text-[13px] focus:outline-none"
                        style={{ background: 'var(--am-surface-3)', border: '1px solid var(--am-border)' }}
                        value={section.type}
                        onChange={(e) => {
                          const updated = [...editing.sections]
                          updated[i] = { ...updated[i], type: e.target.value as any }
                          setEditing({ ...editing, sections: updated })
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="songs">Songs</option>
                        <option value="gallery">Gallery</option>
                      </select>
                      <button
                        onClick={() => {
                          const updated = editing.sections.filter((_, idx) => idx !== i)
                          setEditing({ ...editing, sections: updated })
                        }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--am-accent)' }} />
                      </button>
                    </div>
                    {section.type === 'text' && (
                      <textarea
                        className="w-full rounded-lg px-3 py-2 text-[13px] focus:outline-none"
                        style={{ background: 'var(--am-surface-3)', border: '1px solid var(--am-border)' }}
                        rows={3}
                        value={section.content}
                        onChange={(e) => {
                          const updated = [...editing.sections]
                          updated[i] = { ...updated[i], content: e.target.value }
                          setEditing({ ...editing, sections: updated })
                        }}
                        placeholder="Section content..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={save}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--am-accent)', color: '#fff' }}
            >
              <Save className="w-4 h-4" /> Save Story
            </button>
            <button
              onClick={() => setEditing(null)}
              className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--am-surface-2)' }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Published editorial routes info */}
      {entries.length > 0 && (
        <div className="p-4 rounded-2xl" style={{ background: 'var(--am-surface)', border: '1px solid var(--am-border)' }}>
          <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--am-text-2)' }}>Published Routes</p>
          <div className="space-y-1">
            {entries.map((entry) => (
              <p key={entry.id} className="text-[13px] font-mono" style={{ color: 'var(--am-accent)' }}>
                /editorial/{entry.slug}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
