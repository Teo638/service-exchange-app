import { useState, useEffect } from 'react'
import api from '../../api'

function MojiUpiti() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchRequests()
  }, [])

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
      <h2 className="text-lg font-bold text-slate-800 mb-6">Moji upiti ({requests.length})</h2>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">Niste poslali nijedan upit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-base">{req.service_title}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Davatelj usluge: <span className="font-semibold text-slate-700">{req.seller_name}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Upit poslan: {new Date(req.created_at).toLocaleDateString('hr-HR')}
                </p>
              </div>
              {statusBadge(req.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MojiUpiti