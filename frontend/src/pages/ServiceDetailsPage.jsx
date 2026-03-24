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
  const [reviews, setReviews] = useState([])
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [answerTexts, setAnswerTexts] = useState({})
  const [requestSent, setRequestSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] =  useState('')
  const [preferredTime, setPreferredTime] = useState('')

 useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/services/${id}`)
        setService(res.data)
        const reviewsRes = await api.get(`/reviews/user/${res.data.user_id}`)
        setReviews(reviewsRes.data)
        const questionsRes = await api.get(`/questions/${id}`)
        setQuestions(questionsRes.data)
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
    if (!message || !preferredTime) {
    setError('Molimo popunite poruku i odaberite datum/vrijeme.')
    return
    }
    setSending(true)
    setError('')
    try {
      await api.post('/requests', { 
        service_id:id,
        message: message,
        preferred_time:  new Date(preferredTime).toISOString()
      })
      setRequestSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri slanju zahtjeva.')
      console.error("Backend error detalji:", err.response?.data)
    } finally {
      setSending(false)
    }
  }

  const handlePostQuestion = async (e) => {
  e.preventDefault()
  if (!newQuestion.trim()) return
  try {
    await api.post('/questions', { service_id: id, question: newQuestion })
    setNewQuestion('')
    const res = await api.get(`/questions/${id}`) 
    setQuestions(res.data)
  } catch (err) {
    console.error(err)
  }
}

const handlePostAnswer = async (questionId) => {
  const answer = answerTexts[questionId]
  if (!answer?.trim()) return
  try {
    await api.put(`/questions/${questionId}/answer`, { answer })
    setAnswerTexts({ ...answerTexts, [questionId]: '' })
    const res = await api.get(`/questions/${id}`) 
    setQuestions(res.data)
  } catch (err) {
    console.error(err)
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

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-orange-500 text-sm transition">
            ← Natrag na pretragu
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">

          <div className="lg:col-span-2 space-y-6">
            {service.image_url && (
          <img
             src={`http://localhost:5000${service.image_url}`}
             alt={service.title}
             className="w-full h-64 object-cover rounded-2xl shadow-sm"
             />
          )}

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
                Datum objave: {new Date(service.created_at).toLocaleDateString('hr-HR')}
              </p>
              <div className="flex gap-3 mb-3">
  {service.location && (
    <span className="text-sm text-gray-700">📍 {service.location}</span>
  )}
  {service.service_type && (
    <span style={service.service_type === 'offering'
      ? {backgroundColor: '#f0fdf4', color: '#16a34a'}
      : {backgroundColor: '#eff6ff', color: '#3b82f6'}}
      className="text-xs px-2 py-1 rounded-full font-semibold">
      {service.service_type === 'offering' ? 'Nudi uslugu' : 'Traži uslugu'}
    </span>
  )}
</div>

              <div className="border-t border-gray-100 pt-6 mt-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Opis usluge
                </h2>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
  <h2 className="text-xl font-bold text-slate-800 mb-6">Pitanja i odgovori</h2>
  
  {!isOwner && user && (
    <form onSubmit={handlePostQuestion} className="mb-8">
      <textarea
        className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-gray-50 resize-none"
        placeholder="Pitajte prodavača nešto o ovoj usluzi..."
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        rows="3"
      />
      <button type="submit" className="mt-2 bg-slate-800 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-slate-700 transition">
        Postavi pitanje
      </button>
    </form>
  )}

  <div className="space-y-6">
    {questions.length === 0 ? (
      <p className="text-gray-400 italic">Još nema pitanja za ovu uslugu.</p>
    ) : (
      questions.map((q) => (
        <div key={q.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div className="flex gap-3">
            <span className="font-black text-orange-500 text-lg">P:</span>
            <div className="flex-1">
              <p className="text-slate-800 font-medium">{q.question}</p>
              <p className="text-[10px] text-gray-400 uppercase mt-1">
                {new Date(q.created_at).toLocaleDateString('hr-HR')}
              </p>
            </div>
          </div>

          {q.answer ? (
            <div className="mt-4 ml-6 pl-4 border-l-2 border-orange-200 flex gap-3">
              <span className="font-black text-green-600">O:</span>
              <p className="text-slate-600 text-sm italic">{q.answer}</p>
            </div>
          ) : (
            isOwner && (
              <div className="mt-4 ml-8">
                <input
                  type="text"
                  className="w-full border-b border-gray-300 bg-transparent py-2 focus:border-orange-500 outline-none text-sm"
                  placeholder="Napišite odgovor..."
                  value={answerTexts[q.id] || ''}
                  onChange={(e) => setAnswerTexts({ ...answerTexts, [q.id]: e.target.value })}
                />
                <button onClick={() => handlePostAnswer(q.id)} className="mt-2 text-orange-600 font-bold text-xs hover:text-orange-800 transition">
                  POŠALJI ODGOVOR
                </button>
              </div>
            )
          )}
        </div>
      ))
    )}
  </div>
</div>

<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Recenzije korisnika ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 italic">Još nema recenzija za ovog korisnika.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-gray-50 pb-6 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-slate-800">{rev.reviewer_name}</p>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                <div className="space-y-3 mb-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Kada trebate uslugu?</label>
                      <input 
                        type="datetime-local" 
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Vaša poruka</label>
                      <textarea 
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
                        rows="3"
                        placeholder="Napišite detalje prodavaču..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </div>
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