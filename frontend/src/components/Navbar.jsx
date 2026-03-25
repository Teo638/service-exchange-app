import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-slate-900">
          🤝 Service Exchange
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-orange-600 transition">
            Početna
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-orange-600 transition">
                Dashboard
              </Link>
              <Link to="/chat" className="text-gray-600 hover:text-orange-600">
                Poruke
              </Link>
              <span className="text-gray-500 text-sm">Zdravo, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">
                Prijava
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar