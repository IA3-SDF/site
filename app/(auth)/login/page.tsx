'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../../src/services/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isRedirecting = useRef(false)

  // Memoize redirectBasedOnRole to avoid closure issues
  const redirectBasedOnRole = useCallback(async (userId: string) => {
    if (isRedirecting.current) return
    isRedirecting.current = true

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err) {
      console.error('[LoginPage] redirect error:', err)
      isRedirecting.current = false
    }
  }, [router])

  useEffect(() => {
    if (!supabase) return

    // Vérifier session existante
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session && !isRedirecting.current) {
        await redirectBasedOnRole(data.session.user.id)
      }
    }
    checkSession()

    // Écouter les changements d'authentification
    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && !isRedirecting.current) {
        await redirectBasedOnRole(session.user.id)
      }
    })

    return () => authListener.data.subscription?.unsubscribe()
  }, [redirectBasedOnRole])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // La redirection se fera via onAuthStateChange
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-orange-500/20 rounded-lg shadow-[0_20px_50px_rgba(249,115,22,0.1)] p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          <p className="text-slate-400 mb-6">Bienvenue sur AMESCAO</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="votre@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="text-orange-400 hover:text-orange-300 font-semibold">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
