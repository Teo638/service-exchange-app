import { useState, useEffect } from 'react'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import ReviewModal from './ReviewModal'

function MojiUpiti() {
  const { fetchNotifications } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/sent')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchNotifications()

    return () => {
      api.put('/requests/mark-as-read', { type: 'sent' })
        .then(() => fetchNotifications())
        .catch(err => console.error("Greška pri označavanju:", err))
    }
  }, [])

  const handleReviewSuccess = () => {
    setSelectedRequestId(null)
    setSuccessMessage('Hvala! Recenzija je uspješno poslana.')
    fetchRequests()
    setTimeout(() => setSuccessMessage(''), 4000)
  }

  const statusBadge = (status) => {
    const map = {
      pending: { backgroundColor: '#fff7ed', color: '#f97316' },
      accepted: { backgroundColor: '#f0fdf4', color: '#16a34a' },
      rejected: { backgroundColor: '#fef2f2', color: '#ef4444' },
      completed: { backgroundColor: '#eff6ff', color: '#3b82f6' },
    }
    const labels = {
      pending: 'Na čekanju',
      accepted: 'Prihvaćeno',
      rejected: 'Odbijeno',
      completed: 'Obavljeno',
    }
    return (
      <span style={map[status]} className="text-xs px-3 py-1 rounded-full font-semibold">
        {labels[status]}
      </span>
    )
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Učitavanje...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Moji upiti ({requests.length})</h2>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-3 text-sm font-medium">
          {successMessage}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">Niste poslali nijedan upit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isNewUpdate = req.is_read_by_buyer === false;
            return (
              <div
                key={req.id}
                className={`rounded-2xl shadow-sm border p-5 flex items-center justify-between transition-all ${isNewUpdate ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100'
                  }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-slate-800 text-base">{req.service_title}</p>
                    {isNewUpdate && (
                      <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        NOVO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Davatelj usluge: <span className="font-semibold text-slate-900">{req.seller_name}</span>
                  </p>
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Moja poruka i termin:</p>
                    <p className="text-sm text-slate-600 italic">"{req.message}"</p>
                    {req.preferred_time && (
                      <p className="text-xs text-orange-400 mt-2 font-semibold">
                        📅 Termin: {new Date(req.preferred_time).toLocaleString('hr-HR', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                  {req.status === 'completed' && (
                    <button
                      onClick={() => setSelectedRequestId(req.id)}
                      className="mt-3 text-xs font-bold bg-indigo-50 text-slate-900 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-wider"
                    >
                      ⭐ Ostavi recenziju
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {statusBadge(req.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRequestId && (
        <ReviewModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  )
}

export default MojiUpiti