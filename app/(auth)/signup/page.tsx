'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../src/services/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isRedirecting = useRef(false)

  useEffect(() => {
    if (!supabase) return

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session && !isRedirecting.current) {
        isRedirecting.current = true
        router.push('/')
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && !isRedirecting.current) {
        isRedirecting.current = true
        router.push('/')
      }
    })

    return () => subscription?.unsubscribe()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.password !== formData.passwordConfirm) {
        throw new Error('Les mots de passe ne correspondent pas')
      }

      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (signupError) throw signupError

      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              name: formData.name,
              surname: formData.surname,
              email: formData.email,
              role: 'member',
            })

          if (profileError) {
            console.error('[SignupPage] Profile upsert failed:', profileError)
            
            // Rollback: Delete the user that was just created
            try {
              await supabase.auth.admin.deleteUser(authData.user.id)
              console.log('[SignupPage] User rollback successful')
            } catch (deleteErr) {
              console.error('[SignupPage] User rollback failed - manual cleanup needed:', deleteErr)
              throw new Error('Profile création échouée et nettoyage impossible. Veuillez contacter le support.')
            }
            
            throw new Error('Erreur lors de la création du profil. Compte supprimé.')
          }
          
          // La redirection se fera via onAuthStateChange (SIGNED_IN)
        } catch (err: any) {
          // Profile creation or rollback error
          console.error('[SignupPage] Profile or rollback error:', err)
          throw err
        }
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-orange-500/20 rounded-lg shadow-[0_20px_50px_rgba(249,115,22,0.1)] p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
          <p className="text-slate-400 mb-6">Rejoignez AMESCAO</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prénom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Jean"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nom</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Dupont"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="jean@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
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
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-orange-400 hover:text-orange-300 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
