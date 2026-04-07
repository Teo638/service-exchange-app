import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function HomePage() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Sve')
  const [location, setLocation] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalServices, setTotalServices] = useState(0)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchServices = async () => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: 8,
        search: search || undefined,
        category: activeCategory === 'Sve' ? undefined : activeCategory,
        location: location || undefined,
        minPrice: minPrice !== '' ? Number(minPrice) : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
        type: serviceType || undefined
      }

      const res = await api.get('/services', { params });

      setServices(res.data.services);
      setTotalPages(res.data.pagination.totalPages);
      setTotalServices(res.data.pagination.totalServices);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Greška pri dohvaćanju usluga.";

      setError(backendMessage);
      setServices([]);
      setTotalServices(0);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchServices()
  }, [currentPage, activeCategory, serviceType])


  const categoryIcons = {
    'Sve': '🔎', 'IT': '💻', 'Edukacija': '📚', 'Prijevod': '🌐', 'Dizajn': '🎨', 'Marketing': '📣', 'Fotografija': '📷', 'Kućni poslovi': '🔧', 'Zdravlje': '❤️', 'Glazba': '🎵', 'Pravo': '⚖️', 'Finance': '💰', 'Sport': '⚽',
  }

  const topCategories = ['Sve', 'IT', 'Edukacija', 'Dizajn']

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchServices()
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">
          Pronađi uslugu koja ti treba
        </h1>
        <p className="text-slate-300 mb-10 text-xl max-w-xl mx-auto">
          Platforma za razmjenu usluga – brzo, jednostavno i sigurno.
        </p>
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto space-y-4">
          <div className="flex shadow-2xl rounded-xl overflow-hidden bg-white">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Što tražiš? (npr. prijevod, web dizajn, instrukcije...)"
              className="flex-1 px-6 py-5 text-gray-800 focus:outline-none text-base"
            />
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 font-bold transition text-base"
            >
              Pretraži
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="📍 Lokacija"
              className="px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="number"
              placeholder="Min KM"
              className="px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max KM"
              className="px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="">Svi tipovi</option>
              <option value="offering">Nudi se</option>
              <option value="seeking">Traži se</option>
            </select>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-500/20 text-red-200 py-2 px-4 rounded-lg inline-block text-sm border border-red-500/50">
            ⚠️ {error}
          </div>
        )}
      </div >

      <div className="bg-white py-10 border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-gray-600 font-medium mb-6 text-xs uppercase tracking-widest">
            Popularne kategorije
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topCategories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat)
                  setCurrentPage(1)
                }}
                className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl font-semibold transition-all duration-200 ${activeCategory === cat
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {search ? `Rezultati za "${search}"` : activeCategory !== 'Sve' ? `Kategorija: ${activeCategory}` : 'Najnovije usluge'}
            </h2>
            <span className="text-gray-500 text-sm bg-white px-3 py-1 rounded-full shadow-sm">
              {totalServices} usluga ukupno
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400 font-medium">Učitavanje usluga...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-600 text-lg font-medium">Nema pronađenih usluga.</p>
              <p className="text-gray-400 mt-2">Pokušaj s drugim pojmom ili kategorijom.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-cols-4 gap-5">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="bg-white rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100/50"
                  >
                    <div className="p-2 pb-0">
                      <div className="w-full h-28 bg-gray-50 overflow-hidden relative">
                        {service.image_url ? (
                          <img
                            src={`http://localhost:5000${service.image_url}`}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="1.5" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {service.category && (
                          <span className="text-[8px]  bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-bold uppercase">
                            {service.category}
                          </span>
                        )}
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${service.service_type === 'offering' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
                          }`}>
                          {service.service_type === 'offering' ? 'Nudi' : 'Traži'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800 group-hover:text-orange-500 transition-colors line-clamp-1 mb-1">
                        {service.title}
                      </h3>

                      <p className="text-gray-500 text-[11px] mb-4 line-clamp-1">
                        {service.description}
                      </p>

                      <div className="mt-auto pt-1 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-orange-500 font-black text-base">
                            {service.price} <span className="text-[10px] text-gray-400">KM</span>
                          </p>
                          {service.location && (
                            <p className="text-gray-500 text-[10px]">
                              📍 {service.location}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] font-bold text-slate-600">{service.provider_name}</p>
                          <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm  overflow-hidden">
                            {service.provider_avatar ? (
                              <img src={`http://localhost:5000${service.provider_avatar}`} className="w-full h-full object-cover" alt="" />
                            ) : (
                              service.provider_name?.charAt(0)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition shadow-lg disabled:opacity-30"
                  >
                    Prethodna
                  </button>
                  <span className="text-slate-600 font-bold">Stranica {currentPage} od {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 transition shadow-lg disabled:opacity-30"
                  >
                    Sljedeća
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
    </div >
  )
}

export default HomePage