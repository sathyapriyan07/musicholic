import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Music2 } from 'lucide-react'
import { PageShell, PageContent } from '@/shared/layout'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <PageShell>
      <PageContent>
        <div className="min-h-[calc(100vh-52px)] flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-[360px]">
            {/* Logo */}
            <div className="text-center mb-10">
              <Link to="/" className="inline-flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'var(--am-accent)' }}>
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Musicholic</span>
              </Link>
              <h1 className="text-[28px] font-bold tracking-tight mb-1">
                {isSignUp ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-[14px]" style={{ color: 'var(--am-text-2)' }}>
                {isSignUp ? 'Sign up to access your library' : 'Sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="px-4 py-3 rounded-xl text-[13px] text-red-400"
                  style={{ background: 'rgba(252, 60, 68, 0.1)', border: '1px solid rgba(252, 60, 68, 0.2)' }}>
                  {error}
                </div>
              )}

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  className="w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--am-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--am-border)')}
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Password"
                  className="w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none transition-colors placeholder-[var(--am-text-3)]"
                  style={{ background: 'var(--am-surface-2)', border: '1px solid var(--am-border)' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--am-accent)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--am-border)')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-3 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50 text-[15px] mt-1"
                style={{ background: 'var(--am-accent)' }}
              >
                {loading ? 'Please wait…' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                className="text-[14px] transition-colors hover:opacity-80"
                style={{ color: 'var(--am-accent)' }}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  )
}
