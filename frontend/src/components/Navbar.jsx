import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MessageSquareMore, LayoutDashboard, LogOut } from 'lucide-react'

function Navbar() {
  const { user, logout, notifications } = useAuth()
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
              <Link to="/dashboard" className="text-gray-600 hover:text-orange-600 transition  relative">
                Dashboard
                {(notifications.unreadReceived + notifications.unreadSent) > 0 && (
                  <span className="absolute -top-3 -right-3 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {notifications.unreadReceived + notifications.unreadSent}
                  </span>
                )}
              </Link>
              <Link to="/chat" className="text-gray-600 hover:text-orange-600  relative  p-2 transition" title="Poruke">
                <MessageSquareMore size={22} strokeWidth={2} />
                {notifications.messages > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/3 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                    {notifications.messages}
                  </span>
                )}
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