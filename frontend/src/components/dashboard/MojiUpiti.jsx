import { useState, useEffect } from 'react'
import api from '../../api'

function MojiUpiti() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
  }, [])


  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/reviews', {
        request_id: selectedRequestId,
        rating,
        comment
      })
      alert('Hvala! Recenzija je uspješno poslana.')
      setSelectedRequestId(null)
      setComment('')
      setRating(5)
      fetchRequests()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Greška pri slanju recenzije.')
    } finally {
      setSubmitting(false)
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
                  Davatelj usluge: <span className="font-semibold text-slate-900">{req.seller_name}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Upit poslan: {new Date(req.created_at).toLocaleDateString('hr-HR')}
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Detalji mog upita:</p>
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
          ))}
        </div>
      )}

      {selectedRequestId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Ocjenite uslugu</h3>
            <p className="text-slate-500 mb-6 text-sm">Podijelite svoje iskustvo s ostalim korisnicima.</p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vaša ocjena</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`text-3xl transition-all ${rating >= num ? 'text-yellow-400 scale-110' : 'text-slate-200 hover:text-slate-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Komentar</label>
                <textarea
                  className="w-full border border-slate-200 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50 resize-none"
                  placeholder="Što vam se svidjelo, a što ne?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestId(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Slanje...' : 'Spremi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MojiUpiti