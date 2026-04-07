import { useState, useEffect } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Users, BarChart3, ShieldAlert, Trash2, UserPlus, UserMinus, PieChart } from 'lucide-react'

function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [extendedStats, setExtendedStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/')
      return
    }
    fetchAdminData()
  }, [user])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, extendedRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/stats/extended')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setExtendedStats(extendedRes.data)
    } catch (err) {
      console.error("Greška pri dohvaćanju admin podataka:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('TRAJNO BRISANJE: Jeste li sigurni? Svi oglasi i podaci ovog korisnika bit će obrisani.')) return
    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers(users.filter(u => u.id !== userId))
      fetchAdminData()
    } catch (err) {
      alert(err.response?.data?.message || "Greška pri brisanju korisnika.")
    }
  }

  const handleToggleRole = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`)
      alert(res.data.message)
      const usersRes = await api.get('/admin/users')
      setUsers(usersRes.data)
    } catch (err) {
      alert("Greška pri promjeni uloge.")
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-500">Učitavanje admin panela...</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-slate-900 text-white py-12 px-4 mb-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <ShieldAlert className="text-red-500" size={32} /> Admin Kontrolna Ploča
        </h1>
        <p className="text-slate-400 mt-2">Dobrodošli natrag, {user?.name}. Upravljajte sustavom s jednog mjesta.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Tab Navigacija */}
        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'stats' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 size={18} /> Statistika
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={18} /> Korisnici
          </button>
        </div>

        {activeTab === 'stats' && stats && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Ukupno korisnika" value={stats.totalUsers} color="blue" icon={<Users />} />
              <StatCard title="Aktivni oglasi" value={stats.totalServices} color="orange" icon={<BarChart3 />} />
              <StatCard title="Ukupno zahtjeva" value={stats.totalRequests} color="green" icon={<PieChart />} />
              <StatCard title="Javna pitanja" value={stats.totalQuestions} color="purple" icon={<ShieldAlert />} />
            </div>

            {extendedStats && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <PieChart size={20} className="text-orange-500" /> Oglasi po kategorijama
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {extendedStats.categories?.map((cat, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-400 font-bold uppercase">{cat.category || 'Ostalo'}</p>
                      <p className="text-xl font-black text-slate-700">{cat.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-400 font-bold">
                  <tr>
                    <th className="px-6 py-4 text-center">ID</th>
                    <th className="px-6 py-4">Korisnik</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Registriran</th>
                    <th className="px-6 py-4 text-right">Akcije</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/30 transition">
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{u.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.is_admin ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.is_admin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{u.email}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString('hr-HR')}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleRole(u.id)}
                          className={`p-2 rounded-lg transition-colors ${u.is_admin ? 'text-orange-500 hover:bg-orange-50' : 'text-blue-500 hover:bg-blue-50'}`}
                          title={u.is_admin ? "Ukloni admin ovlasti" : "Postavi za admina"}
                        >
                          {u.is_admin ? <UserMinus size={20} /> : <UserPlus size={20} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Obriši korisnika"
                          disabled={u.id === user.id}
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-10 text-center text-gray-400">Nema pronađenih korisnika.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color, icon }) {
  const colors = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    orange: 'border-orange-500 text-orange-600 bg-orange-50',
    green: 'border-green-500 text-green-600 bg-green-50',
    purple: 'border-purple-500 text-purple-600 bg-purple-50',
  }
  return (
    <div className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white transition-transform hover:scale-105 ${colors[color]}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70">{title}</p>
        <div className="opacity-20">{icon}</div>
      </div>
      <p className="text-4xl font-black">{value}</p>
    </div>
  )
}

export default AdminPage