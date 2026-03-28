import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { GoogleLogin } from '@react-oauth/google'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', {
        idToken: credentialResponse.credential
      })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Google prijava nije uspjela.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri prijavi.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl flex overflow-hidden">

        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl text-center font-bold text-slate-900 mb-2">Prijava</h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                placeholder="vas@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold"
            >
              Prijavi se
            </button>
          </form>
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google prijava nije uspjela.')}
              useOneTap
            />
          </div>
        </div>
        <div className="hidden md:flex w-1/2 bg-orange-500 flex-col items-center justify-center p-10 text-white">
          <p className="text-3xl font-bold mb-4 text-center">🤝 Service Exchange</p>
          <p className="text-center text-orange-100 text-sm leading-relaxed">
            Platforma za razmjenu usluga. Pronađi uslugu koja ti treba ili ponudi svoje znanje drugima.
          </p>
          <div className="mt-8 border border-orange-400 rounded-xl px-6 py-3">
            <Link to="/register" className="text-white font-semibold text-sm">
              Nemate račun? Registrirajte se →
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginPage