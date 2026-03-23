import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function HomePage() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Sve')
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(6)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services')
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setServices(sorted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const categoryIcons = {
    'Sve': '🔎',
    'IT': '💻',
    'Edukacija': '📚',
    'Prijevod': '🌐',
    'Dizajn': '🎨',
    'Marketing': '📣',
    'Fotografija': '📷',
    'Kućni poslovi': '🔧',
    'Zdravlje': '❤️',
    'Glazba': '🎵',
    'Pravo': '⚖️',
    'Finance': '💰',
    'Sport': '⚽',
  }

  const topCategories = ['Sve', ...Object.entries(
    services.reduce((acc, s) => {
      if (s.category) acc[s.category] = (acc[s.category] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)
  ]

  const filtered = services.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'Sve' || s.category === activeCategory
    return matchSearch && matchCategory
  })

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-5 tracking-tight leading-tight">
          Pronađi uslugu koja ti treba
        </h1>
        <p className="text-slate-300 mb-10 text-xl max-w-xl mx-auto">
          Platforma za razmjenu usluga – brzo, jednostavno i sigurno.
        </p>
        <div className="max-w-2xl mx-auto flex shadow-2xl rounded-xl overflow-hidden">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setVisibleCount(6)
            }}
            placeholder="Što tražiš? (npr. prijevod, web dizajn, instrukcije...)"
            className="flex-1 px-6 py-5 text-gray-800 focus:outline-none text-base"
          />
          <button
            onClick={() => {
              setVisibleCount(6)
              document.getElementById('usluge').scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 font-bold transition text-base"
          >
            Pretraži
          </button>
        </div>
      </div>

      <div className="bg-white py-10 border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-gray-600 font-medium mb-6 text-xs uppercase tracking-widest">
            Popularne kategorije
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {topCategories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setVisibleCount(9)
                }}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-500 hover:-translate-y-1 border border-gray-200'
                }`}
              >
                <span className="text-4xl mb-3">
                  {categoryIcons[cat] || '🛠️'}
                </span>
                <span className="text-base">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-10" id="usluge">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {search ? `Rezultati za "${search}"` : 'Najnovije usluge'}
            </h2>
            <span className="text-gray-400 text-sm bg-white px-3 py-1 rounded-full shadow-sm">
              {filtered.length} usluga
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-500 text-lg">Učitavanje usluga...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg font-medium">Nema pronađenih usluga.</p>
              <p className="text-gray-400 mt-2">Pokušaj s drugim pojmom ili kategorijom.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map(service => (
                  <div
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
                  >
                    {service.image_url ? (
                     <img
                      src={`http://localhost:5000${service.image_url}`}
                      alt={service.title}
                      className="w-full h-48 object-cover"
                      />
                     ) : (
                     <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-5xl">
                      {categoryIcons[service.category] || '🛠️'}
                     </div>
                    )}

                    <div className="p-6">
                    {service.category && (
                      <span className="text-xs bg-orange-50 text-orange-500 px-3 py-1.5 rounded-full font-semibold">
                        {categoryIcons[service.category] || '🛠️'} {service.category}
                      </span>
                    )}
                    <h3 className="text-xl font-semibold text-slate-900 mt-3 mb-2 group-hover:text-orange-500 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-800 font-extrabold text-base">
                        {service.price} KM
                      </span>
                      {service.service_type && (
      <span style={service.service_type === 'offering' 
        ? {backgroundColor: '#f0fdf4', color: '#16a34a'} 
        : {backgroundColor: '#eff6ff', color: '#3b82f6'}}
        className="text-xs px-2 py-1 rounded-full font-semibold">
        {service.service_type === 'offering' ? 'Nudi uslugu' : 'Traži uslugu'}
      </span>
    )}
  </div>
  <div className="flex items-center justify-between">
  {service.location && (
    <span className="text-gray-700 text-xs">📍 {service.location}</span>
  )}
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
      {service.provider_name?.charAt(0).toUpperCase()}
    </div>
    <span className="text-gray-600 text-sm font-medium">
      {service.provider_name}
    </span>
  </div>
</div>
</div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-10 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm"
                  >
                    Prikaži više usluga
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="bg-slate-900 py-10 text-center">
        <p className="text-orange-400 font-bold text-lg mb-1">🤝 Service Exchange</p>
        <p className="text-slate-400 text-sm">© 2026. Sva prava pridržana.</p>
      </footer>

    </div>
  )
}

export default HomePage