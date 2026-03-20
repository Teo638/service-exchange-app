import { useState, useEffect } from 'react'
import api from '../../api'

function PrimljeniZahtjevi() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/received')
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status })
      fetchRequests()
    } catch (err) {
      console.error(err)
    }
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
      <h2 className="text-lg font-bold text-slate-800 mb-6">Primljeni zahtjevi ({requests.length})</h2>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">Nema primljenih zahtjeva.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-800 text-base">{req.service_title}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Od korisnika: <span className="font-semibold text-slate-700">{req.buyer_name}</span>
                  </p>
                </div>
                {statusBadge(req.status)}
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleStatus(req.id, 'accepted')}
                    style={{border: '1px solid #86efac', color: '#22c55e'}}
                    onMouseEnter={e => e.target.style.backgroundColor = '#f0fdf4'}
                    onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                    className="px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                  >
                    Prihvati
                  </button>
                  <button
                    onClick={() => handleStatus(req.id, 'rejected')}
                    className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition font-semibold"
                  >
                    Odbij
                  </button>
                </div>
              )}
              {req.status === 'accepted' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleStatus(req.id, 'completed')}
                    className="border border-blue-200 text-blue-500 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50 transition font-semibold"
                  >
                    Označi kao obavljeno
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PrimljeniZahtjevi