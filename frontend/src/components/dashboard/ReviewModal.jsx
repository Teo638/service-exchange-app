import { useState } from 'react'
import api from '../../api'

function ReviewModal({ requestId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Ruta koju je kolega naveo: POST /api/reviews
      await api.post('/reviews', {
        request_id: requestId,
        rating,
        comment
      })
      alert('Recenzija uspješno poslana!')
      onSuccess() // Ovo će zatvoriti modal i osvježiti listu
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Greška pri slanju recenzije')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Ocjenite uslugu</h3>
        <p className="text-slate-500 mb-6 text-sm">Vaša recenzija će biti javno vidljiva na oglasu.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Ocjena</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`text-3xl transition-transform active:scale-90 ${rating >= num ? 'text-yellow-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Vaš komentar</label>
            <textarea
              className="w-full border border-slate-200 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 bg-slate-50"
              placeholder="Opišite svoje iskustvo..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Slanje...' : 'Spremi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal