import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'

function MojePonude() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '' })
  const [error, setError] = useState('')
  const { user } = useAuth()

  const categories = ['IT', 'Edukacija', 'Prijevod', 'Dizajn', 'Marketing', 'Fotografija', 'Kućni poslovi', 'Zdravlje', 'Glazba', 'Pravo', 'Finance', 'Sport']

  const fetchMyServices = async () => {
    try {
      const res = await api.get('/services')
      const myServices = res.data.filter(s => s.user_id === user.id)
      setServices(myServices)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyServices()
  }, [])

  const handleSubmit = async () => {
    setError('')
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, form)
      } else {
        await api.post('/services', form)
      }
      setShowForm(false)
      setEditingService(null)
      setForm({ title: '', description: '', price: '', category: '' })
      fetchMyServices()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška.')
    }
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setForm({ title: service.title, description: service.description, price: service.price, category: service.category })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovu uslugu?')) return
    try {
      await api.delete(`/services/${id}`)
      fetchMyServices()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Učitavanje...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Moje ponude ({services.length})</h2>
        <button
          onClick={() => { setShowForm(true); setEditingService(null); setForm({ title: '', description: '', price: '', category: '' }) }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
        >
          + Dodaj novu
        </button>
      </div>

      {/* Forma */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4">{editingService ? 'Uredi uslugu' : 'Nova usluga'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naziv</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                placeholder="Naziv usluge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opis</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                rows={3}
                placeholder="Opišite svoju uslugu..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cijena (KM)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategorija</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                >
                  <option value="">Odaberi kategoriju</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition">
                {editingService ? 'Spremi izmjene' : 'Dodaj uslugu'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingService(null) }} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Odustani
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista usluga */}
      {services.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 font-medium">Nemate objavljenih usluga.</p>
          <p className="text-gray-400 text-sm mt-1">Kliknite "Dodaj novu" za početak.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{service.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{service.category} · {service.price} KM</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(service)} className="border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Uredi
                </button>
                <button onClick={() => handleDelete(service.id)} className="border border-red-200 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition">
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MojePonude