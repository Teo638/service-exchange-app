import { useState, useEffect } from 'react'
import api from '../../api'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../ConfirmModal'

function PrimljeniZahtjevi() {
  const { fetchNotifications } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, requestId: null })

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/received')
      console.log("Moji primljeni zahtjevi iz baze:", res.data)
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
      api.put('/requests/mark-as-read', { type: 'received' })
        .then(() => fetchNotifications())
        .catch(err => console.error("Greška pri označavanju:", err))
    }
  }, [])

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status })
      fetchRequests()
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteRequest = (id) => {
    setConfirmModal({ isOpen: true, requestId: id })
  }

  const confirmDeleteRequest = async () => {
    const id = confirmModal.requestId
    setConfirmModal({ isOpen: false, requestId: null })
    try {
      await api.delete(`/requests/${id}`);
      setRequests(requests.filter(req => req.id !== id));
      fetchNotifications();
    } catch (err) {
      console.error("Greška pri brisanju zahtjeva:", err);
      setError(err.response?.data?.message || 'Nije moguće obrisati zahtjev.')
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

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-500 font-medium">Nema primljenih zahtjeva.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isNew = req.is_read_by_seller === false;
            return (
              <div key={req.id} className={`rounded-2xl shadow-sm border p-5 transition-all ${isNew ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-base">{req.service_title}</p>
                      {isNew && (
                        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          NOVO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      Od korisnika: <span className="font-semibold text-slate-900">{req.buyer_name}</span>
                    </p>

                    <div className="mt-3 p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-left">
                      <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Detalji zahtjeva:</p>
                      <p className="text-sm text-slate-700 italic">"{req.message}"</p>
                      {req.preferred_time && (
                        <p className="text-xs text-orange-400 mt-2 font-bold">
                          ⏰ Predloženi termin: {new Date(req.preferred_time).toLocaleString('hr-HR', { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                      )}
                    </div>
                  </div>
                  {statusBadge(req.status)}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex gap-2">

                    {req.status !== 'rejected' && (
                      <button
                        onClick={() => navigate(`/chat/${req.buyer_id}`)}
                        className="border border-orange-200 text-orange-500 px-4 py-1.5 rounded-lg text-sm hover:bg-orange-50 transition font-semibold"
                      >
                        💬 Pošalji poruku
                      </button>
                    )}

                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatus(req.id, 'accepted')}
                          className="px-4 py-1.5 rounded-lg text-sm font-semibold transition border border-green-200 text-green-600 hover:bg-green-50"
                        >
                          Prihvati
                        </button>
                        <button
                          onClick={() => handleStatus(req.id, 'rejected')}
                          className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition font-semibold"
                        >
                          Odbij
                        </button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => handleStatus(req.id, 'completed')}
                          className="border border-blue-200 text-blue-500 px-4 py-1.5 rounded-lg text-sm hover:bg-blue-50 transition font-semibold"
                        >
                          Označi kao obavljeno
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteRequest(req.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Obriši zahtjev"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          message="Jeste li sigurni da želite obrisati ovaj zahtjev?"
          onConfirm={confirmDeleteRequest}
          onCancel={() => setConfirmModal({ isOpen: false, requestId: null })}
        />
      )}
    </div>
  )
}

export default PrimljeniZahtjevi