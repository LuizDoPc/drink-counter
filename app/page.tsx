'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn')
    if (isLoggedIn === 'true') {
      router.push('/counter')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login'
      const body = isRegister 
        ? { username, password, verificationCode }
        : { username, password, isRegister }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        if (isRegister) {
          setSuccess(data.message || 'Account created successfully! You can now login.')
          setIsRegister(false)
          setPassword('')
          setVerificationCode('')
        } else {
          sessionStorage.setItem('isLoggedIn', 'true')
          if (data.userId) {
            sessionStorage.setItem('userId', data.userId)
          }
          if (data.username) {
            sessionStorage.setItem('username', data.username)
          }
          router.push('/counter')
        }
      } else {
        setError(data.error || (isRegister ? 'Registration failed' : 'Invalid credentials'))
      }
    } catch (err) {
      setError(isRegister ? 'Registration failed. Please try again.' : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍺</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Beer Counter
          </h1>
          <p className="text-gray-600">
            {isRegister ? 'Create a new account' : 'Enter your credentials to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-lg"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-lg"
              required
            />
          </div>

          {isRegister && (
            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Verification Code"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:outline-none text-lg"
                required
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading 
              ? (isRegister ? 'Creating account...' : 'Logging in...') 
              : (isRegister ? 'Register 🍻' : 'Login 🍻')
            }
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
                setVerificationCode('')
              }}
              className="text-amber-600 hover:text-amber-700 text-sm font-medium"
            >
              {isRegister 
                ? 'Already have an account? Login' 
                : "Don't have an account? Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

