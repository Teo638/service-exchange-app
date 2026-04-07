import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

const categoryIcons = {
  'IT': '💻', 'Edukacija': '📚', 'Prijevod': '🌐', 'Dizajn': '🎨',
  'Marketing': '📣', 'Fotografija': '📷', 'Kućni poslovi': '🔧',
  'Zdravlje': '❤️', 'Glazba': '🎵', 'Pravo': '⚖️', 'Finance': '💰', 'Sport': '⚽',
}

function ProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        setLoading(true);
        const servicesRes = await api.get('/services')
        const allServices = servicesRes.data.services || [];
        const userServices = allServices.filter(s => s.user_id === parseInt(id));
        setServices(userServices);
        const reviewsRes = await api.get(`/reviews/user/${id}`)
        setReviews(reviewsRes.data);
        if (userServices.length > 0) {
          const detailRes = await api.get(`/services/${userServices[0].id}`)
          setProfile({
            name: userServices[0].provider_name,
            email: detailRes.data.provider_email,
            avatar: userServices[0].provider_avatar
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-gray-500">Učitavanje...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-600 font-medium">Profil nije pronađen.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-orange-500 hover:underline">
          Natrag na početnu
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-orange-500 text-sm transition">
            ← Natrag
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-xl font-bold text-slate-900">{profile.name}</h1>
              <p className="text-gray-400 text-sm mt-1">Član platforme</p>

              <div className="flex items-center justify-center gap-1 mt-2">
                <span className="text-yellow-400">★</span>
                <span className="font-bold text-slate-700">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : 0}
                </span>
                <span className="text-gray-400 text-sm">({reviews.length} recenzija)</span>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4 text-left space-y-3">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-sm text-gray-600">{services.length} objavljenih usluga</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Recenzije ({reviews.length})
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-4 text-gray-400 italic text-sm">
                  Korisnik još nema ocjena.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(rev => (
                    <div key={rev.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{rev.reviewer_name}</p>
                          <div className="flex text-yellow-400 text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold">
                          {new Date(rev.created_at).toLocaleDateString('hr-HR')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Usluge korisnika {profile.name}
            </h2>

            {services.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">Korisnik nema objavljenih usluga.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        {service.category && (
                          <span className="text-xs bg-orange-50 text-orange-500 px-2 py-1 rounded-full font-semibold">
                            {categoryIcons[service.category] || '🛠️'} {service.category}
                          </span>
                        )}
                        <p className="font-semibold text-slate-800 mt-2">{service.title}</p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{service.description}</p>
                      </div>
                      <p className="text-orange-500 font-bold text-lg ml-4 whitespace-nowrap">{service.price} KM</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}



export default ProfilePage