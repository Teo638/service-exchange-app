import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

function EditProfile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(user?.avatar_url ? `http://localhost:5000${user.avatar_url}` : null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('name', name)
    if (password) formData.append('password', password)
    if (avatar) formData.append('avatar', avatar)

    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser(res.data.user) // Osvježavamo podatke u Contextu
      setMessage('Profil uspješno ažuriran!')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Greška pri ažuriranju profila.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = () => {
    setConfirmModal({ isOpen: true })
  }

  const confirmDeleteAccount = async () => {
    setConfirmModal({ isOpen: false })
    setLoading(true)
    try {
      await api.delete('/auth/account')
      logout()
      navigate('/')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Greška pri brisanju računa.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Uredi profil</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500 mb-2 bg-gray-100">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Nema slike</div>
            )}
          </div>
          <input type="file" onChange={handleFileChange} className="text-xs text-gray-500" accept="image/*" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ime</label>
          <input
            type="text"
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nova lozinka (ostavi prazno ako ne mijenjaš)</label>
          <input
            type="password"
            className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {message && <p className={`text-sm ${message.includes('uspješno') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Spremanje...' : 'Spremi promjene'}
        </button>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 mt-2"
        >
          {loading ? 'Brisanje...' : 'Obriši račun'}
        </button>
      </form>

      {confirmModal.isOpen && (
        <ConfirmModal
          message="Jeste li sigurni da želite trajno obrisati svoj račun? Svi vaši oglasi, poruke i podaci bit će trajno uklonjeni."
          confirmLabel="Obriši račun"
          onConfirm={confirmDeleteAccount}
          onCancel={() => setConfirmModal({ isOpen: false })}
        />
      )}
    </div>
  )
}

export default EditProfile