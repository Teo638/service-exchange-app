import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
     setError('Lozinke se ne podudaraju.')
     return
    }
    try {
      await api.post('/auth/register', { name, email, password })
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri registraciji.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-10">
        <h2 className="text-2xl text-center font-bold text-slate-900 mb-2">Registracija</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ime</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              placeholder="Vaše ime"
              required
            />
          </div>
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
          <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Potvrdi lozinku</label>
          <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                placeholder="••••••••"
                required
              />
              </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold"
          >
            Registriraj se
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Već imaš račun?{' '}
          <Link to="/login" className="text-orange-500 hover:underline font-medium">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage