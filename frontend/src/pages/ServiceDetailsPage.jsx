import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const categoryIcons = {
  'IT': '💻', 'Edukacija': '📚', 'Prijevod': '🌐', 'Dizajn': '🎨',
  'Marketing': '📣', 'Fotografija': '📷', 'Kućni poslovi': '🔧',
  'Zdravlje': '❤️', 'Glazba': '🎵', 'Pravo': '⚖️', 'Finance': '💰', 'Sport': '⚽',
}

function ServiceDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/services/${id}`)
        setService(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSendRequest = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    setSending(true)
    setError('')
    try {
      await api.post('/requests', { service_id: id })
      setRequestSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri slanju zahtjeva.')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-500">Učitavanje...</p>
      </div>
    </div>
  )

  if (!service) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-600 font-medium">Usluga nije pronađena.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-500 hover:underline">
          Natrag na početnu
        </button>
      </div>
    </div>
  )

  const isOwner = user?.id === service.user_id

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-orange-500 text-sm transition">
            ← Natrag na pretragu
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Lijeva strana - detalji usluge */}
          <div className="lg:col-span-2 space-y-6">

            {/* Glavna kartica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {service.category && (
                <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full font-semibold">
                  {categoryIcons[service.category] || '🛠️'} {service.category}
                </span>
              )}
              <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-3">
                {service.title}
              </h1>
              <p className="text-gray-400 text-sm mb-3">
                Objavljeno: {new Date(service.created_at).toLocaleDateString('hr-HR')}
              </p>

              <div className="border-t border-gray-100 pt-6 mt-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Opis usluge
                </h2>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>

          </div>

          {/* Desna strana - cijena + akcija */}
          <div className="space-y-4">

            {/* Cijena kartica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm mb-1">Cijena usluge</p>
                <p className="text-3xl font-extrabold text-orange-500">
                  {service.price} <span className="text-2xl">KM</span>
                </p>
              </div>

              {isOwner ? (
                <div className="bg-orange-50 text-orange-600 text-center py-3 rounded-xl text-sm font-medium">
                  Ovo je vaša usluga
                </div>
              ) : requestSent ? (
                <div className="bg-green-50 text-green-600 text-center py-3 rounded-xl text-sm font-semibold">
                  ✅ Zahtjev poslan!
                </div>
              ) : (
                <>
                  {error && (
                    <p className="text-red-500 text-sm text-center mb-3">{error}</p>
                  )}
                  <button
                    onClick={handleSendRequest}
                    disabled={sending}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 disabled:opacity-50"
                  >
                    {sending ? 'Slanje...' : 'Pošalji zahtjev'}
                  </button>
                  {!user && (
                  <p className="text-center text-gray-400 text-sm mt-2">
                       Trebate račun za slanje zahtjeva
                 </p>
                   )}
                </>
              )}
            </div>

            {/* Prodavač kartica */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Ponuđač usluge
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {service.provider_name?.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-slate-900">{service.provider_name}</p>
                </div>
                  <button
                      onClick={() => navigate(`/profile/${service.user_id}`)}
                      className="w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition font-medium"
                      >
                      Pogledaj profil
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
  )
}

export default ServiceDetailsPage