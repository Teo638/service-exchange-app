import { useState } from 'react'
import MojePonude from '../components/dashboard/MojePonude'
import PrimljeniZahtjevi from '../components/dashboard/PrimljeniZahtjevi'
import MojiUpiti from '../components/dashboard/MojiUpiti'
import { useAuth } from '../context/AuthContext'

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('ponude')
  const { user, notifications } = useAuth()

  const tabs = [
    { id: 'ponude', label: 'Moje ponude' },
    { id: 'primljeni', label: 'Primljeni zahtjevi' },
    { id: 'upiti', label: 'Moji upiti' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Kontrolna ploča</h1>
          <p className="text-gray-500 text-sm mt-1">Dobrodošli, {user?.name}!</p>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
                {tab.id === 'primljeni' && notifications.unreadReceived > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {notifications.unreadReceived}
                  </span>
                )}

                {tab.id === 'upiti' && notifications.unreadSent > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {notifications.unreadSent}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'ponude' && <MojePonude />}
        {activeTab === 'primljeni' && <PrimljeniZahtjevi />}
        {activeTab === 'upiti' && <MojiUpiti />}
      </div>
    </div>
  )
}

export default DashboardPage