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
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredHour, setPreferredHour] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0);
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
    if (!preferredDate || !preferredHour) {
      setError('Molimo odaberite datum/vrijeme.')
      return
    }
    setSending(true)
    setError('')
    try {
      await api.post('/requests', {
        service_id: id,
        message: message,
        preferred_time: new Date(`${preferredDate}T${preferredHour}`).toISOString()
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

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovo pitanje?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error("Greška pri brisanju pitanja:", err);
      alert(err.response?.data?.message || "Nije moguće obrisati pitanje.");
    }
  };


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
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-orange-500 text-sm transition">
            ← Natrag na pretragu
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {service.image_url ? (
              <img
                src={`http://localhost:5000${service.image_url}`}
                alt={service.title}
                className="w-full h-80 object-cover rounded-2xl shadow-sm border border-gray-100"
              />
            ) : (
              <div className="w-full h-80 rounded-2xl shadow-sm border border-gray-100 bg-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="1.5" />
                </svg>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {service.category && (
                <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full font-semibold">
                  {categoryIcons[service.category] || '🛠️'} {service.category}
                </span>
              )}
              <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-3  leading-tight">
                {service.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-400 text-sm mb-3 pb-3 border-b border-gray-50">
                <span>📍 {service.location || 'Lokacija nije navedena'}</span>
                <span>📅 {new Date(service.created_at).toLocaleDateString('hr-HR')}</span>
                {service.service_type && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${service.service_type === 'offering' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                    {service.service_type === 'offering' ? 'Nudi' : 'Traži'}
                  </span>
                )}
              </div>


              <div className="border-t border-gray-100 pt-3 mt-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Opis usluge
                </h2>
                <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Pitanja i odgovori
                <span className="text-sm font-normal text-gray-400">({questions.length})</span>
              </h2>

              {!isOwner && user && (
                <form onSubmit={handlePostQuestion} className="mb-8">
                  <textarea
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-gray-50 resize-none transition-all"
                    placeholder="Pitajte prodavača nešto o ovoj usluzi..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows="2"
                  />
                  <button type="submit" className="mt-2 bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-700 transition shadow-sw">
                    Postavi pitanje
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {questions.length === 0 ? (
                  <p className="text-center py-3 bg-gray-50 rounded-2xl text-gray-400 italic text-sm">Još nema pitanja za ovu uslugu.</p>
                ) : (
                  questions.map((q) => (
                    <div key={q.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100  relative group">

                        {(user?.id === q.user_id || isOwner || user?.is_admin) && (
        <button 
          onClick={() => handleDeleteQuestion(q.id)}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors p-1"
          title="Obriši pitanje"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

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
              <h2 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-tight">Recenzije korisnika ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-gray-400 italic">Još nema recenzija za ovog korisnika.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="group">
                      <div className="flex items-center mb-2 gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-orange-500 font-bold text-sm">
                          {rev.reviewer_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{rev.reviewer_name}</p>
                          <div className="flex text-yellow-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
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
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                        />
                        <input
                          type="time"
                          className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                          value={preferredHour}
                          onChange={(e) => setPreferredHour(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Vaša poruka</label>
                      <textarea
                        className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
                        rows="2"
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
                  {!isOwner && user && (
                    <button
                      onClick={() => navigate(`/chat/${service.user_id}`)}
                      className="w-full mt-3 border-2 border-slate-800 text-slate-800 py-3 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      💬 Pošalji privatnu poruku
                    </button>
                  )}
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
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-lg font-bold text-white overflow-hidden border border-gray-100 shadow-sm">
                  {service.provider_avatar ? (
                    <img
                      src={`http://localhost:5000${service.provider_avatar}`}
                      alt={service.provider_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    service.provider_name?.charAt(0).toUpperCase()
                  )}
                </div>
                <p className="font-semibold text-slate-900">{service.provider_name}</p>
              </div>
              <button
                onClick={() => navigate(`/profile/${service.user_id}`)}
                className="w-full mt-5 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition font-medium"
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